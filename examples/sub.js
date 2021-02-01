'use strict';

const Mq = require('../src/message-queue.js');
const mq = new Mq({
	url: 'amqp://localhost',
	queue: 'rpc_svc',
	bindings: [
		{exchange: 'rpc', routingKey: 'rpc.graphql', handler: rpcWorker},
		{exchange: 'evt', routingKey: 'evt1', handler: evtWorker},
		{exchange: 'cmd', routingKey: 'cmd1', handler: cmdWorker}
	]
});
let i = 0;
function rpcWorker(msg, cb, mq) {
	console.log(msg.content);
	setTimeout(() => cb({data: msg.content.data + ' rpcWorker ' + i++}), 1000);
}

function evtWorker(msg, cb, mq) {
	console.log(msg.content);
	i++;
	setTimeout(() => cb(true), 1000);
}

function cmdWorker(msg, cb, mq) {
	console.log(msg.content);
	i++;
	setTimeout(() => cb(true), 1000);
}

mq.init();
