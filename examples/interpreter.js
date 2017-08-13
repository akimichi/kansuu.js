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
  // "+": (n) => {
  //   return (m) => {
  //     return Maybe.just(n+m);
  //   };
  // },
  "+": math.add, 
  "-": math.subtract, 
  "*": math.multiply, 
  "/": math.divide,
  "succ": math.succ, 
  "add": math.add, 
  "subtract": math.subtract, 
  "multiply": math.multiply, 
  "divide": math.divide, 
  "not": __.not(__.id),
  "numberp": (arg) => {
    return (__.typeOf(arg) === 'number');
  }
};

// ## Evaluator
const Evaluator = {
  // apply: (fun,args) => {
  //   return (environment) => {
  //     return Array.foldl1(args)(N => {
  //       return (M) => {
  //         return Maybe.flatMap(M)(m => {
  //           return Maybe.flatMap(N)(n => {
  //             return Maybe.just(fun(n)(m));
  //           });
  //         });
  //       };
  //     });
  //   };
  // },
  evaluateLambda: (exp) => {
    return (environment) => {
      const arg = Array.head(Array.tail(exp)),
        body = Array.head(Array.tail(Array.tail(exp)));
      console.log(`arg: ${arg}`)
      // expect(arg).to.a('string');
      expect(arg).to.a('array');
      console.log("arg:" + arg)
      console.log("body: " + body)

      const closure = (actualArg) => {
        console.log("actualArg: " + actualArg)
        const newEnv = Env.extend(Pair.cons(arg, actualArg),environment);
        return Evaluator.evaluate(body)(newEnv);
      };
      console.log("return from evaluateLambda")
      // return closure;
      return closure;
    };
  },
  apply: (maybeClosure, args) => {
    expect(args).to.a('array');
    return (environment) => {
      // const answer = Array.foldr1(tail)(N => {
      //   console.log("N: " + N)
      //   return (M) => {
      //   console.log("M: " + M)
      //     return Maybe.flatMap(maybeClosure)(closure => {
      //       return Maybe.just(closure(N)(M));
      //       // return closure(n)(m);
      //     });
      //   };
      // });
      // return answer;
      const answer = Array.foldr1(args)(N => {
        return (M) => {
          console.log("M: " + M)
          return Maybe.flatMap(maybeClosure)(closure => {
            return Maybe.flatMap(N)(n => {
              console.log("n: " + n)
              return Maybe.flatMap(M)(m => {
                console.log("m: " + m)
                console.log("closure(n)(m): " + closure(n)(m))
                return Maybe.just(closure(n)(m));
                // return closure(n)(m);
              });
            });
          });
        };
      });
      return answer;
      // return Array.foldl1(operands)(N => {
      //   return (M) => {
      //     return Maybe.flatMap(N)(n => {
      //       console.log("n: " + n)
      //       return Maybe.flatMap(M)(m => {
      //         console.log("m: " + m)
      //         return Maybe.flatMap(maybeClosure)(closure => {
      //           return Maybe.just(closure(n)(m));
      //           // return closure(n)(m);
      //         });
      //       });
      //     });
      //   };
      // });
    };
  },
  evaluateApplication: (exp) => {
    const lambda = Array.head(exp),
      args = Array.tail(exp);
    return (environment) => {
      console.log("typeOf(exp): " + __.typeOf(exp))
      console.log(`exp: ${exp}`)
      console.log("lambda: " + lambda)
      console.log("typeOf(args): " + __.typeOf(args))
      console.log(`args: ${args}`)
      const closure = Evaluator.evaluateLambda(lambda);
      if(Array.length(args) === 1) {
        const arg = Array.head(args);
        console.log(`arg: ${arg}`)
          const answer = Maybe.flatMap(Evaluator.evaluate(arg)(environment))(oneArg => {
              console.log(`oneArg: ${oneArg}`)
              return closure(oneArg);
          });
          // console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
          return answer;
      } else {
        const answer = Array.foldl1(args)(N => {
          return (M) => {
            return Maybe.flatMap(Evaluator.evaluate(N)(environment))(n => {
              return Maybe.flatMap(Evaluator.evaluate(M)(environment))(m => {
                return Maybe.just(closure(n)(m));
              });
            });
          };
        });
        console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
          return answer;
      }
      // const answer = Array.foldl1(args)(N => {
      //   return (M) => {
      //     console.log(`M: ${M}, N:${N} `)
      //     return Maybe.flatMap(Evaluator.evaluateLambda(lambda))(closure => {
      //       console.log(`closure(2)(3): ${closure(2)(3)}`)
      //       return Maybe.just(closure(N)(M));
      //     });
      //   };
      // });
      // console.log(`answer: ${answer}`)
      // return Maybe.just(answer);
    };
  },
  // ### Evaluator#evaluate
  evaluate: (exp) => {
    return (environment) => {
      if(__.typeOf(exp) === 'number') {
        console.log("EVALUATE number: " + exp)
        return ID.unit(Maybe.just(exp));
      }
      if(__.typeOf(exp) === 'boolean') {
        return ID.unit(Maybe.just(exp));
      }
      if(__.typeOf(exp) === 'string') {
        // case of buildin function/operator
        const builtInClocure = buildin[exp];
        if(builtInClocure){
          console.log("EVALUATE builtInClocure: " + exp)
          return Maybe.just(builtInClocure); 
        } else {
          // case of identifier
          console.log("EVALUATE variable: " + exp)
          const answer = Env.lookup(exp,environment)
          console.log(`variable: ${exp}:${Maybe.get(answer)}`)
          return answer;
        }
      }
      // case of S-expression 
      if(__.typeOf(exp) === 'array') {
        const head = Array.head(exp);
        // λ式の評価
        if(head === "lambda") {
          console.log("EVALUATE lambda: " + exp)
          // ["lambda", [arg], body]    
          return Evaluator.evaluateLambda(exp)(environment);
        } 
        if(buildin[head]) {
          const builtInClocure = buildin[head];
          const args = Array.tail(exp);
          expect(args).to.a('array');
          console.log("EVALUATE builtInClocure: " + head)
          console.log("args: " + args)
          const firstArg = Array.head(args),
            restArgs = Array.tail(args);
          if(Array.length(args) === 1) {
            const arg = Array.head(args);
            const answer = Maybe.flatMap(Evaluator.evaluate(arg)(environment))(oneArg => {
              return Maybe.just(builtInClocure(oneArg));
            });
            console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
            return answer;
          } else {
            const answer = Array.foldl1(args)(N => {
              return (M) => {
                return Maybe.flatMap(Evaluator.evaluate(N)(environment))(n => {
                  return Maybe.flatMap(Evaluator.evaluate(M)(environment))(m => {
                    return Maybe.just(builtInClocure(n)(m));
                  });
                });
              };
            });
            console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
            return answer;
          }
          // console.log(`Maybe.get(answer): ${Maybe.get(answer)}`)
          // return answer;
        } else {
          console.log("EVALUATE application: " + exp)
          return Evaluator.evaluateApplication(exp)(environment);
        }
      }
    };
  },
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


