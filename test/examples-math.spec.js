"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var math = require('../examples/math.js');

describe("'math' example", () => {
  it('multiplyOf', (next) => {
  	expect(
  	  math.multiplyOf(2)(4)
  	).to.eql(
  	  true
  	);
  	next();
  });
  it('isPrime', (next) => {
  	expect(
  	  math.isPrime(1)
  	).to.eql(
  	  false
  	);
  	expect(
  	  math.isPrime(3)
  	).to.eql(
  	  true
  	);
  	next();
  });
});
