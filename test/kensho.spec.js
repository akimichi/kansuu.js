"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var qc = require('../lib/kensho.js');

describe("Kensho module", function() {
  it("ints", function(next) {
	var ints = qc.ints(1);
	expect(
	  ints.value
	).to.eql(1);
	expect(
	  ints.next().value
	).to.eql(2);
	expect(
	  ints.next().next().value
	).to.eql(3);
	next();
  });
  it("forAll", function(next) {
	var intStream = qc.ints(1);
	var intUpto10 = __.stream.take.bind(__)(intStream)(10);
	qc.forAll(intUpto10)(function(item){
	  return item > 0;
	});
	next();
  });
});

