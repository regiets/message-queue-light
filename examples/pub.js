'use strict';


const Mq = require('../src/message-queue.js');
const mq = new Mq({
	url: 'amqp://localhost'
});

let i = 0;

mq.init()
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.evt('evt1', {data: 'evt ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.evt('evt1', {data: 'evt ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.evt('evt2', {data: 'evt ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.evt('evt1', {data: 'evt ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.evt('evt1', {data: 'evt ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.cmd('cmd1', {data: 'cmd ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.cmd('cmd2', {data: 'cmd ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.cmd('cmd1', {data: 'cmd ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.cmd('cmd1', {data: 'cmd ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.cmd('cmd1', {data: 'cmd ' + i++}))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.then(() => delayPromise(250)).then(() => mq.rpc('rpc.graphql', {data: 'rpc ' + i++})).then((msg) => console.log(msg.content))
	.catch((err) => console.log(err));

function delayPromise(t, v) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t);
	});
}
