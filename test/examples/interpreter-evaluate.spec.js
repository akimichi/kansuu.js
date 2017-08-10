"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Array = require('../../lib/kansuu-array.js'),
  Env = require('../../examples/interpreter.js').env,
  Exp = require('../../examples/interpreter.js').exp,
  Syntax = require('../../examples/interpreter.js').syntax,
  Interpreter = require('../../examples/interpreter.js').interpreter,
  ID = require('../../lib/kansuu.js').monad.identity,
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu.js').monad.list,
  Parser = require('../../lib/kansuu.js').monad.parser,
  Pair = require('../../lib/kansuu.js').pair;

describe("evaluator", () => {
  describe("evaluator", () => {
    const I = require('../../examples/interpreter.js').evaluator;

    it('can evaluate number', (next) => {
      Maybe.match(I.evaluate(2)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(2);
        }
      });
      next();
    });
    it('can evaluate operator', (next) => {
      Maybe.match(I.evaluate(['+', 1, 2])(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(3));
        }
      });
      Maybe.match(I.evaluate(['+', 1, ["*", 2, 3]])(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(7));
        }
      });
      // Maybe.match(I.evaluate(['+', 1, "x"])(Env.extend(Pair.cons("x",2), Env.empty)),{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     expect(value).to.eql(ID.unit(3));
      //   }
      // });
      next();
    });
    it('can evaluate variable', (next) => {
      const env = Env.extend(Pair.cons("a",1), Env.empty);

      Maybe.match(I.evaluate("a")(env),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(1));
        }
      });
      next();
    });
    it('can evaluate function application', (next) => {
      // ~~~js
      // ((x) => {
      //   return x; 
      // })(3)
      // => 3
      // ~~~

      Maybe.match(I.evaluate([["lambda", "x", "x"], 3])(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(3));
        }
      });
      const answer  = I.evaluate([["lambda", ["x"], ["+", 1, "x"]], 3])(Env.empty);
      console.log("answer: " + answer)
      Maybe.match(answer,{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          // expect().fail()
          expect(value).to.eql(ID.unit(3));
        }
      });
      next();
    });
    // it("can't evaluate succ with boolean", (next) => {
    //   var f = Exp.bool(false);
    //   var succExp = Exp.succ(f);
    //   Maybe.match(I.evaluate(succExp)(Env.empty),{
    //     nothing: (_) => {
    //       expect(true).to.be.ok()
    //     },
    //     just: (value) => {
    //       expect().fail()
    //     }
    //   });
    //   next();
    // });
    // it('can evaluate add', (next) => {
    //   const one = Exp.number(1),
    //     two = Exp.number(2),
    //     addExp = Exp.add(one, two);
    //   Maybe.match(I.evaluate(addExp)(Env.empty),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(ID.unit(3));
    //     }
    //   });
    //   next();
    // });
    // it('can evaluate nested add', (next) => {
    //   const one = Exp.number(1),
    //     two = Exp.number(2),
    //     addExp = Exp.add(one, Exp.add(one, two));
    //   Maybe.match(I.evaluate(addExp)(Env.empty),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(ID.unit(4));
    //     }
    //   });
    //   next();
    // });
    // it('can evaluate lambda expression', (next) => {
    //   // ~~~js
    //   // ((x) => {
    //   //   return x; 
    //   // })(3)
    //   // => 3
    //   // ~~~
    //   const lambdaExp = Exp.lambda(Exp.variable("x"), Exp.variable("x"));
    //   Maybe.match(I.evaluate(lambdaExp)(Env.empty),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (closure) => {
    //       Maybe.flatMap(closure(3))(answer => {
    //         expect(answer).to.eql(ID.unit(3));
    //       });
    //     }
    //   });
    //   next();
    // });
  });
});
