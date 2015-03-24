"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'list' module", function() {

  it("'list.cons' should construct a list object", function(next) {
	var list = __.list.cons.bind(__)(0)(__.list.nil);
	expect(
	  list.head
	).to.eql(
	  0
	);
	expect(
	  list.tail()
	).to.eql(
	  __.list.nil
	);
	next();
  });
  it("'list.head' should return the head of a list", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.head
	).to.eql(
	  0
	);
	next();
  });
  it("'tail' should return the tail of a list", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.tail.bind(__)().head
	).to.eql(
	  1
	);
	next();
  });
  it("'list.take'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.take.bind(__)(2)
	).to.eql(
	  [0,1]
	);
	next();
  });
  it("'list.reduce'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.reduce.bind(__)(0)(function(item){
		return function(accumulator){
		  return item + accumulator;
		};
	  })
	).to.eql(
	  6
	);
	next();
  });
  it("'list.map'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var result = __.list.map.bind(__)(list)(function(item){
	  return item + 10;
	});
	expect(
	  result.head
	).to.eql(
	  10
	);
	expect(
	  result.tail().head
	).to.eql(
	  11
	);
	expect(
	  __.list.length.bind(__)(result)
	).to.eql(
	  4
	);
	next();
  });
  describe("'mkList'", function() {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	it("'list.length'", function(next) {
	  expect(
		list.length()
	  ).to.eql(
		4
	  );
	  next();
	});
	it("'list.init'", function(next) {
	  var list = __.list.mkList.bind(__)([0,1,2,3]);
	  var init = list.init()
	  expect(
		__.list.take.bind(__)(init)(__.list.length.bind(__)(init))
	  ).to.eql(
		[0,1,2]
	  );
	  next();
	});
	it("'list#init'", function(next) {
	  var list = __.list.mkList.bind(__)([0,1,2,3]);
	  var init = __.list.init.bind(__)(list)
	  expect(
		__.list.take.bind(__)(init)(__.list.length.bind(__)(init))
	  ).to.eql(
		[0,1,2]
	  );
	  next();
	});
  });
});
