'use strict';

function isTempQueue(queue) {
	return [undefined, '', null].includes(queue);
}

module.exports = isTempQueue;
