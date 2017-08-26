"use strict";

const util = require('util'),
  expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  ID = require('../../lib/kansuu-monad.js').identity;

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
