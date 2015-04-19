"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'monad' module", function() {
  describe("'random' monad", function() {

    // var int = __.monad.random.unit.bind(__)(0);
  	// var ns = __.monad.random.flatMap.bind(__)(int)(x => {
  	//   return __.monad.random.flatMap.bind(__)(int)(y => {
  	// 	return 
  	//   }
  	// })
    it("random.int", function(next){
	  //var rng = seedrandom("seed");
	  rng.seed("seed");
	  var intRandom = __.monad.random.int.bind(__)(rng);
      expect(
	  	intRandom.left
      ).to.eql(
		-1937831252
      );
	  //var intRandom2 = __.monad.random.int.bind(__)(intRandom.right);
      expect(
	  	 __.monad.random.int.bind(__)(intRandom.right).left
      ).to.eql(
		-884076225
      );
      expect(
	  	__.monad.random.int.bind(__)(intRandom.right).left
      ).to.eql(
		-505527131
      );
      // expect(
	  // 	 __.monad.random.int.bind(__)(intRandom.right()).left
      // ).to.eql(
	  // 	2
	  // 	//4.612568818010603e+306
      // );
      next(); 
    });
    it("random.ints", function(next){
	  var rng = Random.engines.mt19937();
	  rng.seed("seed");
	  var ints = __.monad.random.ints.bind(__)(3)(rng);
      expect(
	  	__.list.length.bind(__)(ints.left)
      ).to.eql(
		3
      );
      expect(
	  	__.list.toArray.bind(__)(ints.left)
      ).to.eql(
		[ -1937831252, -884076225, -725654408 ]
      );
      next(); 
    });
  });
  describe("'maybe' monad", function() {
    var some = function(n){
      return __.monad.maybe.unit.bind(__)(n);
    };
    var nothing = __.monad.maybe.nothing;
    describe("monad laws", function() {
      var flatMap = __.monad.maybe.flatMap.bind(__);
      var unit = __.monad.maybe.unit.bind(__);

      it("flatMap(m)(unit) == m", function(next){
        var justOne = some(1);
        expect(
          flatMap(justOne)(unit)
        ).to.eql(
          justOne
        );
        expect(
          flatMap(nothing)(unit)
        ).to.eql(
          nothing
        );
        next(); 
      });
      it("flatMap(unit(v))(f) == f(v)", function(next){
        // var some = function(n){
        //   return __.monad.maybe.unit.bind(__)(n);
        // };
        var square = function(n){
          return some(n * n);
        };
        var nothing = __.monad.maybe.nothing;
        /* Some(1) flatMap { x => func(x)} should equal(Some(1)) */
        expect(
          flatMap(some(2))(square)
        ).to.eql(
          some(4)
        );
        /* None flatMap { x => func(x)} should equal(None) */
        expect(
          flatMap(nothing)(square)
        ).to.eql(
          nothing
        );
        next();
      });
      // ~~~haskell
      // ((p >>= f) >>= g) = p >>= (¥x -> (f x >>= g))
      // ~~~
      // 
      it("flatMap(flatMap(m)(g))(h) == flatMap(m)(¥x => flatMap(g(x))(h))", function(next){
        var justTwo = some(2);
        var square = function(n){
          return some(n * n);
        };
        var negate = function(n){
          return some(- n);
        };
        expect(
          flatMap(flatMap(justTwo)(square))(negate)
        ).to.eql(
          some(-4)
        );
        expect(
          flatMap(flatMap(justTwo)(square))(negate)
        ).to.eql(
          flatMap(justTwo)(function(x){
            return flatMap(square(x))(negate);
          })
        );

        next();
      });
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
    it("maybe#lift", function(next){
      var some = __.monad.maybe.unit.bind(__);
      var nothing = __.monad.maybe.nothing;
      expect(
        __.monad.maybe.lift.bind(__)(parseInt)(some("123"))
      ).to.eql(
        some(123)
      );
      expect(
        __.monad.maybe.lift.bind(__)(parseInt)(nothing)
      ).to.eql(
        nothing
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
      var obj = {
        key: "value"
      };
      expect(
        __.get.bind(__)("key")(obj)
      ).to.eql(
        some("value")
      );
      expect(
        __.get.bind(__)("nokey")(obj)
      ).to.eql(
        nothing
      );
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
      //    return __.monad.maybe.unit.bind(__)(n);
      // };
      // var nothing = __.monad.maybe.nothing;
      // var list = __.list.mkList.bind(__)([some(2),nothing, some(3), nothing,some(5)]);
      // expect(
      //    __.list.reduce.bind(__)(list)(some(0))(function(maybe){
      //      return function(accumulator){
      //        return __.monad.maybe.flatMap.bind(__ )(maybe)(function(value){
      //          return some(value + accumulator.just);
      //        });
      //      };
      //    }).just
      // ).to.eql(
      //    1
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
        __.monad.writer.unit.bind(__)(4)(__.list.empty)
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
