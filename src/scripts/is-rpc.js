'use strict';

function isRpc(msg) {
	return msg && msg.fields && msg.fields.exchange &&
		msg.fields.exchange === 'rpc';
}

module.exports = isRpc;
