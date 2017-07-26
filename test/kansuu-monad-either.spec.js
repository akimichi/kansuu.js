"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();
const Either = require('../lib/kansuu-monad.js').either;

describe("'either' monad", function() {
  var unit = Either.unit;
  it("'either#unit'", function(next) {
    expect(
      unit(1)
    ).to.eql(
      __.pair.mkPair.call(__,null)(1)
    );
    next();
  });
  it("'either#flatMap'", function(next) {
    var flatMap = __.monad.either.flatMap.bind(__);
    var left = __.monad.either.left.call(__, 2);
    var right = __.monad.either.unit.call(__, 2);
    expect(
      flatMap(left)(function(n){
        return unit(n + 1);
      })
    ).to.eql(
      left
    );
    expect(
      flatMap(right)(function(n){
        return unit(n + 1);
      })
    ).to.eql(
      unit(3)
    );
    next();
  });
  it("'either#bindM'", function(next) {
    var bindM = __.monad.either.bindM.bind(__);
    var left = __.monad.either.left.call(__, 2);
    var right = __.monad.either.unit.call(__, 2);
    expect(
      bindM(left)(function(n) {
        return unit(n + 1);
      })
    ).to.eql(
      left
    );
    expect(
      bindM(right)(function(n) {
        return unit(n + 1);
      })
    ).to.eql(
      unit(3)
    );
    next();
  });
});
describe("'either' monad", function() {
  // var unit = __.monad.either.unit.bind(__);
  it("'either#unit'", function(next) {
    expect(
      unit(1)
    ).to.eql(
      __.pair.mkPair.call(__,null)(1)
    );
    next();
  });
  it("'either#flatMap'", function(next) {
    var flatMap = __.monad.either.flatMap.bind(__);
    var left = __.monad.either.left.call(__, 2);
    var right = __.monad.either.unit.call(__, 2);
    expect(
      flatMap(left)(function(n){
        return unit(n + 1);
      })
    ).to.eql(
      left
    );
    expect(
      flatMap(right)(function(n){
        return unit(n + 1);
      })
    ).to.eql(
      unit(3)
    );
    next();
  });
  it("'either#bindM'", function(next) {
    var bindM = __.monad.either.bindM.bind(__);
    var left = __.monad.either.left.call(__, 2);
    var right = __.monad.either.unit.call(__, 2);
    expect(
      bindM(left)(function(n) {
        return unit(n + 1);
      })
    ).to.eql(
      left
    );
    expect(
      bindM(right)(function(n) {
        return unit(n + 1);
      })
    ).to.eql(
      unit(3)
    );
    next();
  });
});
