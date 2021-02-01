'use strict';

const {ObjectId} = require('bson');

const getPublishOptions = (appId) => ({
	contentType: 'application/json',
	priority: 1,
	persistent: true,
	timestamp: Date.now(),
	messageId: new ObjectId().toString(),
	appId
});

module.exports = getPublishOptions;
