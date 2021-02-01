'use strict';

function encodeContent(content, contentType) {
	if (contentType === 'application/json') return Buffer.from(JSON.stringify(content));
	return Buffer.from(JSON.stringify(content));
}

module.exports = encodeContent;
