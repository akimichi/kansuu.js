"use strict";

// A lambda calculus interpreter
// =============================
//
// * [The essence of functional programming](http://page.mi.fu-berlin.de/scravy/realworldhaskell/materialien/the-essence-of-functional-programming.pdf) by Philip Wadler
// * [Structuring functional programs by using monads](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.39.3974) by Davor Obradovic
//


const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  math = require('../lib/kansuu-math.js'),
  Array = require('../lib/kansuu-array.js'),
  ID = require('../lib/kansuu.js').monad.identity,
  String = require('../lib/kansuu-string.js'),
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
        return (key) => {
          return Maybe.nothing(_);
        };
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
          (() => {
            return Parser.flatMap(Syntax.s_exp())(sexp => {
              return Parser.unit([sexp])
            });
            // return Syntax.s_exp();
          }),
          Parser.char(")"))
      )(
        Syntax.list() 
      )
    );
  },
  list: () => {
    return Parser.bracket(
      Parser.token(Parser.char("(")), 
      () => {
        // return Parser.many1(Syntax.s_exp());
        // return Parser.flatMap(Syntax.s_exp())(sexp => {
        //   return Parser.flatMap(Parser.many(Syntax.s_exp()))(sexps => {
        //     return Parser.unit(Parser.cons(sexp, sexps));
        //   });
        // });
        return Parser.flatMap(Parser.many1(Syntax.s_exp()))(sexps => {
          return Parser.unit(sexps)
        });
      },
      Parser.token(Parser.char(")"))
    )
  },
  atom: () => {
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
      if(buildin[x]){
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

const keywords = ["lambda"]; 

const buildin = {
  "+": (n) => {
    return (m) => {
      return ID.unit(n+m);
    };
  },
  "-": (n) => {
    return (m) => {
      return ID.unit(n-m);
    };
  },
  "*": (n) => {
    return (m) => {
      return ID.unit(n*m);
    };
  },
  "/": (n) => {
    return (m) => {
      return ID.unit(n/m);
    };
  },
  "succ": (n) => {
    return ID.unit(n+1);
  },
  "add": (n) => {
    return (m) => {
      return ID.unit(n+m);
    };
  },
  "subtract": (n) => {
    return (m) => {
      return ID.unit(n-m);
    };
  },
  "multiply": (n) => {
    return (m) => {
      return ID.unit(n*m);
    };
  },
  "divide": (n) => {
    return (m) => {
      return ID.unit(n/m);
    };
  },
  "not": (arg) => {
    return ID.unit(!arg);
  },
  "numberp": (arg) => {
    return ID.unit((__.typeOf(arg) === 'number'));
  }
};

// ## Evaluator
const Evaluator = {
  // ### Evaluator#evaluate
  // evaluate:: Exp => ID[Value]
  evaluate: (exp) => {
    return (environment) => {
      console.log(`EVALUATE : ${exp}`)
      if(__.typeOf(exp) === 'number') {
        console.log("EVALUATE number: " + exp)
        return ID.unit(exp);
      }
      if(__.typeOf(exp) === 'boolean') {
        return ID.unit(exp);
      }
      if(__.typeOf(exp) === 'string') {
        // case of buildin function/operator
        const builtInClocure = buildin[exp];
        if(builtInClocure){
          console.log("EVALUATE builtInClocure: " + exp)
          return ID.unit(builtInClocure); 
        } else {
          // case of identifier
          console.log("EVALUATE variable: " + exp)
          const answer = Env.lookup(exp,environment)
          return Maybe.match(answer, {
            nothing: (_) => {
              throw new Error(`variable ${exp} not found`)
            },
            just: (value) => {
              return value;
            }
          });
        }
      }
      // case of S-expression 
      if(__.typeOf(exp) === 'array') {
        const head = Array.head(exp);
        // λ式の評価
        if(head === "lambda") {
          // ["lambda", [arg], body]    
          return Evaluator.evaluateLambda(exp)(Env.empty);
        } 
        if(buildin[head]) {
          // const builtInClocure = buildin[head];
          return Evaluator.applyBuiltin(exp)(environment);
        } else {
          return Evaluator.apply(exp)(environment);
        }
      }
    };
  },
  // evaluateLambda:: Exp => ID[Closure]
  // convert lambda expression ["lambda", "x", "x"] to the closure
  //                                      arg  body
  evaluateLambda: (exp) => {
    return (environment) => {
      console.log(`EVALUATE lambda: ${exp}`)
      const arg = Array.head(Array.tail(exp)),
        body = Array.head(Array.tail(Array.tail(exp)));
      expect(arg).to.a('string');
      console.log(`arg: ${arg}`)
      console.log("body: " + body)

      const closure = (actualArg) => {
        console.log("actualArg: " + actualArg)
        const newEnv = Env.extend(Pair.cons(arg, actualArg),environment);
        return Evaluator.evaluate(body)(newEnv);
      };
      console.log("return from evaluateLambda")
      return ID.unit(closure);
    };
  },
  apply: (exp) => {
    expect(exp).to.a('array');
    return (environment) => {
      const head = Array.head(exp),
        arg = Array.head(Array.tail(exp));
      if(__.typeOf(head) === 'array') {
        const closure = Evaluator.evaluateLambda(head)(environment);
        return Evaluator.applyClosure(closure, arg)(environment);
      } else {
        console.log("EVALUATE application: " + exp)
        const head = Array.head(exp);
        console.log(`head: ${head}`)
        const args = Array.tail(exp);
        expect(args).to.a('array');
        return ID.flatMap(Evaluator.evaluate(head)(environment))(closure => {
          return Evaluator.applyClosure(closure, args)(environment);
        });
      }
    };
  },
  // applyBuiltin:: Exp => ID[Value]
  // ["+", 1, "x"] to the value
  applyBuiltin: (exp) => {
    return (environment) => {
      const head = Array.head(exp),
       args = Array.tail(exp);
      expect(args).to.a('array');
      console.log("applyBuiltin: " + head)
      console.log("args: " + args)
      const first = Array.head(args),
        rest = Array.tail(args);
      console.log(`first: ${first}`)
      console.log(`rest: ${rest}`)

      const builtInClocure = buildin[head];

      if(Array.length(args) === 1) {
        const value = ID.flatMap(Evaluator.evaluate(Array.head(args))(environment))(N => {
          console.log(`N: ${N}`)
          return ID.unit(builtInClocure(N));
        });
        return value;
      } else {
        const evaluatedArgs = Array.map(args)(item => {
          return Evaluator.evaluate(item)(environment);
        });
        const value = Array.foldl(Array.tail(evaluatedArgs))(Array.head(evaluatedArgs))(N => {
          console.log(`N: ${N}`)
          return (M) => {
            console.log(`M: ${M}`)
            return ID.unit(builtInClocure(N)(M));
          };
        });
        return value;
      }
      // const value = Array.foldl(rest)(Evaluator.evaluate(first)(environment))(N => {
      // const value = Array.foldl(rest)(first)(N => {
      //   console.log(`N: ${N}`)
      //   return (M) => {
      //     console.log(`M: ${M}`)
      //     return ID.flatMap(Evaluator.evaluate(N)(environment))(n => {
      //       return ID.flatMap(Evaluator.evaluate(M)(environment))(m => {
      //         return ID.unit(builtInClocure(n)(m));
      //       });
      //     });
      //   };
      // });
    };
  },
  applyClosure: (closure, arg) => {
    console.log(`EVALUATE apply: arg=${arg}`)
    expect(arg).not.to.a('array');
    return (environment) => {
      const answer = ID.flatMap(Evaluator.evaluate(arg)(environment))(actualArg => {
        console.log(`actualArg: ${actualArg}`)
        return ID.unit(closure(actualArg));
      });
      return answer;
      // expect(Array.length(args)).to.eql(1)
      // if(Array.length(args) === 1) {
      //   const arg = Array.head(args);
      //   console.log(`arg: ${arg}`)
      //   const answer = ID.flatMap(Evaluator.evaluate(arg)(environment))(actualArg => {
      //     console.log(`actualArg: ${actualArg}`)
      //     return ID.unit(closure(actualArg));
      //   });
      //   return answer;
      // } else {
      //   const answer = Array.foldl1(args)(N => {
      //     console.log(`N: ${N}`)
      //     return (M) => {
      //       console.log(`M: ${M}`)
      //       return ID.flatMap(Evaluator.evaluate(N)(environment))(n => {
      //         return ID.flatMap(Evaluator.evaluate(M)(environment))(m => {
      //           return ID.unit(closure(n)(m));
      //         });
      //       });
      //     };
      //   });
      //   return answer;
      // }
    };
  },
  // evaluateApplication: (exp) => {
  //   const lambda = Array.head(exp),
  //     args = Array.tail(exp);
  //   return (environment) => {
  //     console.log("typeOf(exp): " + __.typeOf(exp))
  //     console.log(`exp: ${exp}`)
  //     console.log("lambda: " + lambda)
  //     console.log("typeOf(args): " + __.typeOf(args))
  //     console.log(`args: ${args}`)
  //     const closure = Evaluator.evaluateLambda(lambda);
  //     if(Array.length(args) === 1) {
  //       const arg = Array.head(args);
  //       console.log(`arg: ${arg}`)
  //         const answer = ID.flatMap(Evaluator.evaluate(arg)(environment))(actualArg => {
  //             console.log(`actualArg: ${actualArg}`)
  //             return closure(actualArg);
  //         });
  //         return answer;
  //     } else {
  //       const answer = Array.foldl1(args)(N => {
  //         console.log(`N: ${N}`)
  //         return (M) => {
  //           console.log(`M: ${M}`)
  //           return ID.flatMap(Evaluator.evaluate(N)(environment))(n => {
  //             return ID.flatMap(Evaluator.evaluate(M)(environment))(m => {
  //               return ID.unit(closure(n)(m));
  //             });
  //           });
  //         };
  //       });
  //       console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
  //         return answer;
  //     }
  //   };
  // },
};

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

// ## Exp
// const Exp = {
//   match : (exp, pattern) => {
//     return exp(pattern);
//   },
//   add: (n, m) => {
//     return (pattern) => {
//       return pattern.add(n,m);
//     };
//   },
//   fail: (_) => {
//     return (pattern) => {
//       return pattern.fail(_);
//     };
//   },
//   number: (n) => {
//     return (pattern) => {
//       return pattern.number(n);
//     };
//   },
//   string: (value) => {
//     return (pattern) => {
//       return pattern.string(value);
//     };
//   },
//   bool: (value) => {
//     return (pattern) => {
//       return pattern.bool(value);
//     };
//   },
//   atom: (value) => {
//     return (pattern) => {
//       return pattern.atom(value);
//     };
//   },
//   list: (items) => {
//     return (pattern) => {
//       return pattern.list(items);
//     };
//   },
//   variable: (name) => {
//     return (pattern) => {
//       return pattern.variable(name);
//     };
//   },
//   succ: (n) => {
//     return (pattern) => {
//       return pattern.succ(n);
//     };
//   },
//   lambda: (variable, exp) => {
//     expect(variable).to.a('function');
//     return (pattern) => {
//       return pattern.lambda(variable, exp);
//     };
//   },
//   apply: (rator,rand) => {
//     return (pattern) => {
//       return pattern.apply(rator, rand);
//     };
//   }
// };

const Interpreter = {
  // interpret :: String => Maybe[Any]
  interpret: (source) => {
    const parseResults = Parser.parse(Syntax.s_exp())(source);
    if(Array.isEmpty(parseResults) === true) {
      return Maybe.nothing();
    }
    const result =  Array.head(parseResults),
      remaining = result.remaining,
      exp = result.value;

    if(String.isEmpty(remaining) === false) {
      return Maybe.nothing();
    }
    const answer = Evaluator.evaluate(exp)(Env.empty);
    return Maybe.match(answer, {
      nothing: (_) => {
        return "";
      },
      just: (value) => {
        return `${value}`;
      }
    });
  }
};

module.exports = {
  env: Env,
  evaluator: Evaluator, 
  syntax: Syntax,
  interpreter: Interpreter
};


