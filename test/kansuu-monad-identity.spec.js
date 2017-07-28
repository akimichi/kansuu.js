"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
const ID = require('../lib/kansuu-monad.js').identity;
// var seedrandom = require('seedrandom');
// var Random = require("random-js");
// var rng = Random.engines.mt19937();

describe("ID monad", () => {
  it("ID#flatMap", (next) => {
    var instance = ID.unit(1);
    expect(
      ID.flatMap(instance)((n) => {
        return ID.unit(n * 2);
      })
    ).to.eql(
     ID.unit(2)
    );
    expect(
      ID.flatMap(instance)((n) => {
        return ID.flatMap(ID.unit(n * 2))((m) => {
          return ID.unit(m * 3);
        });
      })
    ).to.eql(
      ID.unit(6)
    );
    expect(
      ID.flatMap(instance)((n) => {
        return ID.flatMap(ID.unit(n))((m) => {
          return ID.unit(m * n);
        });
      })
    ).to.eql(
      ID.unit(1)
    );
    next();
  });
});
