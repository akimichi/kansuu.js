"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
const List = require('../lib/kansuu-list.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();
const Maybe = require('../lib/kansuu-monad.js').maybe;

describe("'maybeMonad' monad", () => {
    
  it("maybeMonad#unit", (next) => {
    expect(
      Maybe.isEqual(Maybe.unit(1), Maybe.unit(1))
    ).to.be(
      true
    );
    expect(
      Maybe.isEqual(Maybe.nothing(), Maybe.nothing())
    ).to.eql(
      true
    );
    next();
  });
  it("maybeMonad#getOrElse", (next) => {
    expect(
      Maybe.getOrElse(Maybe.unit(1))(null)
    ).to.be(
      1
    );
    expect(
      Maybe.getOrElse(Maybe.nothing())(0)
    ).to.be(
      0
    );
    next();
  });
  it("maybeMonad#get", (next) => {
    expect(
      Maybe.get(Maybe.unit(1))
    ).to.be(
      1
    );
    next();
  });
  describe("maybeMonad#flatMap", () => {
    it("add(maybeMonad)(maybeMonad)", (next) => {
      var add = (maybeA) => {
        return (maybeB) => {
          return Maybe.flatMap(maybeA)((a) => {
            return Maybe.flatMap(maybeB)((b) => {
              return Maybe.unit(a + b);
            });
          });
        };
      };
      var justOne = Maybe.just(1);
      var justTwo = Maybe.just(2);
      var justThree = Maybe.just(3);
      expect(
        Maybe.isEqual(add(justOne)(justTwo),justThree)
      ).to.eql(
        true
      );
      expect(
        Maybe.isEqual(add(justOne)(Maybe.nothing()),Maybe.nothing())
      ).to.eql(
        true
      );
      next();
    });
  });
  describe("functor laws on maybeMonad", function() {
    it("map id == id", (next) => {
      var justOne = Maybe.just(1);
      expect(
        Maybe.isEqual(Maybe.map(justOne)(__.id), __.id(justOne))
      ).to.be(
        true
      );
      expect(
        Maybe.isEqual(Maybe.map(Maybe.nothing())(__.id),__.id(Maybe.nothing()))
      ).to.be(
        true
      );
      next();
    });
    it("map (f . g)  == map f . map g", function(next){
      var justOne = Maybe.just(1);
      var f = (n) => {
        return n + 1;
      };
      var g = (n) => {
        return - n;
      };
      expect(
        Maybe.isEqual(Maybe.map(justOne)(__.compose(f,g)),__.compose(__.flip(Maybe.map,f),__.flip(Maybe.map)(g))(justOne))
      ).to.be(
        true
      );
      next();
    });
  });
  describe("monad laws on maybeMonad", () => {
    it("flatMap(m)(unit) == m", (next) => {
      var justOne = Maybe.just(1);
      expect(
        Maybe.isEqual(Maybe.flatMap(justOne)(Maybe.unit),justOne)
      ).to.eql(
        true
      );
      expect(
        Maybe.isEqual(Maybe.flatMap(Maybe.nothing())(Maybe.unit),Maybe.nothing())
      ).to.eql(
        true
      );
      next();
    });
    it("flatMap(unit(v))(f) == f(v)", function(next){
      var square = function(n){
        return Maybe.just(n * n);
      };
      /* Just(1) flatMap { x => func(x)} should equal(Just(1)) */
      expect(
        Maybe.isEqual(Maybe.flatMap(Maybe.just(2))(square), Maybe.just(4))
      ).to.eql(
        true
        //just(4)
      );
      /* None flatMap { x => func(x)} should equal(None) */
      expect(
        Maybe.isEqual(Maybe.flatMap(Maybe.nothing())(square), Maybe.nothing())
      ).to.eql(
        true
      );
      next();
    });
    // ~~~haskell
    // ((p >>= f) >>= g) = p >>= (¥x -> (f x >>= g))
    // ~~~
    //
    it("flatMap(flatMap(m)(g))(h) == flatMap(m)(¥x => flatMap(g(x))(h))", function(next){
      var justTwo = Maybe.just(2);
      var square = function(n){
        return Maybe.just(n * n);
      };
      var negate = function(n){
        return Maybe.just(- n);
      };
      expect(
        Maybe.isEqual(Maybe.flatMap(Maybe.flatMap(justTwo)(square))(negate), Maybe.just(-4))
      ).to.eql(
        true
      );
      expect(
        Maybe.isEqual(Maybe.flatMap(Maybe.flatMap(justTwo)(square))(negate))(Maybe.flatMap(justTwo)(function(x){
          return Maybe.flatMap(square(x))(negate);
        }))
      ).to.eql(
        true
      );
      next();
    });
  });
});

describe("'maybe' monad", () => {
  const some = Maybe.unit;
  const nothing = Maybe.nothing;

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
     Maybe.isEqual(
        Maybe.map(Maybe.unit(200))((n) => {
        return n * 2;
      }), Maybe.unit(400))
    ).to.be(
      true 
    );
    expect(
      Maybe.isEqual(
          Maybe.map(Maybe.nothing())((n) => {
        return n * 2;
      }), Maybe.nothing())
    ).to.be(
      true 
    );
    next();
  });
  it("maybe#flatMap", function(next){
    expect(
      Maybe.isEqual(Maybe.flatMap(Maybe.unit(200))((n) => {
        return Maybe.unit(n * 2);
      }), Maybe.unit(400))
    ).to.be(
      true 
    );
    expect(
      Maybe.isEqual(Maybe.flatMap(Maybe.nothing())((n) => {
        return Maybe.unit(n * 2);
      }), Maybe.nothing())
    ).to.be(
      true 
    );
    expect(
      Maybe.isEqual(Maybe.flatMap(Maybe.unit(200))((n) => {
        return Maybe.nothing();
      }), Maybe.nothing())
    ).to.be(
      true 
    );
    next();
  });
  it("maybe#getOrElse");
  it("maybe#lift", (next) => {
    expect(
      Maybe.isEqual(
          Maybe.lift(parseInt)(Maybe.unit("123")), Maybe.unit(123)
      )
    ).to.be(
      true 
    );
    expect(
      Maybe.isEqual(
        Maybe.lift(parseInt)(Maybe.nothing()), Maybe.nothing()
      )
    ).to.be(
      true 
    );
    next();
  });
  it("maybe#flatten", (next) => {
    var instanceMM = Maybe.unit(Maybe.unit(2));
    expect(
      Maybe.isEqual(
          Maybe.flatten(instanceMM), Maybe.unit(2))
    ).to.be(
      true 
    );
    next();
  });
  it("maybe#ap", (next) => {
    const justFunction = Maybe.unit(n => {
      return n + 3;
    });
    var just4 = Maybe.unit(4);
    expect(
      Maybe.isEqual(
        Maybe.ap(justFunction)(just4), Maybe.unit(7)
      )
    ).to.be(
      true 
    );
    next();
  });
  it("primes", (next) => {
    // this.timeout(5000);
    var primeOrNot = (n) => {
      if(math.isPrime(n)){
        return some(n);
      } else {
        return nothing;
      }
    };
    var list = List.mkList([1,2,3,4,5,6,7,8,9,10,11,12,13]);
    var maybePrimes = List.map(list)(primeOrNot);
    expect(
      List.toArray(maybePrimes)
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
