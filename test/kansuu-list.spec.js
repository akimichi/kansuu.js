"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'list' module", function() {
  it("'cons' should construct a list object", function(next) {
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
  it("'list#head' should return the head of a list", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.head
	).to.eql(
	  0
	);
	next();
  });
  it("'list.tail' should return the tail of a list", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  list.tail.bind(__)().head
	).to.eql(
	  1
	);
	next();
  });
  it("'list#last'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  __.list.last.bind(__)(list)
	).to.eql(
	  3
	);
	next();
  });
  it("'list#concat'", function(next) {
	var list1 = __.list.mkList.bind(__)([0,1]);
	var list2 = __.list.mkList.bind(__)([2,3]);
	var result = __.list.concat.bind(__)(list1)(list2);
	expect(
	  __.list.length.bind(__)(result)
	).to.eql(
	  4
	);
	expect(
	  __.list.take.bind(__)(result)(4)
	).to.eql(
	  [0,1,2,3]
	);
	next();
  });
  it("'list#reverse'", function(next) {
  	var list = __.list.mkList.bind(__)([0,1,2,3]);
  	var result = __.list.reverse.bind(__)(list);
  	expect(
  	  result.head
  	).to.eql(
  	  3
  	);
  	expect(
  	  __.list.length.bind(__)(result)
  	).to.eql(
  	  4
  	);
  	next();
  });
  it("'list#map'", function(next) {
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
  it("'list#filter'", function(next) {

	var even = function(n){
      return (n % 2) === 0;
	};
	var list = __.list.mkList.bind(__)([0,1,2,3,4]);
	var result = __.list.filter.bind(__)(list)(even);
	expect(
	  __.list.toArray.bind(__)(result)
	).to.eql(
	  [0,2,4]
	);
	next();
  });
  it("'list.zip' should zip two lists",function(next){
	var keys = __.list.mkList.bind(__)(["a","b","c"]);
	var values = __.list.mkList.bind(__)([1,2,3]);
	var zipped = __.list.zip.bind(__)(keys)(values);
	expect(
	  __.list.length.bind(__)(zipped)
	).to.eql(
	  3
	);
	expect(
	  __.list.toArray.bind(__)(zipped)
	).to.eql(
	  [ { type: 'pair', left: 'a', right: 1 },
		{ type: 'pair', left: 'b', right: 2 },
		{ type: 'pair', left: 'c', right: 3 } ] 
	);
	next();
  });
  it("'list.zipWith' should zip two lists",function(next){
	var keys = __.list.mkList.bind(__)(["a","b","c"]);
	var values = __.list.mkList.bind(__)([1,2,3]);
	var zippedWithPair = __.list.zipWith.bind(__)(__.pair.mkPair)(keys)(values);
	expect(
	  __.list.length.bind(__)(zippedWithPair)
	).to.eql(
	  3
	);
	expect(
	  __.list.toArray.bind(__)(zippedWithPair)
	).to.eql(
	  [ { type: 'pair', left: 'a', right: 1 },
		{ type: 'pair', left: 'b', right: 2 },
		{ type: 'pair', left: 'c', right: 3 } ] 
	);
	next();
  });
  it("'list#length'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  __.list.length.bind(__)(list)
	).to.eql(
	  4
	);
	next();
  });
  it("'list#take'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  __.list.take.bind(__)(list)(2)
	).to.eql(
	  [0,1]
	);
	next();
  });
  it("'list#init'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var init = __.list.init.bind(__)(list);
	expect(
	  __.list.take.bind(__)(init)(__.list.length.bind(__)(init))
	).to.eql(
	  [0,1,2]
	);
	next();
  });
  it("'list#reduce'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  __.list.reduce.bind(__)(list)(0)(function(item){
		return function(accumulator){
		  return item + accumulator;
		};
	  })
	).to.eql(
	  6
	);
	next();
  });
  it("'list#and'", function(next) {
	var trueList = __.list.mkList.bind(__)([true,true,true]);
	expect(
	  __.list.and.bind(__)(trueList)
	).to.eql(
	  true
	);
	var falseList = __.list.mkList.bind(__)([true,true,false]);
	expect(
	  __.list.and.bind(__)(falseList)
	).to.eql(
	  false
	);
	next();
  });
});
