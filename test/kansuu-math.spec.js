"use strict";

const expect = require('expect.js');
const __ = require('../lib/kansuu.js');
const base = require('../lib/kansuu-base.js');
const math = require('../lib/kansuu-math.js');
const List = require('../lib/kansuu-monad.js').list;

describe("math module", () => {
  describe("arithmetic", () => {
    it("div", (next) => {
      expect(
        math.divides(6)(2)
      ).to.be(
        false 
      );
      expect(
        math.divides(1)(2)
      ).to.be(
        true 
      );
      expect(
        math.divides(0)(2)
      ).to.be(
        false 
      );
      next();
    });
  });
  it("'isPrime'", (next) => {
    expect(
      math.isPrime(3)
    ).to.be(
      true
    );
    expect(
      math.isPrime(2)
    ).to.eql(
      true
    );
    next();
  });

  it("'isMoreThan'", (next) => {
    expect(math.isMoreThan(2)(3)).to.be(true);
    next();
  });
  it("'isLessThan'", (next) => {
    expect(math.isLessThan(3)(2)).to.be(true);
    next();
  });
  it("'leq'", (next) => {
    expect(
      math.leq(0)(0)
    ).to.be(true);
    expect(
      math.leq(0)(2)
    ).to.be(true);
    next();
  });
  it("'geq'", (next) => {
    expect(
      math.geq(0)(0)
    ).to.be(true);
    expect(
      math.geq(2)(1)
    ).to.be(true);
    next();
  });
  it("'factors'", (next) =>{
    expect(
      List.toArray(math.factors(84))
    ).to.eql(
      [ 2, 2, 3, 7 ]
    );
    expect(
      List.toArray(math.factors(123))
    ).to.eql(
      [3,41]
    );
    next();
  });
  // it("'lower'", function(next) {
  //   expect(math.lower.bind(__)(17.3)).to.be(-1);
  //   next();
  // });
//   it("'innerProduct'", function(next) {
//     expect(
//       math.innerProduct.bind(__)(__.list.mkList.bind(__)([0,1]))(__.list.mkList.bind(__)([1,0]))
//     ).to.be(
//       0
//     );
//     expect(
//       math.innerProduct.bind(__)(__.list.mkList.bind(__)([1,2,3]))(__.list.mkList.bind(__)([6,5,4]))
//     ).to.be(
//       28
//     );
//     next();
//   });
//   it("'primes'", function(next) {
//     this.timeout(5000);
//     var primes = math.primes.bind(math)();
//     expect(
//       toArray(__.stream.take.bind(__)(primes)(3))
//     ).to.eql(
//       [ 2, 3, 5]
//     );
//     expect(
//       toArray(__.stream.take.bind(__)(primes)(10))
//     ).to.eql(
//       [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ]
//     );
//     next();
//   });
//   describe("approximate", function() {
//     it("'sqrt'", function(next) {
//       var sqrt = math.approximate.call(math,
//                                        math.improve_sqrt.bind(__))(0.001);
//       expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
//       expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
//       var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
//       expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
//       next();
//     });
//   });
//   describe("mkApproximate", function() {
//     it("'configureSqrt'", function(next) {
//       var precision = 0.001;
//       var sqrt = math.mkApproximate.bind(__)(math.configureSqrt.bind(__)(precision));
//       expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
//       expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
//       var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
//       expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
//       next();
//     });
//     it("'configureFunction'", function(next) {
//       var precision = 0.001;
//       var improve = function(n) {
//         expect(n).to.a('number');
//         return function improveGuess(guess){
//           expect(guess).to.a('number');
//           return (guess + (n / guess)) / 2.0;
//         };
//       };
//       var good_enough = function(guess) {
//         expect(guess).to.a('number');
//         return function isGoodEnough(n){
//           expect(n).to.a('number');
//           return Math.abs(guess * guess - n) < precision;
//         };
//       };
//       var configureSqrt = math.configureFunction(improve)(good_enough);
//       var sqrt = math.mkApproximate.bind(__)(configureSqrt(precision));
//       expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
//       expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
//       var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
//       expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
//       next();
//     });
//   });
});
