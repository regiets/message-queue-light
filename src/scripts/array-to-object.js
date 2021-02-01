'use strict';

function arrayToObject(arr, keyField) {
	return Object.assign({}, ...arr.map((item) => ({[item[keyField]]: item})));
}

module.exports = arrayToObject;
