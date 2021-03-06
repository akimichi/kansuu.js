"use strict";

/*
  property-based test library
*/

var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var Stream = require('../lib/kansuu-stream.js');
var List = require('../lib/kansuu-monad.js').list;
var Pair = require('../lib/kansuu-pair.js');
var Maybe = require('../lib/kansuu-monad.js').maybe;
var expect = require('expect.js');
var seedrandom = require('seedrandom');

// kensho.ints
// ints :: Int => Stream[Int]
const ints = (init) => {
  expect(init).to.a('number');
  return Stream.unfold(init)((n) => {
    return Maybe.unit(Pair.cons(n,n+1));
  });
};

const bools = (rng) => {
  return Stream.map(randoms(rng))((n) => {
    return n > 0.5 ? true : false;
  });
};

const randomGen = (seed) => {
  return seedrandom(seed);
};

const randoms = (rng) => {
  return Stream.unfold(rng())((n) => {
    return Maybe.unit(Pair.cons(n, rng()));
  });
};
// kensho.forAll :: List[T] => Predicate => Bool
const forAll = (alist) => {
  return (predicate) => {
    expect(predicate).to.an('function');
    return List.and((List.map(alist)(predicate)));
  };
};

module.exports = {
  // kensho.ints
  // ints :: Int => Stream[Int]
  ints: ints,
  bools: bools,
  randomGen: randomGen, 
  randoms: randoms, 
  // kensho.forAll :: List[T] => Predicate => Bool
  forAll: forAll 
};
