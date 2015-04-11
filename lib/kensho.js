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
	return __.stream.unfold.bind(__)(init)((n) => {
	  return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n)(n+1));
	});
  },
  bools:(rng) => {
    var self = this;
	return __.stream.map.bind(__)(self.randoms(rng))((n) => {
	  return n > 0.5 ? true : false;
	});
  },
  randomGen: (seed) => {
	return seedrandom(seed);
  },
  randoms: (rng) => {
	return __.stream.unfold.bind(__)(rng())((n) => {
	  return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n)(rng()));
	});
  },
  // kensho.forAll :: List[T] => Predicate => Bool
  forAll: (list) => {
    var self = this;
    __.list.censor(list);
    return function(predicate){
      expect(predicate).to.an('function');
      return __.list.and.bind(__)((__.list.map.bind(__)(list)(predicate)));
    };
  }
};
