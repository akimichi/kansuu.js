"use strict";

// A simple calculator example 
// =============================
//


const __ = require('../lib/kansuu.js'),
  ID = require('../lib/kansuu.js').monad.identity,
  Pair = require('../lib/kansuu.js').pair,
  Maybe = require('../lib/kansuu.js').monad.maybe,
  Parser = require('../../lib/kansuu.js').monad.parser;
  expect = require('expect.js');

// ~~~haskell
// expr :: Parser Int
// addop :: Parser (Int -> Int -> Int)
// factor :: Parser Int
//
// expr = [f x y | x <- expr, f <- addop, y <- factor] ++ factor
// addop = [(+) | _ <- char ’+’] ++ [(-) | _ <- char ’-’]
// factor = nat ++ bracket (char ’(’) expr (char ’)’)
// ~~~


module.exports = {
};

