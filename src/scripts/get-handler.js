'use strict';

const matchTopicPattern = require('./match-topic-pattern.js');

function getHandler(bindings, {exchange, routingKey}) {
	const item = bindings.find((x) =>
		(exchange === x.exchange && matchTopicPattern(routingKey, x.routingKey)));
	return item.handler;
}

module.exports = getHandler;
