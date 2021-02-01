'use strict';

function decodeContent(content, contentType) {
	if (contentType === 'application/json') return JSON.parse(content);
	return JSON.parse(content);
}

module.exports = decodeContent;
