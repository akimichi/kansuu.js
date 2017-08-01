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
// expr = term ‘chainl1‘ addop
// term = factor ‘chainr1‘ expop
// factor = nat ++ bracket (char ’(’) expr (char ’)’)
// addop = [(+) | _ <- char ’+’] ++ [(-) | _ <- char ’-’]
// expop = ops [(char ’^’, (^))]
// ~~~

const expr = () => {
  return Parser.chainl1(term, addop);
};

const term = () => {
  return Parser.chainr1(factor, expop);
};

const factor = () => {
  return Parser.append(
    Parser.nat()
  )(
    Parser.bracket(Parser.char("("), expr, Parser.char(")"))
  );
};

// const expop = () => {
//   return ops(Parser.unit(Pair.cons(Parser.char('^'), math.exponential)));
// };
const expop = () => {
  return Parser.unit(Parser.flatMap(Parser.char('^'))(_ => {
    return Parser.unit(math.exponential);
  }));
  // return Parser.append(
  //   Parser.flatMap(Parser.char('^'))(_ => {
  //     return Parser.unit(math.exponential);
  //   })
  // )(
  //   Parser.flatMap(Parser.char('^'))(_ => {
  //     return Parser.unit(math.exponential);
  //   })
  //   // Parser.unit(Parser.unit(Parser.zero))
  // );
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

// ~~~haskell
// ops :: [(Parser a, b)] -> Parser b
// ops xs = foldr1 (++) [[op | _ <- p] | (p,op) <- xs] 
// ~~~
const ops = (xs) => {
  return List.foldr1(Parser.flatMap(xs)(pair => {
    return Pair.match(pair, {
      cons: (p, op) => {
        return Parser.flatMap(p)(_ => {
          return Parser.unit(op);
        });
      }
    })
  })(Parser.append));
};



// // addop = ops [(char ’+’, (+)), (char ’-’, (-))]
// const addop = () => {
//   return ops(List.cons(Pair.cons(Parser.char('+'),math.add),
//               List.cons(
//                 List.cons(Pair.cons(Parser.char('-'),math.subtract), 
//                   List.empty()))));
// };


module.exports = expr; 
