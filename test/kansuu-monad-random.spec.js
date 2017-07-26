"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
const List = require('../lib/kansuu-list.js');
const Maybe = require('../lib/kansuu-monad.js').maybe;
const Random = require("random-js");
var seedrandom = require('seedrandom');
var rng = Random.engines.mt19937();

describe("'random' monad", function() {
  // var int = __.monad.random.unit.bind(__)(0);
  // var ns = __.monad.random.flatMap.bind(__)(int)(x => {
  //   return __.monad.random.flatMap.bind(__)(int)(y => {
  //  return
  //   }
  // })
  it("random.int", function(next){
    //var rng = seedrandom("seed");
    rng.seed("seed");
    var intRandom = __.monad.random.int.bind(__)(rng);
    expect(
      intRandom.left
    ).to.eql(
      -1937831252
    );
    //var intRandom2 = __.monad.random.int.bind(__)(intRandom.right);
    expect(
      __.monad.random.int.bind(__)(intRandom.right).left
    ).to.eql(
      -884076225
    );
    expect(
      __.monad.random.int.bind(__)(intRandom.right).left
    ).to.eql(
      -505527131
    );
    // expect(
    //     __.monad.random.int.bind(__)(intRandom.right()).left
    // ).to.eql(
    //    2
    //    //4.612568818010603e+306
    // );
    next();
  });
  it("random.ints", function(next){
    var rng = Random.engines.mt19937();
    rng.seed("seed");
    var ints = __.monad.random.ints.bind(__)(3)(rng);
    expect(
      __.list.length.bind(__)(ints.left)
    ).to.eql(
      3
    );
    expect(
      __.list.toArray.bind(__)(ints.left)
    ).to.eql(
      [ -1937831252, -884076225, -725654408 ]
    );
    next();
  });
});
