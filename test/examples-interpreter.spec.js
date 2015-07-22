"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var intp = require('../examples/interpreter.js');

describe("'interpreter' example", () => {
  describe("ordinary", () => {
    describe("environment", () => {
      it('can lookup env', (next) => {
        var env = intp.ordinary.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.ordinary.env.empty);
        expect(
          intp.ordinary.env.lookup.call(intp,"a", env)
        ).to.eql(
          intp.ordinary.unit.call(intp,1)
        );
        next();
      });
    });
    describe("evaluate", () => {
      it('can evaluate variable', (next) => {
        var exp = intp.ordinary.exp.variable("a");
        var env = intp.ordinary.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.ordinary.env.empty);
        expect(
          intp.ordinary.evaluate.call(intp,exp)(env)
        ).to.eql(
          intp.ordinary.unit.call(intp,1)
        );
        next();
      });
      it('can evaluate number', (next) => {
        var exp = intp.ordinary.exp.number(2);
        expect(
          intp.ordinary.evaluate.call(intp,exp)(intp.ordinary.env.empty)
        ).to.eql(
          intp.ordinary.unit.call(intp,2)
        );
        next();
      });
      it('can evaluate add', (next) => {
        var n = intp.ordinary.exp.number(2);
        var m = intp.ordinary.exp.number(3);
        var exp = intp.ordinary.exp.add(n)(m);
        expect(
          intp.ordinary.evaluate.call(intp,exp)(intp.ordinary.env.empty)
        ).to.eql(
          intp.ordinary.unit.call(intp,5)
        );
        next();
      });
      it('can evaluate identity function', (next) => {
        var n = intp.ordinary.exp.number(2);
        var lambda = intp.ordinary.exp.lambda("x")(intp.ordinary.exp.variable("x"));
        var application = intp.ordinary.exp.app(lambda)(n);
        expect(
          intp.ordinary.evaluate.call(intp,application)(intp.ordinary.env.empty)
        ).to.eql(
          intp.ordinary.unit.call(intp,2)
        );
        next();
      });
      it('can evaluate (\\x.x + x)(10 + 11) = 42', (next) => {
        var ten = intp.ordinary.exp.number(10);
        var eleven = intp.ordinary.exp.number(11);
        var addition = intp.ordinary.exp.add(ten)(eleven);
        var lambda = intp.ordinary.exp.lambda("x")(intp.ordinary.exp.add(intp.ordinary.exp.variable("x"))(intp.ordinary.exp.variable("x")));
        var application = intp.ordinary.exp.app(lambda)(addition);
        expect(
          intp.ordinary.evaluate.call(intp,application)(intp.ordinary.env.empty)
        ).to.eql(
          intp.ordinary.unit.call(intp,42)
        );
        next();
      });
    });
  });
});
