'use strict';

function isOwnProperty(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = isOwnProperty;
