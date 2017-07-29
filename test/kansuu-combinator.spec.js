"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 base = require('../lib/kansuu-base.js'),
 combinator =  require('../lib/kansuu-combinator.js'),
 math = require('../lib/kansuu-math.js');

var S = combinator.S;
var K = combinator.K;
var I = combinator.I;
var B = combinator.B;
var C = combinator.C;

describe("combinators", () => {
  it('I', (next) => {
    expect(I(1)).to.eql(1);
    next();
  });
  it('SKK == I', (next) => {
    expect(S(K)(K)(0)).to.eql(0);
    expect(S(K)(K)("a")).to.eql("a");
    next();
  });
  it('T == K', function(next) {
    var T = K;
    expect(T(1)(0)).to.eql(1);
    next();
  });
  it('S add I 7 == 14', function(next) {
    expect(S(__.add)(I)(7)).to.eql(14);
    next();
  });
  it('succ == S(S(K add)(K 1)) I', function(next) {
    var succ = S(S(K(__.add))(K(1)))(I);
    expect(succ(0)).to.eql(1);
    expect(succ(1)).to.eql(2);
    next();
  });
  it('fac', function(next) {
    // var plus = function(x){
    //    return function(y){
    //      return x + y;
    //    };
    // };
    // var multiply = function(x){
    //    return function(y){
    //      return x * y;
    //    };
    // };
    // var divide = function(x){
    //    return function(y){
    //      return x / y;
    //    };
    // };
    // var minus = function(x){
    //    return function(y){
    //      return x - y;
    //    };
    // };
    // var eq = function(x){
    //    return function(y){
    //      return (x === y);
    //    };
    // };
    // var cond = function(pred){
    //    return function(x){
    //      return function(y){
    //        if(pred){
    //          return x();
    //        } else {
    //          return y();
    //        }
    //      };
    //    };
    // };
    var averageX = function(x){
      return C(B(__.div)(__.add(x)))(2);
      //return C(B(__.divide)(__.add(x)))(2);
      //return C(B(divide)(plus(x)))(2);
    };
    expect(averageX(1)(3)).to.eql(2);
    expect(averageX(2)(4)).to.eql(3);
    // var average = C(B(C(B(B(divide))(plus)))(2));
    // expect(average(1)(3)).to.eql(2);
    // var fac = S(C(B(cond(eq(0))))(1)
    //              S(multiply(B(fac(C(minus)(1))))));
    next();
  });
  // it('SK == false', function() {
  //  var F = (x) => {
  //    return (y) => {
  //      return S(K)(x)(y);
  //    };
  //  };
  //  expect(F(1)(0)).to.eql(1);
  // });
  it("'until'", (next) => {
    expect(
      __.until(math.isMoreThan(100))(math.multiply(7))(1)
    ).to.eql(
      343
    );
    next();
  });
});

