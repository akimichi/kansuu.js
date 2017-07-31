"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Calculator = require('../../examples/calculator.js'),
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu.js').monad.list,
  Parser = require('../../lib/kansuu.js').monad.parser,
  Pair = require('../../lib/kansuu.js').pair;

describe("'calculator' example", () => {
  it('can calculate number', (next) => {
    expect(
      Pair.left(List.head(
        Parser.parse(Calculator())(List.fromString("123"))
      ))
    ).to.eql(
      0 
    );
    next();
  });
});
