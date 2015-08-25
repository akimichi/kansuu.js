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
  describe("'logging' interpreter", () => {
    describe("evaluate", () => {
      it('can evaluate variable', (next) => {
        var exp = intp.logging.exp.variable("a");
        var env = intp.logging.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.logging.env.empty);
        expect(
          intp.logging.evaluate.call(intp,exp)(env)
        ).to.eql(
          intp.logging.unit.call(intp,1)
        );
        next();
      });
      it('can evaluate number', (next) => {
        var exp = intp.logging.exp.number(2);
        expect(
          intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty)
        ).to.eql(
          intp.logging.unit.call(intp,2)
        );
        next();
      });
      it('can evaluate logging', (next) => {
        var exp = intp.logging.exp.log(intp.logging.exp.number(2));
        expect(
          intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).value
        ).to.eql(
          2
        );
        expect(
          __.list.toArray.call(__,intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log)
        ).to.eql(
          [2]
        );
        expect(function () {
          var n = intp.logging.exp.number(2);
          var m = intp.logging.exp.number(3);
          var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
          return intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).value;
        }()).to.eql(
          5
        );
        expect(function () {
          var n = intp.logging.exp.number(2);
          var m = intp.logging.exp.number(3);
          var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
          return __.list.toArray.call(__,
                                      intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log);
        }()).to.eql(
          [5]
        );
        expect(function () {
          var n = intp.logging.exp.log(intp.logging.exp.number(2));
          var m = intp.logging.exp.log(intp.logging.exp.number(3));
          var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
          return __.list.toArray.call(__,
                                      intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log);
        }()).to.eql(
          [2,3,5]
        );
        next();
      });
    });
  });
  describe("'ambiguous' interpreter", () => {
    describe("evaluate", () => {
      it('can evaluate number', (next) => {
        var exp = intp.ambiguous.exp.number(2);
        expect(
          intp.ambiguous.evaluate.call(intp,exp)(intp.ambiguous.env.empty).isEqual(intp.ambiguous.unit(2))
        ).to.ok();
        next();
      });
      it('can evaluate variable', (next) => {
        var exp = intp.ambiguous.exp.variable("a");
        var env = intp.ambiguous.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.ambiguous.env.empty);
        expect(
          intp.ambiguous.evaluate.call(intp,exp)(env).isEqual(intp.ambiguous.unit.call(intp,1))
        ).to.ok();
        next();
      });
      it('can evaluate (\\x.x + x)(amd (2,3)) = [4,6]', (next) => {
        this.timeout(5000);
        var x = intp.ambiguous.exp.variable("x");
        var addition = intp.ambiguous.exp.add(x)(x);
        var lambda = intp.ambiguous.exp.lambda("x")(addition);
        var n = intp.ambiguous.exp.number(2);
        var m = intp.ambiguous.exp.number(3);
        var amb = intp.ambiguous.exp.amb.call(intp,n)(m);
        var application = intp.ambiguous.exp.app(lambda)(amb);
        expect(
          intp.ambiguous.evaluate.call(intp,application)(intp.ambiguous.env.empty).isEqual(__.list.mkList.call(__,[4,6]))
        ).to.ok();
        next();
      });
    });
  });
  describe("'lazy' interpreter", () => {
    describe("evaluate", () => {
      it('can evaluate number', (next) => {
        var exp = intp.lazy.exp.number(2);
        expect(
          intp.lazy.evaluate.call(intp,exp)(intp.lazy.env.empty).isEqual(intp.lazy.unit(2))
        ).to.ok();
        next();
      });
      it('can evaluate variable', (next) => {
        var exp = intp.lazy.exp.variable("a");
        var n = intp.lazy.unit(1);
        var env = intp.lazy.env.extend.call(intp, __.pair.mkPair.call(__,"a")(n),intp.lazy.env.empty);
        //console.log(intp.lazy.evaluate.call(intp,exp)(env));
        expect(
          intp.lazy.evaluate.call(intp,exp)(env).isEqual(intp.lazy.unit.call(intp,1))
        ).to.ok();
        next();
      });
      it('can evaluate (\\x.x + x)(amd (2,3)) = [4,5,5,6]', (next) => {
        this.timeout(5000);
        var x = intp.lazy.exp.variable("x");
        var addition = intp.lazy.exp.add(x)(x);
        var lambda = intp.lazy.exp.lambda("x")(addition);
        var n = intp.lazy.exp.number(2);
        var m = intp.lazy.exp.number(3);
        var amb = intp.lazy.exp.amb.call(intp,n)(m);
        var application = intp.lazy.exp.app(lambda)(amb);
        expect(
          intp.lazy.evaluate.call(intp,application)(intp.lazy.env.empty).isEqual(__.list.mkList.call(__,[4,5,5,6]))
        ).to.ok();
        next();
      });
    });
  });
  describe("'cps' interpreter", () => {
    describe("evaluate", () => {
      it('can evaluate number', (next) => {
        var exp = intp.cps.exp.number(2);
        expect(
          intp.cps.evaluate.call(intp,exp)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
        ).to.equal(
          2
        );
        next();
      });
      it('can evaluate variable', (next) => {
        var exp = intp.cps.exp.variable("a");
        var env = intp.cps.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.cps.env.empty);
        expect(
          intp.cps.evaluate.call(intp,exp)(env)(__.monad.identity.unit.bind(intp))
        ).to.equal(
          1
        );
        next();
      });
      it('can evaluate (\\x.x)(2) = 2', (next) => {
        this.timeout(5000);
        var x = intp.cps.exp.variable("x");
        var n = intp.cps.exp.number(2);
        var lambda = intp.cps.exp.lambda("x")(x);
        var application = intp.cps.exp.app(lambda)(n);
        expect(
          intp.cps.evaluate.call(intp,application)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
        ).to.equal(
          2
        );
        next();
      });
      it('can evaluate (\\x.x+x)(2) = 4', (next) => {
        this.timeout(5000);
        var x = intp.cps.exp.variable("x");
        var addition = intp.cps.exp.add(x)(x);
        var lambda = intp.cps.exp.lambda("x")(addition);
        var n = intp.cps.exp.number(2);
        var application = intp.cps.exp.app(lambda)(n);
        expect(
          intp.cps.evaluate.call(intp,application)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
        ).to.equal(
          4
        );
        next();
      });
    });
  });
  // describe("'callcc' interpreter", () => {
  //   describe("evaluate", () => {
  //     it('can evaluate (Add (Num 1) (Callcc "k" (Add (Num 2) (App (Var "k") (Num 4)))))', (next) => {
  //       this.timeout(5000);
  //       var k = intp.callcc.exp.variable("k");
  //       var one = intp.cps.exp.number(1);
  //       var two = intp.callcc.exp.number(2);
  //       var four = intp.callcc.exp.number(4);
  //       var expression = intp.cps.exp.add(one)(intp.callcc.exp.callcc.call(intp,"k")(intp.cps.exp.add(two)(intp.cps.exp.app(k)(four))));
  //       expect(
  //         intp.callcc.evaluate.call(intp,expression)(intp.callcc.env.empty)
  //       ).to.equal(
  //         2
  //       );
  //       next();
  //     });
  //   });
  // });
});
