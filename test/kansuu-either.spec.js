"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
const Pair = require('../lib/kansuu-pair.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();
const Either = require('../lib/kansuu-either.js');

describe("'either' monad", () => {
  const unit = Either.unit;
  const flatMap = Either.flatMap;
  const left = Either.left;
  const right = Either.right;

  it("'either#unit'", (next) => {
    Either.match(unit(1),{
      left: (value) => {
        expect().fail()
      },
      right: (value) => {
        expect(value).to.eql(1)
      }
    });
    next();
  });
  it("'either#flatMap'", (next) => {
    const leftOne = left(1);
    Either.match(flatMap(leftOne)(n => {
      return unit(n + 1);
    }),{
      left: (value) => {
        expect(value).to.eql(1)
      },
      right: (value) => {
        expect().fail()
      }
    });
    const rightOne = right(1);
    Either.match(flatMap(rightOne)(n => {
      return unit(n + 1);
    }),{
      left: (value) => {
        expect().fail()
      },
      right: (value) => {
        expect(value).to.eql(2)
      }
    });
    next();
  });
});
// describe("'either' monad", function() {
//   it("'either#bindM'", function(next) {
//     var bindM = __.monad.either.bindM.bind(__);
//     var left = __.monad.either.left.call(__, 2);
//     var right = __.monad.either.unit.call(__, 2);
//     expect(
//       bindM(left)(function(n) {
//         return unit(n + 1);
//       })
//     ).to.eql(
//       left
//     );
//     expect(
//       bindM(right)(function(n) {
//         return unit(n + 1);
//       })
//     ).to.eql(
//       unit(3)
//     );
//     next();
//   });
// });
