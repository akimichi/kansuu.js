"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'list' module", function() {
  var toArray = __.list.toArray.bind(__);

  var fixtures = {
	ints: __.list.mkList.bind(__)([0,1,2,3])
  };

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
  it("'list#toArray'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	expect(
	  __.list.toArray.bind(__)(list)
	).to.eql(
	  [0,1,2,3]
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
	  __.list.toArray.bind(__)(__.list.take.bind(__)(result)(4))
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
  it("'list#concat'", function(next) {
  	expect(function(){
  	  var list1 = __.list.mkList.bind(__)([0,1]);
	  var list2 = __.list.mkList.bind(__)([2,3]);
	  return toArray(__.list.concat.bind(__)(list1)(list2));
  	}()).to.eql(
  	  [0,1,2,3]
  	);
	
  	next();
  });
  // ~~~scala
  //   for(val x <- m1                     
  //     val y <- m2)
  //   yield {x + y}
  //
  // becomes...
  //
  // m1.flatMap { x =>  m2.map { y =>
  //                             unit (x+y) }}
  // ~~~
  it("'list#flatMap'", function(next) {
	/*
	scala> val nestedNumbers = List(List(1, 2), List(3, 4))
	scala> nestedNumbers.flatMap(x => x.map(_ * 2))
	res0: List[Int] = List(2, 4, 6, 8)
	 */
	var List = __.list.mkList.bind(__);
	var flatMap = __.list.flatMap.bind(__);
	var map = __.list.map.bind(__);
	var nestedNumbers = List([List([1, 2]), List([3, 4])]);
	var toArray = __.list.toArray.bind(__);
	var flattened = flatMap(nestedNumbers)(function(x){
	  return map(x)(function(n){
		return n * 2;
	  });
	});
  	expect(
  	  toArray(flattened)
  	).to.eql(
  	  [2,4,6,8]
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
	// expect(function(){
	//   __.list.map.bind(__)(__.list.nil)(function(item){
	//   return item + 10;
	// });
	// }()).to.eql(
	//   4
	// );
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
	expect(
	  __.list.length.bind(__)(__.list.nil)
	).to.eql(
	  0
	);
	next();
  });
  it("'list#take'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var take = __.list.take.bind(__)(list)(2);
	expect(
	  __.list.toArray.bind(__)(take)
	).to.eql(
	  [0,1]
	);
	next();
  });
  it("'list#drop'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var drop = __.list.drop.bind(__)(list)(2);
	expect(
	  __.list.toArray.bind(__)(drop)
	).to.eql(
	  [2,3]
	);
	next();
  });
  it("'list#init'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var init = __.list.init.bind(__)(list);
	expect(
	  __.list.toArray.bind(__)(init)
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
	expect(function(){
	  var list = __.list.mkList.bind(__)([true,true]);
	  return __.list.and.bind(__)((list));
	}()).to.eql(
	  true
	);
	expect(function(){
	  var list = __.list.mkList.bind(__)([false,false]);
	  return __.list.and.bind(__)((list));
	}()).to.eql(
	  false
	);
	expect(function(){
	  var list = __.list.mkList.bind(__)([true,false]);
	  return __.list.and.bind(__)((list));
	}()).to.eql(
	  false
	);
	expect(function(){
	  var list = __.list.mkList.bind(__)([false,true]);
	  return __.list.and.bind(__)((list));
	}()).to.eql(
	  false
	);
	next();
  });
  it("'list#merge'", function(next) {
	var listX = __.list.mkList.bind(__)([0,2,4]);
	var listY = __.list.mkList.bind(__)([1,3,5]);
	var merged = __.list.merge.bind(__)(listX)(listY);
	expect(
	  __.list.toArray.bind(__)(merged)
	).to.eql(
	  [ 0, 1, 2, 3, 4, 5 ]
	);
	next();
  });
  it("'list#halve'", function(next) {
	var list = __.list.mkList.bind(__)([0,1,2,3]);
	var halve = __.list.halve.bind(__)(list);
	expect(
	  __.list.toArray.bind(__)(halve.left)
	).to.eql(
	  [ 0, 1 ]
	);
	expect(
	  __.list.toArray.bind(__)(halve.right)
	).to.eql(
	  [ 2,3 ]
	);
	next();
  });
  it("'list#sort'", function(next) {
	expect(function(){
	  var list = __.list.mkList.bind(__)([2,0,3,1]);
	  return __.list.toArray.bind(__)(__.list.sort.bind(__)(list));
	}()).to.eql(
	  [0,1,2,3]
	);
	expect(function(){
	  var nil = __.list.nil;
	  return __.list.toArray.bind(__)(__.list.sort.bind(__)(nil));
	}()).to.eql(
	  []
	);
	next();
  });
  it("'isEqual'", function(next) {
	expect(function(){
	  var list1 = __.list.mkList.bind(__)([2,0,3,1]);
	  var list2 = __.list.mkList.bind(__)([2,0,3,1]);
	  return list1.isEqual(list2);
	}()).to.eql(
	  true
	);
	expect(function(){
	  var list1 = __.list.mkList.bind(__)([2,0,3,1]);
	  var list2 = __.list.mkList.bind(__)([0,2,3,1]);
	  return list1.isEqual(list2);
	}()).to.eql(
	  false
	);
	expect(function(){
	  var list1 = __.list.mkList.bind(__)([2,0,3,1,4]);
	  var list2 = __.list.mkList.bind(__)([2,0,3,1]);
	  return list1.isEqual(list2);
	}()).to.eql(
	  false
	);
	expect(function(){
	  var list1 = __.list.mkList.bind(__)([2,0,3,1]);
	  var list2 = __.list.mkList.bind(__)([2,0,3,1,4]);
	  return list1.isEqual(list2);
	}()).to.eql(
	  false
	);
	next();
  });
});
