"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'monad' module", function() {
  describe("'identity' monad", () => {
    var unit = __.monad.identity.unit.bind(__);
    var flatMap = __.monad.identity.flatMap.bind(__);
    it("identity#flatMap", (next) => {
      var instance = unit(1);
      expect(
        flatMap(instance)((n) => {
          return unit(n * 2);
        })
      ).to.eql(
        unit(2)
      );
      expect(
        flatMap(instance)((n) => {
          return flatMap(unit(n * 2))((m) => {
            return unit(m * 3);
          });
        })
      ).to.eql(
        unit(6)
      );
      expect(
        flatMap(instance)((n) => {
          return flatMap(unit(n))((m) => {
            return unit(m * n);
          });
        })
      ).to.eql(
        unit(1)
      );
      next();
    });
  });
  describe("'maybe' monad", () => {
    var some = __.monad.maybe.unit.bind(__);
    var nothing = __.monad.maybe.nothing;
    var flatMap = __.monad.maybe.flatMap.bind(__);
    var unit = __.monad.maybe.unit.bind(__);
    var map = __.monad.maybe.map.bind(__);

    describe("functor laws on maybe", function() {
      it("map id == id", function(next){
        var justOne = some(1);
        expect(
          map(justOne)(__.id)
        ).to.eql(
          __.id(justOne)
        );
        expect(
          map(nothing)(__.id)
        ).to.eql(
          __.id(nothing)
        );
        next();
      });
      it("map (f . g)  == map f . map g", function(next){
        var justOne = some(1);
        var f = (n) => {
          return n + 1;
        };
        var g = (n) => {
          return - n;
        };
        expect(
          map(justOne)(__.compose.bind(__)(f)(g))
        ).to.eql(
          __.compose.bind(__)(__.flip.bind(__)(map)(f))
                             (__.flip.bind(__)(map)(g))(justOne)
        );
        next();
      });
    });
    describe("monad laws on maybe", function() {
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
    it("maybe#map", function(next){
      expect(
        __.monad.maybe.map.bind(__)(some(200))((n) => {
          return n * 2;
        })
      ).to.eql(
        some(400)
      );
      expect(
        __.monad.maybe.map.bind(__)(nothing)((n) => {
          return n * 2;
        })
      ).to.eql(
        nothing
      );
      next();
    });
    it("maybe#flatMap", function(next){
      expect(
        flatMap(some(200))((n) => {
          return some(n * 2);
        })
      ).to.eql(
        some(400)
      );
      expect(
        flatMap(nothing)((n) => {
          return some(n * 2);
        })
      ).to.eql(
        nothing
      );
      expect(
        flatMap(some(200))((n) => {
          return nothing;
        })
      ).to.eql(
        nothing
      );
      next();
    });
    it("maybe#getOrElse");
    it("maybe#lift", (next) => {
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
    it("maybe#flatten", (next) => {
      var instanceMM = some(some(2));
      expect(
        __.monad.maybe.flatten.call(__, instanceMM)
      ).to.eql(
        some(2)
      );
      next();
    });
    it("maybe#ap", (next) => {
      var justFunction = some(function(n){
        return n + 3;
      });
      var just4 = some(4);
      expect(
        __.monad.maybe.ap.call(__, justFunction)(just4)
      ).to.eql(
        some(7)
      );
      next();
    });
    it("primes", (next) => {
      var primeOrNot = (n) => {
        if(math.isPrime(n)){
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
  describe("'either' monad", function() {
    var unit = __.monad.either.unit.bind(__);
    it("'either#unit'", function(next) {
      expect(
        unit(1)
      ).to.eql(
        __.pair.mkPair.call(__,null)(1)
      );
      next();
    });
    it("'either#flatMap'", function(next) {
      var flatMap = __.monad.either.flatMap.bind(__);
      var left = __.monad.either.left.call(__, 2);
      var right = __.monad.either.unit.call(__, 2);
      expect(
        flatMap(left)(function(n){
          return unit(n + 1);
        })
      ).to.eql(
        left
      );
      expect(
        flatMap(right)(function(n){
          return unit(n + 1);
        })
      ).to.eql(
        unit(3)
      );
      next();
    });
    it("'either#bindM'", function(next) {
      var bindM = __.monad.either.bindM.bind(__);
      var left = __.monad.either.left.call(__, 2);
      var right = __.monad.either.unit.call(__, 2);
      expect(
        bindM(left)(function(n) {
          return unit(n + 1);
        })
      ).to.eql(
        left
      );
      expect(
        bindM(right)(function(n) {
          return unit(n + 1);
        })
      ).to.eql(
        unit(3)
      );
      next();
    });
  });
  describe("'list' monad", function() {
    var unit = __.monad.list.unit.bind(__);
    var toArray = __.list.toArray.bind(__);
    var mkList = __.list.mkList.bind(__);
    var empty = __.list.empty;

    it("'list#flatMap'", (next) => {
      this.timeout(5000);
      var flatMap = __.monad.list.flatMap.bind(__);
      var list = mkList([3,4,5]);
      expect(
        toArray(flatMap(list)(function (x){
          return mkList([x, -x]);
        }))
      ).to.eql(
          [3,-3,4,-4,5,-5]
      );
      expect(
        toArray(flatMap(mkList([1,2,3]))(function (x){
          return flatMap(mkList([10,20,30]))(function (y){
            return unit(__.pair.mkPair.call(__, x)(y));
          });
        }))
      ).to.eql(
        [
          __.pair.mkPair.call(__, 1)(10),
          __.pair.mkPair.call(__, 1)(20),
          __.pair.mkPair.call(__, 1)(30),
          __.pair.mkPair.call(__, 2)(10),
          __.pair.mkPair.call(__, 2)(20),
          __.pair.mkPair.call(__, 2)(30),
          __.pair.mkPair.call(__, 3)(10),
          __.pair.mkPair.call(__, 3)(20),
          __.pair.mkPair.call(__, 3)(30)
        ]
      );
      next();
    });
    it("'list#flatten'", function(next) {
      expect(
        toArray(__.monad.list.flatten.call(__, unit(unit(2))))
      ).to.eql(
        [2]
      );
      next();
    });
    describe("monad laws on list", function() {
      var flatMap = __.monad.list.flatMap.bind(__);
      var unit = __.monad.list.unit.bind(__);

      it("flatMap(m)(unit) == m", function(next){
        var list = unit(2);
        expect(
          toArray(flatMap(list)(unit))
        ).to.eql(
          toArray(list)
        );
        next();
      });
      it("flatMap(unit(v))(f) == f(v)", function(next){
        var list = unit(2);
        var square = (n) => {
          return unit(n * n);
        };
        expect(
          toArray(flatMap(list)(square))
        ).to.eql(
          toArray(square(2))
        );
        next();
      });
      it("flatMap(flatMap(m)(g))(h) == flatMap(m)(\\x => flatMap(g(x))(h))", function(next){
        var list = unit(2);
        var square = function(n){
          return unit(n * n);
        };
        var negate = function(n){
          return unit(- n);
        };
        expect(
          toArray(flatMap(flatMap(list)(square))(negate))
        ).to.eql(
          toArray(flatMap(list)(function(x){
            return flatMap(square(x))(negate);
          }))
        );
        next();
      });
    });
  });
  describe("'random' monad", function() {

    // var int = __.monad.random.unit.bind(__)(0);
    // var ns = __.monad.random.flatMap.bind(__)(int)(x => {
    //   return __.monad.random.flatMap.bind(__)(int)(y => {
    //  return
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
      //     __.monad.random.int.bind(__)(intRandom.right()).left
      // ).to.eql(
      //    2
      //    //4.612568818010603e+306
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
  // describe("'state' monad", function() {
  //     // it("'state#unit'", (next) => {
  //     //   var unit = __.monad.state.unit.bind(__);
  //     //   expect(
  //     //     unit(1)
  //     //   ).to.eql(
  //     //     []
  //     //   );
  //     //   next();
  //     // });

  //   describe("stack example", function() {
  //     var pop = (stack) => {
  //       __.list.censor(stack);
  //       return __.pair.cons.call(__, stack.head)(stack.tail);
  //     };
  //     var push = (value) => {
  //       return (stack) => {
  //         var runState = (s) => {
  //           var newStack =__.pair.cons.call(__, null)(__.list.cons.call(__, value)(s.state));
  //         };
  //         return __.monad.state.state.call(__,value)(stack)(runState);
  //       };
  //     };
  //     it("'stack manipulation'", (next) => {
  //       var unit = __.monad.state.unit.bind(__);
  //       var flatMap = __.monad.state.flatMap.bind(__);
  //       // var computation = flatMap(push(3))(function(stack1){
  //       //   return flatMap(pop())(function(stack2){
  //       //     return unit(stack2);
  //       //   });
  //       // });
  //       // var computation = (stackState) => {
  //       //   return flatMap(stackState)(push(3))
  //       //                             ))(pop);
  //       // };
  //       expect(
  //         flatMap(push(3))(function(stack){
  //           return unit()(stack);
  //         })(__.list.empty)
  //       ).to.eql(
  //         self.pair.mkPair.call(self, 3)(__.list.empty)
  //       );
  //       next();
  //     });
  //   });
  // });
  describe("'IO' monad", function() {
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
});
