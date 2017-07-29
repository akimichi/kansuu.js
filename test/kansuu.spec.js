"use strict";

const expect = require('expect.js');
const __ = require('../lib/kansuu.js');
const base = require('../lib/kansuu-base.js');
const math = require('../lib/kansuu-math.js');

describe("Kansuu module", () => {
  it("'id''", (next) => {
    expect(__.id(1)).to.be(1);
    expect(__.id(null)).to.be(null);
    next();
  });
  it("'typeOf''", (next) => {
    expect(
      __.typeOf(1)
    ).to.equal(
      'number'
    );
    expect(
      __.typeOf(null)
    ).to.equal(
      'null'
    );
    expect(
      __.typeOf(void(0))
    ).to.equal(
      'undefined'
    );
    expect(
      __.typeOf(undefined)
    ).to.equal(
      'undefined'
    );
    next();
  });
  describe("judgment predicates", function() {
    it("'existy'", (next) => {
      expect(__.existy(1)).to.be(true);
      expect(__.existy(null)).to.be(false);
      expect(__.existy(undefined)).to.be(false);
      expect(__.existy(false)).to.be(true);
      expect(__.existy(base.nothing)).to.be(false);
      expect(
        __.existy([])
      ).to.be(
        true
      );
      next();
    });
    it("'truthy'", (next) => {
      expect(__.truthy(1)).to.be(true);
      next();
    });
    it("'falsy'", (next) => {
      expect(__.falsy.bind(__)(1)).to.be(false);
      next();
    });
    describe("'isEmpty'", () => {
      it("isEmpty(list) ", (next) => {
        expect(
          __.isEmpty.bind(__)([])
        ).to.be(
          true
        );
        expect(
          __.isEmpty.bind(__)([1,2,3])
        ).to.be(
          false
        );
        next();
      });
      it("isEmpty(string) ", (next) => {
        expect(
          __.isEmpty.bind(__)("")
        ).to.be(
          true
        );
        expect(
          __.isEmpty.bind(__)("123")
        ).to.be(
          false
        );
        next();
      });
    });
  });
  // describe("'objects' module", () => {
  //   it("'empty'", (next) => {
  //     expect(
  //       __.objects.empty
  //     ).to.eql(
  //       {}
  //     );
  //     next();
  //   });
  //   it("'set'", (next) => {
  //     expect(
  //       __.objects.set.call(__, "a")(1)(__.objects.empty)
  //     ).to.eql(
  //       {"a": 1}
  //     );
  //     expect(
  //       __.compose.call(__, __.objects.set.call(__,"a")(1))(__.objects.set.call(__,"b")(2))(__.objects.empty)
  //     ).to.eql(
  //       {"a": 1, "b": 2}
  //     );
  //     next();
  //   });
  // });
  describe("tap", function() {
    it('can successfully hide sideeffects', function(next) {
      /* #@range_begin(tap_combinator_test) */
      var consoleSideEffect = function(any){
        console.log(any);
      };
      var target = 1;
      expect(
        __.tap(target)(consoleSideEffect)
      ).to.eql(
        1
      );
      var updateSideEffect = function(any){
        any = any + 1;
      };
      expect(
        __.tap(target)(updateSideEffect)
      ).to.eql(
        1
      );
      /* #@range_end(tap_combinator_test) */
      next();
    });
    it('can not hide exception', function(next) {
      /* #@range_begin(tap_combinator_exception_test) */
      var exceptionSideEffect = function(any){
        throw new Error(any);
      };
      var target = "error";
      expect(function(){
        return __.tap(target)(exceptionSideEffect);
      }).to.throwError();
      /* #@range_end(tap_combinator_exception_test) */
      next();
    });
  });
  describe("higher-order functions", function() {
    it("'until'", (next) => {
      expect(
        __.until(math.isMoreThan(100))(math.multiply(7))(1)
      ).to.eql(
        343
      );
      next();
    });
    describe("loop", function() {
      it('can iterate', function(next) {
        var lessThan = function(n){
          return function(x){
            return x < n;
          };
        };
        var succ = function(n){
          return n + 1;
        };
        expect(__.loop(lessThan(3))(0)(succ)).to.eql(3);
        next();
      });
    });
    describe("curry", function() {
      it("'curry' should curry function", function(next) {
        var addUncurried = function(n1,n2){
          return n1 + n2;
        };
        expect(
          addUncurried(1,2)
        ).to.eql(
          3
        );
        var addCurried = __.curry(addUncurried);
        expect(
          addCurried(1)(2)
        ).to.eql(
          3
        );
        next();
      });
    });
    describe("uncurry", () => {
      it("'uncurry' should curry function", (next) => {
        var addCurried = (n1) => {
          return (n2) => {
            return n1 + n2;
          };
        };
        var addUncurried = __.uncurry(addCurried);
        expect(
          addUncurried(1,2)
        ).to.eql(
          3
        );
        next();
      });
    });
  });
  /*
   curry (uncurry E ) = E
   uncurry (curry E ) = E
   */
  describe("functional composition", () => {
    describe("'compose'", () => {
      it("'compose one argument functions'", (next) => {
        var increment = (n) => {
          return n + 1;
        };
        var decrement = (n) => {
          return n - 1;
        };
        var double = (n) => {
          return 2 * n;
        };
        expect(__.compose(increment,decrement)(5)).to.be(5);
        expect(__.compose(decrement,increment)(5)).to.be(5);
        expect(__.compose(increment,increment)(5)).to.be(7);
        // (n * 2) + 1
        expect(__.compose(increment,double)(5)).to.be(11);
        // (n + 1) * 2
        expect(__.compose(double,increment)(5)).to.be(12);
        next();
      });
      // it("'compose two argument functions'", (next) => {
      //   var negate = (x) => {
      //     return -x;
      //   };
      //   var multiply = (x,y) => {
      //     return x * y;
      //   };
      //   expect(
      //       compose(negate,multiply)(2,3)
      //   ).to.eql(
      //     -6
      //   );
      //   next();
      // });
      // it("compose several functions", function(next) {
      //   var not = function(x){
      //     return ! x;
      //   };
      //   expect(
      //     __.compose.bind(__)(not)(math.isEqual(3))(3)
      //   ).to.eql(
      //       false
      //   );
      //   // expect(
      //   //   __.compose.bind(__)(__.not)(math.isEqual(3))(3)
      //   // ).to.eql(
      //   //  false
      //   // );
      //   next();
      // });
    });
    it("'flip'", function(next) {
      var divide = function(x){
        return function(y){
          return x / y;
        };
      };
      expect(divide(12)(3)).to.be(4);
      expect(__.flip.bind(__)(divide)(12)(3)).to.be(0.25);
      expect(__.flip.bind(__)(__.flip.bind(__)(divide))(12)(3)).to.be(4);
      next();
    });
    // it("'pipe'", function(next) {
    //   var increment = function(n){
    //     return n + 1;
    //   };
    //   var double = function(n){
    //     return 2 * n;
    //   };
    //   // (n + 1)* 2
    //   expect(__.pipe.bind(__)(increment)(double)(5)).to.be(12);
    //   // (n * 2) + 1
    //   expect(__.pipe.bind(__)(double)(increment)(5)).to.be(11);
    //   next();
    // });
  });
  it("times", (next) => {
    var succ = (n) => {
      return n + 1;
    };
    expect(
      __.times(3)(succ)(0)
    ).to.be(
      3
    );
    next();
  });
});
