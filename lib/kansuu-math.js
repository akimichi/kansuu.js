"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var List = require('../lib/kansuu-list.js');

//
// math module
//
const succ = (n) => {
  expect(n).to.a('number');
  return n + 1;
};
const prev = (n) => {
  expect(n).to.a('number');
  return n - 1;
};
const multiply = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    return n1 * n2;
  };
};
const div = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    return Math.floor(n1 / n2);
  };
};
const signum = (n) => {
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
};
/*
 // lower: function(n){
 //   expect(n).to.a('number');
 //   var self = this;
 //   return self.until.bind(self)(self.geq.bind(self)(n))(self.times.bind(self)(2))(-1);
 // },
 */
const leq = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    expect(n2).to.a('number');
    return __.or((n1 < n2))((n1 == n2));
  };
};

const geq = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    expect(n2).to.a('number');
    return __.or((n1 > n2))((n1 == n2));
    //return (n1 > n2) || (n1 == n2);
  };
};

const isEqual = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    expect(n2).to.a('number');
    return n2 === n1;
  };
};

const isLessThan = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    expect(n2).to.a('number');
    return n1 > n2;
  };
};
const isMoreThan = (n1) => {
  expect(n1).to.a('number');
  return (n2) => {
    expect(n2).to.a('number');
    return n1 < n2;
  };
};

const square = (n) => {
  return n * n;
};
//  innerProduct :: Num a => [a] -> [a] -> a
//  innerProduct xs ys = sum (zipWith (*) xs ys)
// const innerProduct = (xs) => {
//   return (ys) => {
//     expect(List.length(xs)).to.eql(List.length(ys));
//     return List.sum(List.zipWith(self.op['*'].bind(self))(xs)(ys));
//   };
// },
// divides d n = rem n d == 0
const divides = (d) => {
  return (n) => {
    return ((n % d) === 0);
  };
};
// ~~~haskell
// ldf k n | divides k n = k
//         | k^2 > n = n
//         | otherwise = ldf (k+1) n
// ~~~
const ldf = (k) => {
  expect(k).to.a('number');
  return (n) => {
    expect(n).to.a('number');
    if(divides(k)(n)) {
      return k;
    }
    if((k*k) > n){
      return n;
    }
    return ldf(k+1)(n);
  };
};
// isPrime: (n) =>{
//   var self = this;
//   expect(n).to.a('number');
//   expect(n).to.above(0);
//   if(n === 1){
//  return false;
//   } else {
//  return self.ldp.bind(self)(n) === n;
//   }
// },
const isPrime = (n) => {
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
//
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
const factors = (n) => {
  expect(n).to.a('number');
  expect(n).to.above(0);
  if(n === 1) {
    return List.empty();
  } else {
    var ld = (n) => {
      return ldf(2)(n);
    };
    var p = ld(n);
    return List.cons(p,factors(n / p));
  }
};
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

module.exports = {
  succ: succ,
  prev: prev,
  multiply: multiply,
  div: div,
  signum: signum,
  leq: leq,
  geq: geq ,
  isEqual: isEqual,
  isLessThan: isLessThan,
  isMoreThan: isMoreThan,
  square: square, 
  divides: divides,
  ldf: ldf, 
  isPrime: isPrime,
  //primes: (_) => {
  factors: factors,
};  /* end of 'math' module */
