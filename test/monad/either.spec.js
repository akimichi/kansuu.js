"use strict";

const util = require('util'),
  expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  Either = require('../../lib/kansuu.js').monad.either;

// ### Eitherモナドのテスト
describe("Eitherモナドをテストする",() => {
  it("数値のときだけ計算が成功するテスト", (next) => {
    Either.match(Either.flatMap(Either.left("wrong"))((n) => {
      return Either.unit(n + 1);
    }),{
      right: (value) => {
        expect().fail();
      },
      left: (value) => {
        expect(value).to.eql("wrong");
      }
    });
    Either.match(Either.flatMap(Either.unit(2))((n) => {
      return Either.unit(n + 1);
    }),{
      right: (value) => {
        expect(
          value
        ).to.eql(
          3
        );
      },
      left: (value) => {
        expect().fail();
      }
    });
    next();
  });
});
