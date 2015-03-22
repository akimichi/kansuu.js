"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'pair' module", function() {
  var pair = __.pair;
  it("pair object is frozen", function(next) {
	var obj = pair.mkPair(1)(2);
	expect(function(){
	  obj.left = 10; // TypeErrorが投げられる
	}).to.throwError();
	next();
  });
  it("'censor' should assert a pair object", function(next) {
	var obj = pair.mkPair(1)(2);
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
	var obj = pair.mkPair(1)(2);
	expect(
	  pair.left.bind(__)(obj)
	).to.eql(
	  1
	);
	next();
  });
});
