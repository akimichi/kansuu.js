"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const __ = require('../lib/kansuu.js');

// ## 'either' module 
// ~~~haskell
// data  Either a b  =  Left a | Right b
// instance Functor (Either a) where
//   fmap f (Right x) = Right (f x)
//   fmap f (Left x) = Left x
//
// instance Monad (Either a b) where
//   return x = Right x
//   Right x >>= f = f x
//   Left x >>= Left x
// ~~~


const match = (exp, pattern) => {
  return exp(pattern);
};

const unit = (value) => {
  return (pattern) => {
    return pattern.right(value);
  };
  // return Pair.cons(null,value);
};

const left = (value) => {
  return (pattern) => {
    return pattern.left(value);
  };
};

const right = (value) => {
  return (pattern) => {
    return pattern.right(value);
  };
};
// left: (value) => {
//   return Pair.cons(value,null);
// },
// right: (value) => {
//   return Pair.cons(null,value);
// },

// either#flatMap
const flatMap = (instance) => {
  return (transform) => {
    expect(transform).to.a('function');
    return match(instance,{
      left: (value) => {
        return left(value);
      },
      right: (value) => {
        return transform(value);
        // return transform(either.right(value));
      }
    });
    // if(right(instance)){
    //   return transform(either.right(instance));
    // } else {
    //   return instance;
    // }
  };
};

// either: {
//   left: (value) => {
//     var self = this;
//     return self.pair.mkPair.bind(self)(value)(null);
//   },
//   right: (value) => {
//     var self = this;
//     return self.pair.mkPair.bind(self)(null)(value);
//   },
//   // either#map
//   map: function(instance){
//     var self = this;
//     self.monad.either.censor(instance);
//     return function(transform){
//       expect(transform).to.a('function');
//       if(self.existy(instance.right)){
//         return self.monad.either.right.bind(self)(transform(instance.right));
//       } else {
//         return self.monad.either.left.bind(self)(transform(instance.left));
//       }
//     };
//   },
//   },
//   bindM: (instance) => {
//     var self = this;
//     self.monad.either.censor.call(self,instance);
//     return (transform) => {
//       expect(transform).to.a('function');
//       return self.monad.either.flatMap.call(self,instance)(transform);
//     };
//   }
// }, /* end of 'either' monad */

module.exports = {
  match: match,
  unit: unit, 
  left: left, 
  right: right, 
  flatMap: flatMap,
};
