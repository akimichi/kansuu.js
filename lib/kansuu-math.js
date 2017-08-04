"use strict";

const expect = require('expect.js'),
  base = require('../lib/kansuu-base.js'),
  List = require('../lib/kansuu-monad.js').list;

var __ = require('../lib/kansuu.js');

//
// math module
//
const math = {
  succ: (n) => {
    expect(n).to.a('number');
    return n + 1;
  },
  prev: (n) => {
    expect(n).to.a('number');
    return n - 1;
  },
  negate: (fun) => {
    return (n) => {
      return - fun(n);
    };
  },
  add: (n1) => {
    return (n2) => {
      return n1 + n2;
    };
  },
  subtract: (n1) => {
    return (n2) => {
      return n1 - n2;
    };
  },
  multiply: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      return n1 * n2;
    };
  },
  divide: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      return n1 / n2;
    };
  },
  div: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      return Math.floor(n1 / n2);
    };
  },
  recip: (n) => {
    expect(n).to.a('number');
    return 1 / n;
  },
  exponential: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      return Math.pow(n1,n2);
    };
  },
  equal: (any1) => {
    return (any2) => {
      return (any1 === any2);
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
    __ = require('../lib/kansuu.js');

    return (n2) => {
      expect(n2).to.a('number');
      return __.or((n1 < n2))((n1 == n2));
    };
  },
  geq: (n1) => {
    expect(n1).to.a('number');
    __ = require('../lib/kansuu.js');

    return (n2) => {
      expect(n2).to.a('number');
      return __.or((n1 > n2))((n1 == n2));
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
      return n1 > n2;
    };
  },
  isMoreThan: (n1) => {
    expect(n1).to.a('number');
    return (n2) => {
      expect(n2).to.a('number');
      return n1 < n2;
    };
  },
  square: (n) => {
    return n * n;
  },
  //  innerProduct :: Num a => [a] -> [a] -> a
  //  innerProduct xs ys = sum (zipWith (*) xs ys)
  // const innerProduct = (xs) => {
  //   return (ys) => {
  //     expect(List.length(xs)).to.eql(List.length(ys));
  //     return List.sum(List.zipWith(self.op['*'].bind(self))(xs)(ys));
  //   };
  // },
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
    expect(k).to.a('number');
    return (n) => {
      expect(n).to.a('number');
      if(math.divides(k)(n)) {
        return k;
      }
      if((k*k) > n){
        return n;
      }
      return math.ldf(k+1)(n);
    };
  },
  isPrime: (n) => {
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
  },
  // primes :: Stream[Num]
  // primes = 2 : filter prime [3..]
  // primes: (_) => {
  //   var stream = __.stream.unfold.call(__,3)((n) => {
  //     return __.monad.maybe.unit.call(__,
  //                                     __.pair.cons.call(__,
  //                                                       n)(n+1));
  //   });
  //   var head = base.thunk(2);
  //   var tail = base.thunk(__.stream.filter.call(__,
  //                                               stream)(self.isPrime));
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
    expect(n).to.a('number');
    expect(n).to.above(0);
    if(n === 1) {
      return List.empty();
    } else {
      var ld = (n) => {
        return math.ldf(2)(n);
      };
      var p = ld(n);
      return List.cons(p, math.factors(n / p));
    }
  }
}
// configureFunction: function(improve){
//   expect(improve).to.a('function');
//   return function(good_enough){
//     expect(improve).to.a('function');
//     return function(precision){
//       expect(precision).to.a('number');
//       return {
//         improve : improve,
//         good_enough : good_enough
//       };
//     };
//   };
// },
// configureSqrt: function(precision){
//   expect(precision).to.a('number');
//   return {
//     improve : function(n) {
//       expect(n).to.a('number');
//       return function improveGuess(guess){
//         expect(guess).to.a('number');
//         return (guess + (n / guess)) / 2.0;
//       };
//     },
//     good_enough : function(guess) {
//       expect(guess).to.a('number');
//       return function isGoodEnough(n){
//         expect(n).to.a('number');
//         return Math.abs(guess * guess - n) < precision;
//       };
//     }
//   };
// },
// mkApproximate: function(config) {
//   expect(config).to.an('object');
//   var self = this;
//   return function(n) {
//     expect(n).to.a('number');
//     var iterate = function(guess) {
//       expect(guess).to.a('number');
//       if (config.good_enough(guess)(n)) {
//         return guess;
//       } else {
//         var improvedGuess = config.improve(n)(guess);
//         expect(improvedGuess).to.a('number');
//         return iterate(improvedGuess);
//       }
//     };
//     return iterate;
//   };
// },
// improve_sqrt: function(n) {
//   expect(n).to.a('number');
//   return function(guess){
//     expect(guess).to.a('number');
//     return (guess + (n / guess)) / 2.0;
//   };
// },
// good_enough_sqrt: function(precision){
//   expect(precision).to.a('number');
//   return function(guess) {
//     expect(guess).to.a('number');
//     return function(n){
//       expect(n).to.a('number');
//       return Math.abs(guess * guess - n) < precision;
//     };
//   };
// },
// approximate: function(improve) {
//   expect(improve).to.a('function');
//   var self = this;
//   return function(precision){
//     return function(n) {
//       expect(n).to.a('number');
//       var iterate = function(guess) {
//         expect(guess).to.a('number');
//         if (self.good_enough_sqrt(precision)(guess)(n)) {
//           return guess;
//         } else {
//           var newGuess = improve(n)(guess);
//           expect(newGuess).to.a('number');
//           return iterate(newGuess);
//         }
//       };
//       return iterate;
//     };
//   };
// },

module.exports = math;

