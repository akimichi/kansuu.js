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

module.exports = {
  match: match,
  unit: unit, 
  left: left, 
  right: right, 
  flatMap: flatMap,
};
