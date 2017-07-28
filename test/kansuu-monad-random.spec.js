"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
const List = require('../lib/kansuu-list.js'),
  Maybe = require('../lib/kansuu-monad.js').maybe,
  Pair = require('../lib/kansuu-pair.js'),
  Random = require('../lib/kansuu-monad.js').random;
const RandomJs = require("random-js"),
 rng = RandomJs.engines.mt19937();
var seedrandom = require('seedrandom');

describe("'random' monad", function() {
  // var int = __.monad.random.unit.bind(__)(0);
  // var ns = __.monad.random.flatMap.bind(__)(int)(x => {
  //   return __.monad.random.flatMap.bind(__)(int)(y => {
  //  return
  //   }
  // })
  it("random.int", (next) => {
    //var rng = seedrandom("seed");
    rng.seed("seed");
    var intRandom = Random.int(rng);
    expect(
      Pair.left(intRandom)
    ).to.eql(
      -1937831252
    );
    // //var intRandom2 = __.monad.random.int.bind(__)(intRandom.right);
    // expect(
    //   __.monad.random.int.bind(__)(intRandom.right).left
    // ).to.eql(
    //   -884076225
    // );
    // expect(
    //   __.monad.random.int.bind(__)(intRandom.right).left
    // ).to.eql(
    //   -505527131
    // );
    // expect(
    //     __.monad.random.int.bind(__)(intRandom.right()).left
    // ).to.eql(
    //    2
    //    //4.612568818010603e+306
    // );
    next();
  });
  it("random.ints", (next) => {
    const rng = RandomJs.engines.mt19937();
    rng.seed("seed");
    const ints = Random.ints(3)(rng);
    expect(
      List.length(Pair.left(ints))
    ).to.eql(
      3
    );
    expect(
      List.toArray(Pair.left(ints))
    ).to.eql(
      [ -1937831252, -884076225, -725654408 ]
    );
    next();
  });
});
