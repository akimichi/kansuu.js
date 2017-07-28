"use strict";

var expect = require('expect.js');
const Pair = require('../lib/kansuu-pair.js');

describe("'pair' module", () => {
  it("'left' should get the left part of the pair", (next) => {
    var apair = Pair.mkPair(1)(2);
    expect(
      Pair.left(apair)
    ).to.eql(
      1
    );
    next();
  });
  it("'swap' should swap the content of a pair", function(next) {
    var apair = Pair.mkPair(1)(2);
    expect(
      Pair.left(Pair.swap(apair))
    ).to.eql(
      2
    );
    next();
  });
});
