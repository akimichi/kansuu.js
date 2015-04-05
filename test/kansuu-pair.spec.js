"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'pair' module", function() {
  var pair = __.pair;
  var mkPair = __.pair.mkPair.bind(__);
  it("pair object is frozen", function(next) {
	var obj = mkPair(1)(2);
	expect(function(){
	  obj.left = 10; // TypeErrorが投げられる
	}).to.throwError();
	next();
  });
  it("'censor' should assert a pair object", function(next) {
	var obj = mkPair(1)(2);
	expect(
	  pair.censor(obj)
	).to.eql(
	  {
	   	type: "pair",
	   	left: 1,
	   	right: 2
	  }
	);
	expect(
	  __.tap(obj)(pair.censor)
	).to.eql(
	  obj
	);
	next();
  });
  it("'left' should get the left part of the pair", function(next) {
	var obj = mkPair(1)(2);
	expect(
	  pair.left.bind(__)(obj)
	).to.eql(
	  1
	);
	next();
  });
  it("'swap' should swap the content of a pair", function(next) {
	var obj = mkPair(1)(2);
	expect(
	  __.pair.swap.bind(__)(obj)
	).to.eql(
	  {
	   	type: "pair",
	   	left: 2,
	   	right: 1
	  }
	);
	next();
  });
});
