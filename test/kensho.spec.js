"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var qc = require('../lib/kensho.js');

describe("Kensho module", function() {
  it("ints", function(next) {
    var ints = qc.ints(1);
    expect(
      ints.value()
    ).to.eql(1);
    expect(
      ints.next().value()
    ).to.eql(2);
    expect(
      ints.next().next().value()
    ).to.eql(3);
    next();
  });
  it("randoms", function(next) {
	var randomGenerator = qc.randomGen.call(qc,0);
    var randStream = qc.randoms.call(qc, randomGenerator);
    expect(
      randStream.value()
    ).to.be(
      0.038085370776470735
    );
    expect(
      randStream.next().value()
    ).to.be(
      0.08624634995353292
    );
    next();
  });
  it("forAll", function(next) {
    var intStream = qc.ints(1);
    var intUpto10 = __.stream.take.bind(__)(intStream)(10);
    var prop = qc.forAll(intUpto10)(function(item){
      return (item > 0) && (item < 11);
    });
	expect(prop).to.ok();
    next();
  });
  
  describe("Kensho module", function() {
	// ~~~haskell
	// prop_RevUnit x =
	//   reverse [x] == [x]
	// ~~~
	it("reverse [x] == [x]", function(next) {
	  this.timeout(5000);
      // var prop_RevUnit = function(x){
	  // 	var list = __.list.mkList.bind(__)([x]);
	  // 	return __.list.reverse.bind(__)(list).isEqual(list);
      // };
      var intStream = qc.ints(1);
      var intUpto10 = __.stream.take.bind(__)(intStream)(10);
      var prop = qc.forAll(intUpto10)(function(n){
		var list = __.list.mkList.bind(__)([n]);
		return __.list.reverse.bind(__)(list).isEqual(list);
      });
	  expect(prop).to.ok();
      next();
	});
	// ~~~haskell
	// prop_RevApp xs ys =
	//   reverse (xs++ys) == reverse ys++reverse xs
	// ~~~
	/*
	it("reverse (xs++ys) == reverse ys ++ reverse xs", function(next) {
      var intStream = qc.ints(1);
      var intUpto10 = __.stream.take.bind(__)(intStream)(10);
      qc.forAll(intUpto10)(function(n){
		var list = __.list.mkList.bind(__)([n]);
		return __.list.reverse.bind(__)(list).isEqual(list);
      });
	  this.timeout(4000);
      next();
	});
	*/
	// ~~~haskell
	// prop_RevRev xs =
	//   reverse (reverse xs) == xs
	// ~~~
  });
});

