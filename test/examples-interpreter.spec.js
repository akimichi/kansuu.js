"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var intp = require('../examples/interpreter.js');

describe("'interpreter' example", () => {
  describe("ordinary", () => {
    it('can lookup env', (next) => {
      var env = intp.ordinary.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.ordinary.env.empty);
      expect(
        intp.ordinary.env.lookup.call(intp,"a", env)
      ).to.eql(
        __.monad.maybe.unit.call(__,1)
      );
      next();
    });
    it('can evaluate variable', (next) => {
      var exp = intp.ordinary.exp.variable("a");
      var env = intp.ordinary.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.ordinary.env.empty);
      expect(
        intp.ordinary.evaluate.call(intp,exp)(env)
      ).to.eql(
        __.monad.maybe.unit.call(__,1)
      );
      next();
    });
  });
});
