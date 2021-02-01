'use strict';

const amqplib = require('amqplib');
const EventEmitter = require('events');
const scripts = require('./scripts/index.js');
const defaults = require('./defaults/index.js');

class MessageQueue {
	constructor(config) {
		scripts.validateConfig(config);
		this._appId = config.appId;
		this._url = config.url;
		this._queue = config.queue || '';
		this._bindings = config.bindings || [];
		this._exchanges = [
			['alternate', 'fanout', {durable: true, internal: true}],
			['deadletter', 'fanout', {durable: true, internal: true}],
			['rpc', 'topic', {durable: true, alternateExchange: 'alternate'}],
			['evt', 'topic', {durable: true, alternateExchange: 'alternate'}],
			['cmd', 'topic', {durable: true, alternateExchange: 'alternate'}]
		]; // [exchange, type, options = {durable: true, internal: false, autoDelete: false, alternateExchange: undefined}]
		this._connection = null;
		this._pubChannel = null;
		this._subChannel = null;
		this._consumerTag = null;
		this._retries = 0;
		this._isRunning = false;
		this._isShuttingDown = false;
		this._isProcessingMsg = false;
	}

	init() {
		return this._createConnection()
			.then(this._createPublisher.bind(this))
			.then(this._createSubscriber.bind(this))
			.then(this._handleDisconnections.bind(this))
			.then(() => {
				this._retries = 0;
				this._isRunning = true;
				console.log('[MESSAGEQUEUE] connected.');
			})
			.catch(this._reconnect.bind(this));
	}

	rpc(routingKey, content, options) {
		options = {
			replyTo: 'amq.rabbitmq.reply-to',
			correlationId: scripts.generateUuid(),
			expiration: '12000',
			priority: 2,
			persistent: false,
			...options
		};
		return scripts.retryPromise(this._publish.bind(this))('rpc', routingKey, content, options)
			.then(() => new Promise((resolve, reject) => {
				const timeout = setTimeout(() => reject(new Error('[MESSAGEQUEUE] rpc timeout.')), parseInt(options.expiration, 10));
				this._pubChannel.responseEmitter.once(options.correlationId, (msg) => {
					clearTimeout(timeout);
					resolve(scripts.decodeMessage(msg));
				});
			}));
	}

	evt(routingKey, content, options) {
		return scripts.retryPromise(this._publish.bind(this))('evt', routingKey, content, options);
	}

	cmd(routingKey, content, options) {
		return scripts.retryPromise(this._publish.bind(this))('cmd', routingKey, content, options);
	}

	_createConnection() {
		// heartbeat (sec): If the client fails to read data from the connection for two successive intervals, the connection will emit an error and close
		return amqplib.connect(`${this._url}?heartbeat=60`)
			.then((conn) => this._connection = conn);
	}

	_createPublisher() {
		return scripts.retryPromise({obj: this._connection, call: 'createConfirmChannel'})()
			.then((ch) => this._pubChannel = ch)
			.then(() => this._pubChannel.responseEmitter = new EventEmitter())
			.then(() => this._pubChannel.responseEmitter.setMaxListeners(0))
			.then(() => this._pubChannel.consume('amq.rabbitmq.reply-to', (msg) => {
				this._pubChannel.responseEmitter.emit(msg.properties.correlationId, msg);
			}, {noAck: true}));
	}

	_createSubscriber() {
		if (!scripts.hasSubscriber(this._bindings)) return Promise.resolve();
		return scripts.retryPromise({obj: this._connection, call: 'createChannel'})()
			.then((ch) => this._subChannel = ch)
			.then(this._assertExchanges.bind(this))
			.then(this._createQueue.bind(this));
	}

	_assertExchanges() {
		return Promise.all(
			this._exchanges.map((exchange) =>
				this._subChannel.assertExchange(...exchange)));
	}

	_createQueue() {
		let queue;
		return this._subChannel.assertQueue(this._queue, scripts.getQueueOptions(this._queue, this._bindings))
			.then((q) => queue = q.queue)
			.then(() => Promise.all(
				this._bindings.map((binding) =>
					this._subChannel.bindQueue(queue, binding.exchange, binding.routingKey))))
			.then(() => this._subChannel.prefetch(1))
			.then(() => this._subChannel.consume(queue, this._processMsg.bind(this), {noAck: false}))
			.then((tag) => this._consumerTag = tag);
	}

	_processMsg(msg) {
		if (!msg) return; // If the consumer is cancelled by RabbitMQ, the message callback will be invoked with null.
		this._isProcessingMsg = true;
		const handler = scripts.getHandler(this._bindings, msg.fields);
		handler(scripts.decodeMessage(msg), async (err, response, options = {}) => {
			try {
				if (err) return this._subChannel.nack(msg, false, !msg.fields.redelivered ? true : false);
				if (scripts.isRpc(msg)) {
					if (!response) return this._subChannel.nack(msg, false, !msg.fields.redelivered ? true : false);
					const {expiration, correlationId, replyTo} = msg.properties;
					options = {contentType: 'application/json', expiration, correlationId, ...options};
					await scripts.retryPromise(this._publish.bind(this))('', replyTo, response, options);
				}
				this._subChannel.ack(msg);
				this._isProcessingMsg = false;
			} catch (e) {
				this._isProcessingMsg = false;
				this._connection.close();
			}
		}, this);
	}

	_createFakeChannel() {
		this._pubChannel = {
			publish: () => Promise.reject(new Error('[MESSAGEQUEUE] message failed - pubChannel down.'))
		};
	}

	_handleDisconnections() {
		this._connection.on('error', (e) => this._reconnect(e));
		return this._connection.on('close', (e) => this._reconnect(e));
	}

	_reconnect(e) {
		this._isRunning = false;
		if (this._isShuttingDown) return Promise.resolve();
		console.log('[MESSAGEQUEUE] disconnected, attempting to reconnect.', {error: e.toString()});
		return Promise.resolve()
			.then(() => this._retries++)
			.then(() => this._createFakeChannel.bind(this)())
			.then(() => scripts.delayPromise(this._retries * this._retries * 250))
			.then(() => this.init.bind(this)());
	}

	_publish(exchange, routingKey, content, options) {
		options = {...defaults.getPublishOptions(this._appId), ...options};
		const encodedContent = scripts.encodeContent(content, options.contentType);
		return new Promise((resolve, reject) => {
			this._pubChannel.publish(exchange, routingKey, encodedContent, options, (err, ok) => {
				if (err === null) resolve();
				else reject(new Error('[MESSAGEQUEUE] _publish() error'));
			});
		});
	}

	ping() {
		return scripts.retryPromise(() => this._isRunning ? Promise.resolve() : Promise.reject(new Error('[MESSAGEQUEUE] ping failed')))();
	}

	shutdown() {
		return Promise.resolve()
			.then(() => this._isShuttingDown = true)
			.then(() => this._consumerTag ? this._subChannel.cancel(this._consumerTag.toString()) : Promise.resolve())
			.then(() => scripts.retryPromise(() => !this._isProcessingMsg ?
				Promise.resolve() : Promise.reject(new Error()), {maxRetries: 5})())
			.then(() => this._connection.close())
			.then(() => console.log('[MESSAGEQUEUE] shutdown complete.'));
	}
}

module.exports = MessageQueue;
