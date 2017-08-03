"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu.js').monad.list,
  Parser = require('../../lib/kansuu.js').monad.parser,
  Pair = require('../../lib/kansuu.js').pair,
  Array = require('../../lib/kansuu-array.js'),
  expr = require('../../examples/calculator.js');

describe("'calculator' example", () => {

  const calculator = (input) => {
    return Array.head(Parser.parse(expr())(input)).value;
  };
  it('can calculate an expression via calculator', (next) => {
    expect(
       calculator("(1+2)-3")
    ).to.eql(
      0 
    );
    expect(
       calculator("(1+2)")
    ).to.eql(
      3 
    );
    // expect(
    //    calculator("((1+2)^3)")
    // ).to.eql(
    //   0 
    // );
    next();
  });

  // it('can calculate exponential', (next) => {
  //   expect(
  //     Parser.parse(expr())("(1+2)^3")
  //   ).to.eql(
  //     [] 
  //   );
  //   next();
  // });
  it('can calculate number', (next) => {
    expect(
      Parser.parse(expr())("123")
    ).to.eql(
      [{value:123, remaining: ''}]
    );
    next();
  });
  it('can calculate an expression', (next) => {
    expect(
      Parser.parse(expr())("1+2")
    ).to.eql(
      [{value:3, remaining: ''}]
    );
    expect(
      Parser.parse(expr())("(1+2)-3")
    ).to.eql(
      [{value:0, remaining: ''}]
    );
    next();
  });
});
