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
	  return (item > 0) && (item < 11);
	});
	next();
  });
  
  // ~~~haskell
  // prop_RevUnit x =
  //   reverse [x] == [x]
  // ~~~
  it("property", function(next) {
  	var prop_RevUnit = function(x){
  	  var list = __.list.mkList.bind(__)([x]);
  	  return __.list.reverse.bind(__)(list).isEqual(list);
  	};
  	var intStream = qc.ints(1);
  	var intUpto10 = __.stream.take.bind(__)(intStream)(10);
  	qc.forAll(intUpto10)(prop_RevUnit);
  	next();
  });
  // ~~~haskell
  // prop_RevApp xs ys =
  //   reverse (xs++ys) == reverse ys++reverse xs
  // prop_RevRev xs =
  //   reverse (reverse xs) == xs
  // ~~~
});

