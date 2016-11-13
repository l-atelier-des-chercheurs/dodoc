var chai = require('chai'),
	assert = chai.assert,
	should = chai.should,
	expect = chai.expect,
	path = require('path'),
	request = require('superagent');

var parsedown = require('../index');

function parseFile(file) {
	var text =  fs.readFileSync(file);
	return parsedown(text);
}

describe('Properties', function() {
	it('should convert lines starting with word+: to properties', function() {
		var param = parsedown('test:test test');
		expect(param.test).to.equal('test test');
		expect(param.content).to.be.undefined;
	});

	it('should put all text into content property if there are no properties present', function() {
		var param = parsedown('test test');
		expect(param.content).to.equal('test test');
	});

	it('should preserve linebreaks', function() {
		var param = parsedown('test:test test\ntest');
		expect(param.test).to.equal('test test\ntest');
	});

	it('should preserve trailing linebreaks', function() {
		var param = parsedown('test:test test\n');
		expect(param.test).to.equal('test test\n');
	});

	it('should preserve double linebreaks', function() {
		var param = parsedown('test:test test\n\ntest');
		expect(param.test).to.equal('test test\n\ntest');
	});

	it('should ignore spaces in property keys', function() {
		var param = parsedown('te st:test');
		expect(param['te st']).to.be.undefined;
		expect(param.content).to.equal('te st:test');
	});

	it('should allow numbers in property keys', function() {
		var param = parsedown('test123:test');
		expect(param.test123).to.equal('test');
	});

	it('should allow underscores in property keys', function() {
		var param = parsedown('test_123:test');
		expect(param.test_123).to.equal('test');
	});

	it('should allow capital letters in property keys', function() {
		var param = parsedown('camelCase:test');
		expect(param.camelCase).to.equal('test');
	});

	it('should remove ---- dividers', function() {
		var param = parsedown('first: value1\n----\nsecond:value2');
		expect(param.first).to.equal('value1');
		expect(param.second).to.equal('value2');
	});

	it('should prevent "space"---- to be interpreted as a divider', function() {
		var param = parsedown('first: value1\n ----\nStill value\n----\nsecond: value2');
		expect(param.first).to.equal('value1\n ----\nStill value');
		expect(param.second).to.equal('value2');
	});

	it('shouldn\'t read lines starting with ----something as dividers', function() {
		var param = parsedown('first: value1\n----Still value\n----\nsecond: value2');
		expect(param.first).to.equal('value1\n----Still value');
		expect(param.second).to.equal('value2');
	});

	it('should swallow line breaks after ---- dividers', function() {
		var param = parsedown('----\n');
		expect(param.content).to.equal('');
	});

	it('should swallow multiple line breaks after ---- dividers', function() {
		var param = parsedown('----\n\n');
		expect(param.content).to.equal('');
	});

	it('should swallow line breaks directly after a property name', function() {
		var param = parsedown('test:\ntest');
		expect(param.test).to.equal('test');
	});

	it('should swallow spaces directly after a property name', function() {
		var param = parsedown('test: testing');
		expect(param.test).to.equal('testing');

		param = parsedown('test:       testing');
		expect(param.test).to.equal('testing');
	});

	it('should swallow line-breaks & spaces directly after a property name', function() {
		var param = parsedown('test:       \n\ntesting');
		expect(param.test).to.equal('testing');
	});

	it('should ignore spaces in property keys', function() {
		var param = parsedown(' test:test');
		expect(param['test']).to.be.undefined;
		expect(param.content).to.equal(' test:test');
	});


	it('lastKey should be nullified after ---- divider, leading to next content without a property name to be placed inside content', function() {
		var param = parsedown('test:test\n----\nblabla');
		expect(param['test']).to.equal('test');
		expect(param.content).to.equal('blabla');
	});

	it('Typical txt values', function() {
		var param = parsedown('name: Hello world\n\n----\n\ncreated: 20160522_232028\n\n----\n\nmodified: 20160522_232028\n\n----\n\nstatut: en cours\n\n----');
		expect(param.name).to.equal('Hello world');
		expect(param.created).to.equal('20160522_232028');
		expect(param.modified).to.equal('20160522_232028');
		expect(param.statut).to.equal('en cours');
	});

	it('With irregular returns around divider', function() {
		var param = parsedown('name: Hello world\n----\n\ncreated: 20160522_232028\n\n----\nmodified: 20160522_232028\n----\nstatut: en cours\n\n----');
		expect(param.name).to.equal('Hello world');
		expect(param.created).to.equal('20160522_232028');
		expect(param.modified).to.equal('20160522_232028');
		expect(param.statut).to.equal('en cours');
	});

	it('With YAML-like field info', function() {
		var param = parsedown('name: première publi\n\n----\n\ninformations: Mes informations\n\n----\n\nmedias:\n\n-\nname: 02-animations/20160920_171027.txt\n-\nname: 02-animations/20160920_171029.txt\nlargeur: 100%\n-\nname: 02-animations/20160920_171027.txt\n\n----\n\n');
		expect(param.name).to.equal('première publi');
		expect(param.informations).to.equal('Mes informations');
		expect(param.medias[0].name).to.equal('02-animations/20160920_171027.txt');
		expect(param.medias[1].name).to.equal('02-animations/20160920_171029.txt');
		expect(param.medias[1].largeur).to.equal('100%');
	});

});