node-extend
===========

Object extend function designed for config files.

Modified version of the node module node.extend, an implementation of jQuery extend.

Differences:

*	Deep copying is enabled by default.
*	Arrays are replaced instead of combined.


Installation
------------

	npm install config-extend

Usage
-----

````javascript
var configExtend = require('config-extend'),
	production = {
		port: 1234,
		memcached: [
			'server1',
			'server2',
			'server3'
		]
	},
	staging = {
		port: 456,
		memcached: [
			'server4'
		]
	},
	devFoo = {
		memcached: [
			'localhost'
		]
	},
	objCombined = configExtend(production, staging, devFoo);

	/* objCombined Value:
		{
			port: 456,
			memcached: [
				'localhost'
			]
		}
	*/
````

