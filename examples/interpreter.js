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

const operators = /[+\-*\/]/;

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
        Parser.bracket(
          Parser.char("("), 
          Parser.flatMap(Syntax.s_exp)(sexp => {
            return Parser.unit(sexp);
          }),
          Parser.char(")"))
      )(
        Syntax.list() 
      )
    );
  },
  list: () => {
    return Parser.bracket(
      Parser.char("("), 
      () => {
        return Parser.many(Syntax.s_exp());
      },
      // () => {
      //   return Parser.flatMap(Parser.many(Syntax.s_exp()))(sexps => {
      //     return Parser.unit(sexps);
      //   });
      // },
      Parser.char(")")
    )
  },
  atom: () => {
    // return Parser.alt(
    //   Parser.token(Parser.ident()),
    return Parser.token(Parser.alt(
      Parser.numeric(),
      Parser.alt(
        Syntax.bool(),
        Parser.alt(
          Parser.ident(),
          Parser.alt(
            Syntax.operator(),
            Parser.string())))));
    // return Parser.append(
    //   Parser.token(Parser.ident())
    // )( // numeric
    //   Parser.append(
    //     Parser.token(Parser.numeric())
    //   )( // string
    //     Parser.append(
    //       Parser.token(Parser.flatMap(Parser.string())(string => {
    //         return Parser.unit(string);
    //       }))
    //     )( 
    //       Syntax.bool()
    //     )
    //   )
    // );
    // return Parser.flatMap(Parser.letter())(c => {
    //   return Parser.flatMap(Syntax.atom_part())(part => {
    //     const letter = List.toString(c);
    //     return Parser.unit(c + part);
    //   })
    // })
  },
  operator: () => {
    const isOperator = (x) => {
      // if(x.match(/[+\-*\/]/)){
      if(x.match(operators)){
        return true;
      } else {
        return false;
      } 
    };
    return Parser.sat(isOperator);
  },
  bool: () => {
    return Parser.append(
      Parser.token(Parser.flatMap(Parser.chars("#t"))(_ => {
        return Parser.unit(true);
      }))
    )(
      Parser.token(Parser.flatMap(Parser.chars("#f"))(_ => {
        return Parser.unit(false);
      }))
    );
  }
};


// ## Evaluator
const Evaluator = {
  applyOperator: (op,args) => {
    return (environment) => {
      const ops = {
        "+": (n) => {
          return (m) => {
            return n + m;
          };
        },
        "-": (n) => {
          return (m) => {
            return n - m;
          };
        },
        "*": (n) => {
          return (m) => {
            return n * m;
          };
        },
        "/": (n) => {
          return (m) => {
            return n / m;
          };
        }
      };
      const operator = ops[op];
      // return operator( 
    };
  },
  // ### Evaluator#evaluate
  evaluate: (exp) => {
    return (environment) => {
      if(__.typeOf(exp) === 'array') {
        // operator application
        if(Array.isEmpty(exp) === true) {
          return ID.unit(Maybe.just([]));
        } else {
          const head = Array.head(exp),
            tail = Array.tail(exp);
          if(head.match(operators)){
            return Evaluator.applyOperator(head, 
                Array.map(tail)(Evaluator.evaluate))(environment);
          } else {
            return ID.unit(Maybe.nothing());
          } 
        }
        return ID.unit(Maybe.just(exp));
      } else {
        return ID.unit(Maybe.just(exp));
      }
      // return Exp.match(exp, {
      //   fail: (_) => {
      //     return ID.unit(Maybe.nothing());
      //   },
      //   variable: (name) => {
      //     return ID.unit(Env.lookup(name, environment));
      //   },
      //   number: (n) => {
      //     expect(n).to.a('number');
      //     return ID.unit(Maybe.just(n));
      //   },
      //   bool: (value) => {
      //     expect(value).to.a('boolean');
      //     return ID.unit(Maybe.just(value));
      //   },
      //   succ: (exp)=> {
      //     return Maybe.flatMap(Evaluator.evaluate(exp)(environment))(n => {
      //       if(__.typeOf(n) === 'number') {
      //         return ID.unit(Maybe.just(n + 1));
      //       } else {
      //         return ID.unit(Maybe.nothing(n));
      //       }
      //     });
      //   },
      //   add: (expN,expM)=> {
      //     return Maybe.flatMap(Evaluator.evaluate(expN)(environment))(n => {
      //       return Maybe.flatMap(Evaluator.evaluate(expM)(environment))(m => {
      //         return ID.unit(Maybe.just(n + m));
      //       });
      //     });
      //   },
      //   lambda: (variable, bodyExp) => {
      //     return Exp.match(variable,{ 
      //       variable: (name) => {
      //         /* クロージャーを返す */
      //         return ID.unit(Maybe.just(
      //           (actualArg) => {
      //             const newEnv = Env.extend(Pair.cons(name, actualArg),environment);
      //             return Evaluator.evaluate(bodyExp)(newEnv);
      //           }
      //         ));
      //       }
      //     });
      //   },
      //   apply: (lambdaExp, arg) => {
      //     return Maybe.flatMap(Evaluator.evaluate(lambdaExp)(environment))(closure => {
      //       return Maybe.flatMap(Evaluator.evaluate(arg)(environment))(actualArg => {
      //         return ID.unit(closure(actualArg));
      //       });
      //     });
      //   }
      // });
    };
  },
};


// ## Exp
const Exp = {
  match : (exp, pattern) => {
    return exp(pattern);
  },
  add: (n, m) => {
    return (pattern) => {
      return pattern.add(n,m);
    };
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
module.exports = {
  env: Env,
  evaluator: Evaluator, 
  exp: Exp, 
  syntax: Syntax
};


