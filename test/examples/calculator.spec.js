"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu.js').monad.list,
  Parser = require('../../lib/kansuu.js').monad.parser,
  Pair = require('../../lib/kansuu.js').pair,
  expr = require('../../examples/calculator.js');

describe("'calculator' example", () => {

  const calculator = (input) => {
    return Pair.left(List.head(
      Parser.parse(expr())(List.fromString(input))
    ))
  };
  it('can calculate an expression via calculator', (next) => {
    expect(
       calculator("(1+2)-3")
    ).to.eql(
      0 
    );
    next();
  });

  it('can calculate number', (next) => {
    expect(
      Pair.left(List.head(
        Parser.parse(expr())(List.fromString("123"))
      ))
    ).to.eql(
      123 
    );
    next();
  });
  it('can calculate an expression', (next) => {
    expect(
      Pair.left(List.head(
        Parser.parse(expr())(List.fromString("1+2"))
      ))
    ).to.eql(
      3 
    );
    expect(
      Pair.left(List.head(
        Parser.parse(expr())(List.fromString("(1+2)-3"))
      ))
    ).to.eql(
      0 
    );
    next();
  });
});
