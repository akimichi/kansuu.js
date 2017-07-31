"use strict";

// A simple calculator example 
// =============================
//


const __ = require('../lib/kansuu.js'),
  ID = require('../lib/kansuu.js').monad.identity,
  Pair = require('../lib/kansuu.js').pair,
  Maybe = require('../lib/kansuu.js').monad.maybe,
  List = require('../lib/kansuu.js').monad.list,
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

// // ~~~haskell
// // ops :: [(Parser a, b)] -> Parser b
// // ops xs = foldr1 (++) [[op | _ <- p] | (p,op) <- xs]
// // ~~~
// const ops = (xs) => {
//   return List.foldr1(Parser.flatMap(xs)(pair => {
//     return Pair.match(pair, {
//       cons: (p, op) => {
//         return Parser.flatMap(p)(_ => {
//           return Parser.unit(op);
//         });
//       }
//     })
//   })(Parser.append));
// };
// // addop = ops [(char ’+’, (+)), (char ’-’, (-))]
// const addop = () => {
//   return ops(List.cons(Pair.cons(Parser.char('+'),math.add),
//               List.cons(
//                 List.cons(Pair.cons(Parser.char('-'),math.subtract), 
//                   List.empty()))));
// };


const factor = () => {
  return Parser.append(
    Parser.nat()
  )(
    Parser.bracket(Parser.char("("), expr, Parser.char(")"))
  );
};

module.exports = expr; 
