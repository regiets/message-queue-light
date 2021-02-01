## message-queue-light

#### Config

```js
const config = {
	url: '',
	queue: '',
	bindings: [
		{exchange: 'rpc', routingKey: 'search.all', handler: () => {}},
		{exchange: 'rpc', routingKey: 'search.*', handler: () => {}},
		{exchange: 'evt', routingKey: 'company.updated', handler: () => {}},
		{exchange: 'evt', routingKey: '#', handler: () => {}},
		{exchange: 'cmd', routingKey: 'upload.logo', handler: () => {}}
	]
};
```

###### config.url
- type: String
- required: true
- startsWith: `amqp://` or `amqps://`

###### config.queue
- type: String
- required: false

If bindings are provided without a value for `queue`, a temporary and exclusive queue is created.

If `queue` is provided without bindings (or an empty array), no `queue` is created.

###### config.bindings
- type: [Object]
- required: false
- format: `[{exchange: String, routingKey: String, handler: Function}]`

Messages are matched from the front of the bindings array, meaning the first binding to match a message will provide the handler for the message.


#### Methods

###### .init()
`mq.init()`

###### .rpc(routingKey, content[, options])
`mq.rpc('GRAPH_SVC', {data}, {contentType, expiration})`

###### .evt(routingKey, content, options)
`mq.evt('USER_CREATED', {data}, {contentType})`

###### .cmd(routingKey, content, options)
`mq.cmd('CREATE_SERVICE', {data}, {contentType})`

###### .ping()
`mq.ping()`

###### .shutdown()
`mq.shutdown()`
