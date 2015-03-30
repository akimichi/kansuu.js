"use strict";

/*
  property-based test library
*/

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var seedrandom = require('seedrandom');

module.exports = {
  /*
  configure: function(config){
  },
   */
  ints: function(init){
    expect(init).to.a('number');
    return __.stream.cons.bind(__)(init)(function (n){
      return n + 1;
    });
  },
  randoms: function(seed){
    var rng = seedrandom(seed);
    return __.stream.cons.bind(__)(rng())(function (_){
      return rng();
    });
  },
  forAll: function (list) {
    var self = this;
    __.list.censor(list);
    return function(predicate){
      expect(predicate).to.an('function');
      var result = __.list.and.bind(__)((__.list.map.bind(__)(list)(predicate)));
      expect(result).to.be(true);
    };
  }
};
