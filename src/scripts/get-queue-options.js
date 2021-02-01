'use strict';

const isTempQueue = require('./is-temp-queue.js');
const isPriorityQueue = require('./is-priority-queue.js');

function getQueueOptions(queue, bindings) {
	const defaultOptions = {durable: true, deadLetterExchange: 'deadletter'};
	const tempOptions = {exclusive: true, autoDelete: true, durable: false};
	const priorityOptions = {maxPriority: 2};
	if (isTempQueue(queue)) return {...defaultOptions, ...tempOptions};
	if (isPriorityQueue(bindings)) return {...defaultOptions, ...priorityOptions};
	return defaultOptions;
}

module.exports = getQueueOptions;
