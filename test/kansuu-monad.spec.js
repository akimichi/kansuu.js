"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'monad' module", function() {
  describe("'maybe' monad", function() {
	it("m flatMap unit == m", function(next){
	  var some = __.monad.maybe.unit.bind(__)(1);
	  var nothing = __.monad.maybe.nothing;
	  expect(
		__.monad.maybe.flatMap.bind(__)(some)(__.monad.maybe.unit.bind(__))
	  ).to.eql(
		some
	  );
	  expect(
		__.monad.maybe.flatMap.bind(__)(nothing)(__.monad.maybe.unit.bind(__))
	  ).to.eql(
		nothing
	  );
	  next(); 
	});
    it("unit(v) flatMap f == f(v)", function(next){
	  var some = function(n){
		return __.monad.maybe.unit.bind(__)(n);
	  };
      var square = function(n){
		return some(n * n);
	  };
	  var nothing = __.monad.maybe.nothing;
	  /* Some(1) flatMap { x => func(x)} should equal(Some(1)) */
	  expect(
		__.monad.maybe.flatMap.bind(__)(some(2))(square)
	  ).to.eql(
		some(4)
	  );
      /* None flatMap { x => func(x)} should equal(None) */
	  expect(
		__.monad.maybe.flatMap.bind(__)(nothing)(square)
	  ).to.eql(
		nothing
	  );
	  next();
    });
    it("m flatMap g flatMap h == m flatMap { x => g(x) flatMap h}", function(next){
	  next();
    });
    it("maybe and id", function(next){
	  var some = __.monad.maybe.unit.bind(__)(1);
	  var nothing = __.monad.maybe.nothing;
	  expect(
		__.monad.maybe.flatMap.bind(__)(some)(__.monad.id.unit)
	  ).to.eql(
		1
	  );
	  next();
    });
    it("primes", function(next){
	  var some = function(n){
	  	return __.monad.maybe.unit.bind(__)(n);
	  };
	  var nothing = __.monad.maybe.nothing;
	  var primeOrNot = function(n){
		if(__.math.isPrime(n)){
		  return some(n);
		} else {
		  return nothing;
		}
	  };
	  var list = __.list.mkList.bind(__)([1,2,3,4,5,6,7,8,9,10,11,12,13]);
	  var maybePrimes = __.list.map.bind(__)(list)(primeOrNot);
	  expect(
		__.list.toArray.bind(__)(maybePrimes)
	  ).to.eql(
		[some(1),some(2),some(3),nothing,some(5),nothing,some(7),nothing,nothing,nothing,some(11),nothing,some(13)]
	  );
	  /* doesn't work!!
	   var onlyPrimes = __.list.flatMap.bind(__)(list)(primeOrNot);
	   expect(
	     __.list.toArray.bind(__)(onlyPrimes)
	   ).to.eql(
	     [some(1),some(2),some(3),some(5),some(7),some(11),some(13)]
	   );
	   */
	  next();
    });
	  
    it("practical example of maybe", function(next){
	  /*
	   Seq(1,2,3,4) flatMap { x => 
	     if(x % 2 == 0) Some(x) else None 
	   } map { x =>
	     x * 2
	   } foreach { 
	     println 
	   }
	   */
	  // var some = function(n){
	  // 	return __.monad.maybe.unit.bind(__)(n);
	  // };
	  // var nothing = __.monad.maybe.nothing;
	  // var list = __.list.mkList.bind(__)([some(2),nothing, some(3), nothing,some(5)]);
	  // expect(
	  // 	__.list.reduce.bind(__)(list)(some(0))(function(maybe){
	  // 	  return function(accumulator){
	  // 		return __.monad.maybe.flatMap.bind(__ )(maybe)(function(value){
	  // 		  return some(value + accumulator.just);
	  // 		});
	  // 	  };
	  // 	}).just
	  // ).to.eql(
	  // 	1
	  // );
	  next();
    });
  });
  it("'writer'", function(next) {
	var squared = function(x) {
	  return __.monad.writer.unit.bind(__)(x * x)(__.list.mkList.bind(__)([util.format("%s was squared.",x)]));
	};
	var halved = function(x) {
	  return __.monad.writer.unit.bind(__)(x / 2)(__.list.mkList.bind(__)([util.format("%s was halved.",x)]));
	};
	var answer = __.monad.writer.flatMap.bind(__)(
	  __.monad.writer.flatMap.bind(__)(
		__.monad.writer.unit.bind(__)(4)(__.list.nil)
	  )(squared)
	)(halved);
	expect(
	  answer.value
	).to.eql(
	  8
	);
	expect(
	  __.list.toArray.bind(__)(answer.buffer)
	).to.eql(
	  [ '4 was squared.', '16 was halved.' ] 
	);
	next();
  });
});
