# kansuu.js

Yet another functional programming library for node.js.

Please note that this module is in very experimental stage.
It requires node v8.1 or above.

The 'motto' of this library is to have 'enough power with less magic'.

## Usage

~~~
$ git clone https://github.com/akimichi/kansuu.js.git
$ cd kansuu.js
kansuu.js$ nvm use
kansuu.js$ npm install
kansuu.js$ npm install -g mocha
kansuu.js$ npm test 
~~~

## Examples


### Prime numbers in stream

~~~js
const math = require('kansuu.js').math,
 Stream = require('kansuu.js').stream,
 Pair = require('kansuu.js').pair,
 Maybe = require('kansuu.js').monad.maybe,
 List = require('kansuu.js').monad.list;

const primes = Stream.cons(2, (_) => {
  const stream = Stream.unfold(3)(n => {
    return Maybe.just(Pair.cons(n, n+1));
  });
  return Stream.filter(stream)(math.isPrime); 
});

expect(
  List.toArray(Stream.take(primes)(20))
).to.eql(
  [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71]
);
~~~


### A monadic parser exampla: simple calculator 

~~~js
const math = require('kansuu.js').math,
  List = require('kansuu.js').monad.list,
  Pair = require('kansuu.js').pair,
  Parser = require('kansuu.js').monad.parser;

const expr = (_) => {
  return Parser.chainl1(factor, operator);
};

const operator = (_) => {
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

const factor = (_) => {
  return Parser.append(
    Parser.nat()
  )(
    Parser.bracket(Parser.char("("), expr, Parser.char(")"))
  );
};

const calculator = (input) => {
  return Pair.left(List.head(
    Parser.parse(expr())(List.fromString(input))
  ))
};
~~~

~~~js
describe("calculator", () => {
  it('can calculate an expression', (next) => {
    expect(
       calculator("(1+2)-3")
    ).to.eql(
      0 
    );
    next();
  });
~~~


### Lambda calculus interpreter


~~~js
const Env = {
  empty: (variable) => {
    return Maybe.nothing(variable);
  },
  lookup: (identifier, env) => {
    return env(identifier);
  },
  extend: (pair, oldEnv) => {
    return Pair.match(pair,{
      empty: (_) => {
        return Maybe.nothing(_);
      },
      cons: (identifier, value) => {
        return (queryIdentifier) => {
          if(identifier === queryIdentifier) {
            return Maybe.just(value);
          } else {
            return Env.lookup(queryIdentifier,oldEnv);
          }
        };
      }
    });
  }
};
~~~


~~~js
const match = (exp, pattern) => {
  return exp(pattern);
};

const Exp = {
  number: (n) => {
    return (pattern) => {
      return pattern.number(n);
    };
  },
  variable: (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  lambda: (variable, exp) => {
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
~~~

~~~js
const evaluate = (expression) => {
  return (environment) => {
    return match(expression, {
      variable: (name) => {
        return Env.lookup(name, environment);
      },
      number: (n) => {
        return Maybe.just(n);
      },
      lambda: (variable, bodyExp) => {
        return match(variable,{ 
          variable: (name) => {
            return Maybe.just(
              (actualArg) => {
                const newEnv = Env.extend(Pair.cons(name, actualArg),environment);
                return evaluate(bodyExp)(newEnv);
              }
            );
          }
        });
      },
      apply: (lambdaExp, arg) => {
        return Maybe.flatMap(evaluate(lambdaExp)(environment))(closure => {
          return Maybe.flatMap(evaluate(arg)(environment))(actualArg => {
            return closure(actualArg);
          });
        });
      }
    });
  };
};
~~~

~~~js
const lambdaExp = Exp.lambda(Exp.variable("x"), Exp.variable("x")),
  appExp = Exp.apply(lambdaExp, Exp.number(7));  

Maybe.flatMap(evaluate(appExp)(Env.empty))(answer => {
  expect(
    answer
  ).to.eql(
    7
  );
});
~~~



## Docs

~~~
$ node_modules/docco/bin/docco lib/kansuu.js
$ open doc/kansuu.html
~~~
