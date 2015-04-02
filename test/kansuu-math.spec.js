"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("math module", function() {
  var math = require('../lib/kansuu.js').math;
  // it("'lower'", function(next) {
  //   expect(math.lower.bind(__)(17.3)).to.be(-1);
  //   next();
  // });
  it("'isPrime'", function(next) {
    expect(math.isPrime(3)).to.be(true);
    next();
  });
  it("'isMoreThan'", function(next) {
    expect(math.isMoreThan(3)(2)).to.be(false);
    next();
  });
  it("'leq'", function(next) {
    expect(
      math.leq.bind(__)(0)(0)
    ).to.be(true);
    expect(
      math.leq.bind(__)(0)(2)
    ).to.be(true);
    next();
  });
  describe("approximate", function() {
    it("'sqrt'", function(next) {
      var sqrt = __.math.approximate.bind(__)(__.math.improve_sqrt.bind(__))(0.001);
      expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
      expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
      var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
      expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
      next();
    });
  });
  describe("mkApproximate", function() {
    it("'configureSqrt'", function(next) {
      var precision = 0.001;
      var sqrt = __.math.mkApproximate.bind(__)(__.math.configureSqrt.bind(__)(precision));
      expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
      expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
      var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
      expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
      next();
    });
    it("'configureFunction'", function(next) {
      var precision = 0.001;
      var improve = function(n) {
        expect(n).to.a('number');
        return function improveGuess(guess){
          expect(guess).to.a('number');
          return (guess + (n / guess)) / 2.0;
        };  
      };
      var good_enough = function(guess) {
        expect(guess).to.a('number');
        return function isGoodEnough(n){
          expect(n).to.a('number');
          return Math.abs(guess * guess - n) < precision;
        };
      };
      var configureSqrt = __.math.configureFunction(improve)(good_enough);
      var sqrt = __.math.mkApproximate.bind(__)(configureSqrt(precision));
      expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
      expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
      var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
      expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
      next();
    });
  });
});
