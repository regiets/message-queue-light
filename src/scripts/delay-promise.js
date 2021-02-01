'use strict';

function delayPromise(t, v) {
	return new Promise((resolve) =>
		setTimeout(resolve.bind(null, v), t));
}

module.exports = delayPromise;
