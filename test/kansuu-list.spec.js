"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'list' module", function() {
  describe("'mkList'", function() {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	it("'head' should return the head of a list", function(next) {
	  expect(
		list.head
	  ).to.eql(
		0
	  );
	  next();
	});
	it("'tail' should return the tail of a list", function(next) {
	  expect(
		list.tail.bind(__)().head
	  ).to.eql(
		1
	  );
	  next();
	});
	it("'take'", function(next) {
	  expect(
		list.take.bind(__)(2)
	  ).to.eql(
		[0,1]
	  );
	  next();
	});
	it("'list.reduce'", function(next) {
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
	it("'list.length'", function(next) {
	  expect(
		list.length()
	  ).to.eql(
		4
	  );
	  next();
	});
	// it("'list.init'", function(next) {
	//   expect(
	// 	list.bind(list).init().length()
	//   ).to.eql(
	// 	list.length() - 1
	//   );
	//   next();
	// });
	it("'list#init'", function(next) {
	  var list = __.list.mkList.bind(__)([0,1,2,3]);
	  expect(
		__.list.init.bind(__)(list).length()
	  ).to.eql(
		list.length() - 1
	  );
	  next();
	});
  });
});
