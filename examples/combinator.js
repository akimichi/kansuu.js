"use strict";

// combinator example
// ==================
//

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  and: (p) => {
    return (q) => {
      return p && q;
    };
  };
  or: function(p){
    return function(q){
      return p || q;
    };
  },
  not: (p) => {
    return ! p;
  },
};
