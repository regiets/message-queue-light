'use strict';

const isArray = require('./is-array.js');
const arrayToObject = require('./array-to-object.js');

function isPriorityQueue(bindings) {
	if (isArray(bindings)) {
		const temp = arrayToObject(bindings, 'exchange');
		if (temp.rpc && (temp.cmd || temp.evt)) return true;
	}
	return false;
}

module.exports = isPriorityQueue;
