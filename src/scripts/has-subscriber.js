'use strict';

const isArray = require('./is-array.js');

function hasSubscriber(bindings) {
	return bindings &&
		isArray(bindings) &&
		bindings.length > 0;
}

module.exports = hasSubscriber;
