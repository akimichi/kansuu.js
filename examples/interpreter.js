"use strict";

// A lambda calculus interpreter
// =============================
//
// * [The essence of functional programming](http://page.mi.fu-berlin.de/scravy/realworldhaskell/materialien/the-essence-of-functional-programming.pdf) by Philip Wadler
// * [Structuring functional programs by using monads](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.39.3974) by Davor Obradovic
//


const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  ID = require('../lib/kansuu.js').monad.identity,
  Pair = require('../lib/kansuu.js').pair,
  Maybe = require('../lib/kansuu.js').monad.maybe,
  List = require('../lib/kansuu.js').monad.list,
  Parser = require('../lib/kansuu.js').monad.parser;


// ### environment
// ~~~haskell
// type Environment = List[(Name, Value)]
// ~~~
const Env = {
  // ## 空の環境
  empty: (variable) => {
    return Maybe.nothing(variable);
  },
  /* 変数名に対応する値を環境から取りだす */
  lookup: (identifier, env) => {
    expect(identifier).to.a('string');
    return env(identifier);
  },
  /* 環境を拡張する */
  // extend:: Pair[String,Any] => FUN[]
  extend: (pair, oldEnv) => {
    return Pair.match(pair,{
      empty: (_) => {
        return Maybe.nothing(_);
      },
      cons: (identifier, value) => {
        expect(identifier).to.a('string');
        return (queryIdentifier) => {
          expect(queryIdentifier).to.a('string');
          if(identifier === queryIdentifier) {
            return Maybe.just(value);
          } else {
            return Env.lookup(queryIdentifier,oldEnv);
          }
        };
      }
    });
    // const identifier = Pair.left(pair);
    // const value = Pair.right(pair);
  }
};


const AST = {
};

// Syntax
// s-expression : atom
//              | "(" s-expression ")"
//              | list
// list         : "(" s-expression <s-expression> ")"
// atom         | letter atom-part
// atom-part    : empty
//              | letter atom-part
//              | number atom-part
// letter       | [a-zA-Z]
// number       | [0-9]
// empty        | " "
const Syntax = {
  s_exp: () => {
    return Parser.append(
      Syntax.atom()
    )(
      Parser.append(
        Parser.bracket(Parser.char("("), Syntax.s_exp, Parser.char(")"))
      )(
        Syntax.list() 
      )
    );
  },
  list: () => {
    return Parser.bracket(
      Parser.char("("), 
      Parser.many1(Syntax.s_exp), 
      Parser.char(")")
    )
  },
  atom: () => {
    // identifier
    return Parser.append(
      Parser.token(Parser.flatMap(Parser.ident())(ident => {
        return Parser.unit(List.toString(ident));
      }))
    )( // numeric
      Parser.append(
        Parser.token(Parser.flatMap(Parser.numeric())(numeric => {
          return Parser.unit(numeric);
        }))
      )( // string
        Parser.append(
          Parser.token(Parser.flatMap(Parser.string())(string => {
            return Parser.unit(string);
          }))
        )( 
          Syntax.bool()
        )
      )
    );
    // return Parser.flatMap(Parser.letter())(c => {
    //   return Parser.flatMap(Syntax.atom_part())(part => {
    //     const letter = List.toString(c);
    //     return Parser.unit(c + part);
    //   })
    // })
  },
  bool: () => {
    const trueLiteral = List.fromString("#t");
    const falseLiteral = List.fromString("#f");
    return Parser.append(
      Parser.token(Parser.flatMap(Parser.chars(trueLiteral))(_ => {
        return Parser.unit(List.unit(true));
      }))
    )(
      Parser.token(Parser.flatMap(Parser.chars(falseLiteral))(_ => {
        return Parser.unit(List.unit(false));
      }))
    );
  }
};

// ## Exp
const Exp = {
  match : (exp, pattern) => {
    return exp(pattern);
  },
  fail: (_) => {
    return (pattern) => {
      return pattern.fail(_);
    };
  },
  number: (n) => {
    return (pattern) => {
      return pattern.number(n);
    };
  },
  string: (value) => {
    return (pattern) => {
      return pattern.string(value);
    };
  },
  bool: (value) => {
    return (pattern) => {
      return pattern.bool(value);
    };
  },
  atom: (value) => {
    return (pattern) => {
      return pattern.atom(value);
    };
  },
  list: (items) => {
    return (pattern) => {
      return pattern.list(items);
    };
  },
  variable: (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  succ: (n) => {
    return (pattern) => {
      return pattern.succ(n);
    };
  },
  add: (n, m) => {
    return (pattern) => {
      return pattern.add(n,m);
    };
  },
  lambda: (variable, exp) => {
    expect(variable).to.a('function');
    return (pattern) => {
      return pattern.lambda(variable, exp);
    };
  },
  apply: (rator,rand) => {
    return (pattern) => {
      return pattern.apply(rator, rand);
    };
  }
};

// ## Evaluator
const Evaluator = {
  // ### plain#evaluate
  evaluate: (exp) => {
    return (environment) => {
      return Exp.match(exp, {
        fail: (_) => {
          return ID.unit(Maybe.nothing());
        },
        variable: (name) => {
          return ID.unit(Env.lookup(name, environment));
        },
        number: (n) => {
          expect(n).to.a('number');
          return ID.unit(Maybe.just(n));
        },
        bool: (value) => {
          expect(value).to.a('boolean');
          return ID.unit(Maybe.just(value));
        },
        succ: (exp)=> {
          return Maybe.flatMap(Evaluator.evaluate(exp)(environment))(n => {
            if(__.typeOf(n) === 'number') {
              return ID.unit(Maybe.just(n + 1));
            } else {
              return ID.unit(Maybe.nothing(n));
            }
          });
        },
        add: (expN,expM)=> {
          return Maybe.flatMap(Evaluator.evaluate(expN)(environment))(n => {
            return Maybe.flatMap(Evaluator.evaluate(expM)(environment))(m => {
              return ID.unit(Maybe.just(n + m));
            });
          });
        },
        lambda: (variable, bodyExp) => {
          return Exp.match(variable,{ 
            variable: (name) => {
              /* クロージャーを返す */
              return ID.unit(Maybe.just(
                (actualArg) => {
                  const newEnv = Env.extend(Pair.cons(name, actualArg),environment);
                  return Evaluator.evaluate(bodyExp)(newEnv);
                }
              ));
            }
          });
        },
        apply: (lambdaExp, arg) => {
          return Maybe.flatMap(Evaluator.evaluate(lambdaExp)(environment))(closure => {
            return Maybe.flatMap(Evaluator.evaluate(arg)(environment))(actualArg => {
              return ID.unit(closure(actualArg));
            });
          });
        }
      });
    };
  },
};


module.exports = {
  env: Env,
  evaluator: Evaluator, 
  exp: Exp, 
  syntax: Syntax
};


