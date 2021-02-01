'use strict';

// use: matchTopicPattern('evt.company.created', 'evt.#') - returns true
function matchTopicPattern(actual, expected) {
	if (actual === expected) return true;
	const regexString = '^' + expected.replace(/\*/g, '([^.]+)').replace(/#/g, '([^.]+\.?)+') + '$'; // eslint-disable-line
	return actual.search(regexString) !== -1;
}

module.exports = matchTopicPattern;
