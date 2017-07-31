"use strict";

// A simple calculator example 
// =============================
//


const __ = require('../lib/kansuu.js'),
  ID = require('../lib/kansuu.js').monad.identity,
  Pair = require('../lib/kansuu.js').pair,
  Maybe = require('../lib/kansuu.js').monad.maybe,
  Parser = require('../lib/kansuu.js').monad.parser,
  math = require('../lib/kansuu.js').math,
  expect = require('expect.js');

// ~~~haskell
// expr :: Parser Int
// addop :: Parser (Int -> Int -> Int)
// factor :: Parser Int
//
// expr = factor ‘chainl1‘ addop
// addop = [(+) | _ <- char ’+’] ++ [(-) | _ <- char ’-’]
// factor = nat ++ bracket (char "(") expr (char ")")
// ~~~

const expr = () => {
  return Parser.chainl1(factor, addop);
};

const addop = () => {
  return Parser.append(
    Parser.flatMap(Parser.char('+'))(_ => {
      return Parser.unit(math.add);
    })
  )(
    Parser.flatMap(Parser.char('-'))(_ => {
      return Parser.unit(math.subtract);
    })
  );
};

const factor = () => {
  return Parser.append(
    Parser.nat()
  )(
    Parser.bracket(Parser.char("("), expr, Parser.char(")"))
  );
};

module.exports = expr; 
