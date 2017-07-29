"use strict";

const expect = require('expect.js'),
  __ = require('./kansuu.js'),
  math = require('./kansuu-math.js'),
  Pair = require('./kansuu-pair.js'),
  List = require('./kansuu-monad.js').list;


/*
 * S x y z = (x z)(y z)
 */
const S = (x) => {
  return (y) => {
    return (z) => {
      return (x(z))(y(z));
    };
  };
};
const K = (x) => {
  return (y) => {
    return x;
  };
};
const I = (any) =>  {
  return any;
};
/*
 B f g x = f(g(x))
 */
const B = (x) =>  {
  return (y) => {
    return (z) => {
      return x(y(z));
    };
  };
};
/*
     C f g x = f x g
 */
const  C = (x) =>  {
  return (y) => {
    return (z) => {
      return (x(z))(y);
    };
  };
};
const Y = (F) => {
  return (function(g) {
    return function(x) {
      return F(g(g))(x);
    };
  })(function(g) {
    return function(x) {
      return F(g(g))(x);
    };
  });
};

module.exports = {
  S: S,
  K: K,
  I: I,
  B: B,
  C: C,
  Y: Y
};


