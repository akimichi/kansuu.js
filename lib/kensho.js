"use strict";

/*
  property-based test library
*/

var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var expect = require('expect.js');
var seedrandom = require('seedrandom');

module.exports = {
  // kensho.ints
  // ints :: Int => Stream[Int]
  ints: (init) => {
    expect(init).to.a('number');
    var succ = (n) => {
      return n + 1;
    };
    return __.stream.from.call(__,init)(succ);
    // return __.stream.unfold.call(__)(init)((n) => {
    //   return __.monad.maybe.unit.call(__,__.pair.cons.call(__,n)(n+1));
    // });
  },
  bools:(rng) => {
    var self = this;
    return __.stream.map.call(__,self.randoms(rng))((n) => {
      return n > 0.5 ? true : false;
    });
  },
  randomGen: (seed) => {
    return seedrandom(seed);
  },
  randoms: (rng) => {
    return __.stream.unfold.call(__,rng())((n) => {
      return __.monad.maybe.unit.bind(__)(__.pair.cons.call(__,n)(rng()));
    });
  },
  // kensho.forAll :: List[T] => Predicate => Bool
  forAll: (list) => {
    var self = this;
    __.list.censor(list);
    return (predicate) => {
      expect(predicate).to.an('function');
      return __.list.and.call(__,(__.list.map.call(__,list)(predicate)));
    };
  }
};
