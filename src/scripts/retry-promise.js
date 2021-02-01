'use strict';

const delayPromise = require('./delay-promise.js');

// promiseFunction can be a function or {obj, call}
function retryPromise(promiseFunction, options) {
	options = {maxRetries: 3, delayFunction: (i) => i * 250, ...options};
	let i = 0;
	return function repeat(...args) {
		return delayPromise(options.delayFunction(i))
			.then(() => (typeof promiseFunction === 'function') ?
				promiseFunction(...args) :
				promiseFunction.obj[promiseFunction.call](...args))
			.catch((err) => {
				i++;
				return (i < options.maxRetries) ? repeat(...args) : Promise.reject(err);
			});
	};
}

module.exports = retryPromise;
