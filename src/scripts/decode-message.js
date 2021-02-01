'use strict';

const decodeContent = require('./decode-content.js');

function decodeMessage(msg) {
	return {...msg, content: decodeContent(msg.content, msg.properties.contentType)};
}

module.exports = decodeMessage;
