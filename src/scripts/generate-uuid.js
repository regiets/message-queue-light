'use strict';

function generateUuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
		const random = Math.random() * 16 | 0;
		const variable = char == 'x' ? random : (random & 0x3 | 0x8);
		return variable.toString(16);
	});
}

module.exports = generateUuid;
