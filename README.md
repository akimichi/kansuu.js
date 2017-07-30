# kansuu.js

Yet another functional programming library for node.js.

Please note that this module is in very experimental stage.
It requires node v8.1 or above.

The 'motto' of this library is 'the same power with less magic'.

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
const Stream = require('kansuu.js').stream,
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

const exp = {
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
~~~

~~~js
const evaluate = (exp) => {
  return (environment) => {
    return match(exp, {
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
            return Maybe.just(closure(actualArg));
          });
        });
      }
    });
  };
};
~~~

~~~js
const lambdaExp = exp.lambda(I.exp.variable("x"), exp.variable("x"));
const appExp = exp.apply(lambdaExp, I.exp.number(7));  
Maybe.flatMap(I.evaluate(appExp)(Env.empty))(maybeAnswer => {
  Maybe.flatMap(maybeAnswer)(answer => {
    expect(answer).to.eql(ID.unit(7));
  });
});
~~~



## Docs

~~~
$ node_modules/docco/bin/docco lib/kansuu.js
$ open doc/kansuu.html
~~~
