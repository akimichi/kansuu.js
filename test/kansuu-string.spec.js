"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'string' module", function() {
  it("'head'", function(next) {
  	expect(__.string.head.bind(__)("abc")).to.be("a");
    next();
  });
  it("'tail'", function(next) {
  	expect(__.string.tail.bind(__)("abc")).to.be("bc");
    next();
  });
  it("'toArray'", function(next) {
  	expect(__.string.toArray.bind(__)("abc")).to.eql([ 'a', 'b', 'c' ]);
    next();
  });
});
