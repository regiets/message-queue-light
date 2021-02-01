'use strict';

const isArray = require('./is-array.js');
const isOwnProperty = require('./is-own-property.js');

function validateConfig(config) {
	const errors = [];
	// CONFIG IS DEFINED
	if (typeof config !== 'object') {
		errors.push(`[config] ${config} is not an object.`);
	} else config = config || {};
	// CONFIG PROPERTY NAMEs
	for (let prop in config) { // eslint-disable-line prefer-const
		if (!['url', 'appId', 'queue', 'bindings'].includes(prop)) // eslint-disable-line curly
			errors.push(`[config] "${prop}" is not a valid property name.`);
	}
	const {url, appId, queue, bindings} = config;

	// URL
	// is a string
	if (typeof url !== 'string') // eslint-disable-line curly
		errors.push(`[config.url] "${url}" is not a string.`);
	// starts with 'amqp://' or 'amqps://'
	else if (!url.startsWith('amqp://') && !url.startsWith('amqps://')) // eslint-disable-line curly
		errors.push(`[config.url] "${url}" does not start with "amqp://" or "amqps://"`);

	// APPID
	// is a string
	if (typeof appId !== 'string') // eslint-disable-line curly
		errors.push(`[config.appId] "${appId}" is not a string.`);

	// QUEUE
	// is a string, undefined or null
	if (typeof queue !== 'string' && queue !== undefined && queue !== null) // eslint-disable-line curly
		errors.push(`[config.queue] "${queue}" is not a string, undefined or null.`);

	// BINDINGS
	// is array or undefined
	if (!isArray(bindings) && bindings !== undefined && bindings !== null) // eslint-disable-line curly
		errors.push(`[config.bindings] "${bindings}" is not an array, undefined or null.`);
	else if (isArray(bindings)) {
		for (let i = 0; i < bindings.length; i++) {
			if (typeof bindings[i] !== 'object' || bindings[i].constructor !== Object) // eslint-disable-line curly
				errors.push(`[config.bindings] "${bindings[i]}" is not an object.`);
			else {
				for (let prop in bindings[i]) { // eslint-disable-line prefer-const
					if (isOwnProperty(bindings[i], prop)) {
						if (!['exchange', 'routingKey', 'handler'].includes(prop)) // eslint-disable-line curly
							errors.push(`[config.bindings[${i}]] "${prop}" must be either "exchange", "routingKey" or "handler"`);
						if (prop === 'exchange' && typeof prop !== 'string') // eslint-disable-line curly
							errors.push(`[config.bindings[${i}].exchange] ${bindings[i][prop]} is not a string.`);
						if (prop === 'routingKey' && typeof prop !== 'string') // eslint-disable-line curly
							errors.push(`[config.bindings[${i}].routingKey] ${bindings[i][prop]} is not a string.`);
						if (prop === 'hanlder' && typeof prop !== 'function') // eslint-disable-line curly
							errors.push(`[config.bindings[${i}].handler] ${bindings[i][prop]} is not a function.`);
					}
				}
			}
		}
	}
	if (errors.length > 0) throw new Error(errors);
	return;
}

module.exports = validateConfig;
