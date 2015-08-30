"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');

//
// math module
//

module.exports = {
  succ: (n) => {
    expect(n).to.a('number');
    return n + 1;
  },
  multiply: function(n1){
    expect(n1).to.a('number');
    return (n2) => {
      return n1 * n2;
    };
  },
  signum: (n) => {
    expect(n).to.a('number');
    if(n < 0){
      return -1;
    } else {
      if(n === 0){
        return 0;
      } else {
        return 1;
      }
    }
  },
  /*
   // lower: function(n){
   //   expect(n).to.a('number');
   //   var self = this;
   //   return self.until.bind(self)(self.geq.bind(self)(n))(self.times.bind(self)(2))(-1);
   // },
   */
  leq: (n1) => {
    expect(n1).to.a('number');
    var self = this;
    return (n2) => {
      expect(n2).to.a('number');
      return self.or.bind(self)((n1 < n2))((n1 == n2));
    };
  },
  geq: (n1) => {
    expect(n1).to.a('number');
    var self = this;
    return (n2) => {
      expect(n2).to.a('number');
      return self.or.bind(self)((n1 > n2))((n1 == n2));
      //return (n1 > n2) || (n1 == n2);
    };
  },
  isEqual: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      expect(n2).to.a('number');
      return n2 === n1;
    };
  },
  isLessThan: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      expect(n2).to.a('number');
      return n2 < n1;
    };
  },
  isMoreThan: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      expect(n2).to.a('number');
      return n2 > n1;
    };
  },
  isEven: (n) => {
    expect().to.a('number');
    return n % 2 === 0;
  },
  //  innerProduct :: Num a => [a] -> [a] -> a
  //  innerProduct xs ys = sum (zipWith (*) xs ys)
  innerProduct: (xs) => {
    var self = this;
    self.list.censor(xs);
    return (ys) => {
      self.list.censor(ys);
      expect(self.list.length.bind(self)(xs)).to.eql(self.list.length.bind(self)(ys));
      return self.list.sum.bind(self)(self.list.zipWith.bind(self)(self.op['*'].bind(self))(xs)(ys));
    };
  },
  // divides d n = rem n d == 0
  divides: (d) => {
    return (n) => {
      return ((n % d) === 0);
    };
  },
  // ~~~haskell
  // ldf k n | divides k n = k
  //         | k^2 > n = n
  //         | otherwise = ldf (k+1) n
  // ~~~
  ldf: (k) => {
    var self = this;
    expect(k).to.a('number');
    return (n) => {
      expect(n).to.a('number');
      if(self.divides.bind(self)(k)(n)) {
        return k;
      }
      if((k*k) > n){
        return n;
      }
      return self.ldf.bind(self)(k+1)(n);
    };
  },
  // isPrime: (n) => {
  //   var self = this;
  //   expect(n).to.a('number');
  //   expect(n).to.above(0);
  //   if(n === 1){
  //     return false;
  //   } else {
  //     return self.ldp.bind(self)(n) === n;
  //   }
  // },
  isPrime: function(n){
    expect(n).to.a('number');
    if (n === 1 || n === 2) {
      return true;
    }
    for (var i=2; i<n; i++) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  },
  // primes :: Stream[Num]
  // primes = 2 : filter prime [3..]

  // ~~~haskell
  // primes :: [Int]
  // primes = sieve [2..]
  // sieve :: [Int] -> [Int]
  // sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0 ]
  // ~~~
  primes: ((_) => {
    var self = this;
    var isPrime = (n) => {
      expect(n).to.a('number');
      if (n == 1 || n == 2) {
        return true;
      }
      for (var i=2; i<n; i++) {
        if (n % i == 0) {
          return false;
        }
      }
      return true;
    };
    var succ = (n) => {
      return n + 1;
    };
    var stream = __.stream.from.call(__,2)(succ);
    // return __.stream.filter.call(__,
    //                              stream)(self.isPrime);
    var head = 2;
    var tail = () => {
      return __.stream.filter.call(__,
                                   stream)(isPrime);
    };
    return __.stream.cons.call(__,head)(() => {
      return tail();
    });
    // var head = base.thunk(2);
    // var tail = base.thunk(__.stream.filter.call(__,
    //                                             stream)(self.isPrime));
    // return __.stream.cons.call(__,head)(() => {
    //   return __.stream.filter.call(__,
    //                                stream)(isPrime);
    // });
  }),
  // primes: (_) => {
  //   var self = this;
  //   var succ = (n) => {
  //     return n + 1;
  //   };
  //   var stream = __.stream.from.call(__,3)(succ);
  //   // var stream = __.stream.unfold.call(__,3)((n) => {
  //   //   return __.monad.maybe.unit.call(__,
  //   //                                   __.pair.cons.call(__,
  //   //                                                     n)(n+1));
  //   // });
  //   var head = 2;
  //   var tail = () => {
  //     return __.stream.filter.call(__,
  //                                  stream)(self.isPrime);
  //   };
  //   // var head = base.thunk(2);
  //   // var tail = base.thunk(__.stream.filter.call(__,
  //   //                                             stream)(self.isPrime));
  //   return __.stream.cons.call(__,
  //                              head)(tail);
  // },
  // math.factors:: Num => List[Num]
  //
  // ~~~haskell
  // factors :: Integer -> [Integer]
  // factors n | n < 1 = error "argument not positive"
  //           | n == 1 = []
  //           | otherwise = p : factors (div n p) where p = ld n
  //
  // GS> factors 84
  // [2,2,3,7]
  // GS> factors 557940830126698960967415390
  // [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71]
  // ~~~
  factors: (n) => {
    var self = this;
    expect(n).to.a('number');
    expect(n).to.above(0);
    if(n === 1) {
      return __.list.empty;
    } else {
      var ld = (n) => {
        return self.ldf.call(self,2)(n);
      };
      var p = ld.call(self,n);
      return __.list.cons.call(__,
                               p)(self.factors.call(self,
                                                    n / p));
    }
  },
  configureFunction: function(improve){
    expect(improve).to.a('function');
    return function(good_enough){
      expect(improve).to.a('function');
      return function(precision){
        expect(precision).to.a('number');
        return {
          improve : improve,
          good_enough : good_enough
        };
      };
    };
  },
  configureSqrt: function(precision){
    expect(precision).to.a('number');
    return {
      improve : function(n) {
        expect(n).to.a('number');
        return function improveGuess(guess){
          expect(guess).to.a('number');
          return (guess + (n / guess)) / 2.0;
        };
      },
      good_enough : function(guess) {
        expect(guess).to.a('number');
        return function isGoodEnough(n){
          expect(n).to.a('number');
          return Math.abs(guess * guess - n) < precision;
        };
      }
    };
  },
  mkApproximate: function(config) {
    expect(config).to.an('object');
    var self = this;
    return function(n) {
      expect(n).to.a('number');
      var iterate = function(guess) {
        expect(guess).to.a('number');
        if (config.good_enough(guess)(n)) {
          return guess;
        } else {
          var improvedGuess = config.improve(n)(guess);
          expect(improvedGuess).to.a('number');
          return iterate(improvedGuess);
        }
      };
      return iterate;
    };
  },
  improve_sqrt: function(n) {
    expect(n).to.a('number');
    return function(guess){
      expect(guess).to.a('number');
      return (guess + (n / guess)) / 2.0;
    };
  },
  good_enough_sqrt: function(precision){
    expect(precision).to.a('number');
    return function(guess) {
      expect(guess).to.a('number');
      return function(n){
        expect(n).to.a('number');
        return Math.abs(guess * guess - n) < precision;
      };
    };
  },
  approximate: function(improve) {
    expect(improve).to.a('function');
    var self = this;
    return function(precision){
      return function(n) {
        expect(n).to.a('number');
        var iterate = function(guess) {
          expect(guess).to.a('number');
          if (self.good_enough_sqrt(precision)(guess)(n)) {
            return guess;
          } else {
            var newGuess = improve(n)(guess);
            expect(newGuess).to.a('number');
            return iterate(newGuess);
          }
        };
        return iterate;
      };
    };
  },
  rational: {
    mkRational: (m) => {
      return (n) => {
        return __.pair.mkPair(m)(n);
      };
    },
    // [m/n] + [p/q] := [(mq + pn)/nq]
    // [m/n] · [p/q] := [mp/nq]
    // [m/n] = [p/q] :≡ mq = np
    add: (r) => {
      return (q) => {
      };
    },
  },
  matrix: {

  }
};  /* end of 'math' module */
