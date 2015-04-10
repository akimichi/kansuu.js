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
	return __.stream.sequence.bind(__)(init)(base.succ);
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
	return __.stream.sequence.bind(__)(rng())(function(){
	  return rng();
	});
  },
  forAll: (list) => {
    var self = this;
    __.list.censor(list);
    return function(predicate){
      expect(predicate).to.an('function');
      var result = __.list.and.bind(__)((__.list.map.bind(__)(list)(predicate)));
      expect(result).to.be(true);
    };
  }
};
