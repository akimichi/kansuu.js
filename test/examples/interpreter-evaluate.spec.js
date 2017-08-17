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
      expect(
        I.evaluate(2)(Env.empty)
      ).to.eql(
        2
      )
      // Maybe.match(I.evaluate(2)(Env.empty),{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     expect(value).to.eql(2);
      //   }
      // });
      next();
    });
    describe("evaluate operator", () => {
      it('can evaluate unary operator', (next) => {
        expect(
          I.evaluate(['succ', 5])(Env.empty)
        ).to.eql(
          6
        )
        // Maybe.match(I.evaluate(['succ', 5])(Env.empty),{
        //   nothing: (_) => {
        //     expect().fail()
        //   },
        //   just: (value) => {
        //     expect(value).to.eql(ID.unit(6));
        //   }
        // });
        next();
      });
      it('can evaluate binary operator', (next) => {
        expect(
          I.evaluate(['add', 2,3])(Env.empty)
        ).to.eql(
          5
        )
        // Maybe.match(I.evaluate(['add', 2,3])(Env.empty),{
        //   nothing: (_) => {
        //     expect().fail()
        //   },
        //   just: (value) => {
        //     expect(value).to.eql(ID.unit(5));
        //   }
        // });
        expect(
          I.evaluate(['+', 1, 2])(Env.empty)
        ).to.eql(
          3 
        )
        //     Maybe.match(I.evaluate(['+', 1, 2])(Env.empty),{
        //       nothing: (_) => {
        //         expect().fail()
        //       },
        //       just: (value) => {
        //         expect(value).to.eql(ID.unit(3));
        //       }
        //     });
        expect(
          I.evaluate(['+', 1, 'x'])( Env.extend(Pair.cons("x",2), Env.empty))
        ).to.eql(
          3
        )

        //     Maybe.match(I.evaluate(['+', 1, 'x'])( Env.extend(Pair.cons("x",2), Env.empty)),{
        //       nothing: (_) => {
        //         expect().fail()
        //       },
        //       just: (value) => {
        //         expect(value).to.eql(ID.unit(3));
        //       }
        //     });
        expect(
          I.evaluate(['+', 1, ["*", 2, 3]])(Env.empty)
        ).to.eql(
          7 
        )
        //     Maybe.match(I.evaluate(['+', 1, ["*", 2, 3]])(Env.empty),{
        //       nothing: (_) => {
        //         expect().fail()
        //       },
        //       just: (value) => {
        //         expect(value).to.eql(ID.unit(7));
        //       }
        //     });
        expect(
          I.evaluate(['+', 1, ["*", 'x', 3]])(Env.extend(Pair.cons("x",4), Env.empty))
        ).to.eql(
          13
        )
        //     Maybe.match(I.evaluate(['+', 1, ["*", 'x', 3]])(Env.extend(Pair.cons("x",4), Env.empty)),{
        //       nothing: (_) => {
        //         expect().fail()
        //       },
        //       just: (value) => {
        //         expect(value).to.eql(ID.unit(13));
        //       }
        //     });
        next();
        // });
      });
    });
    it('can evaluate variable', (next) => {
      const env = Env.extend(Pair.cons("a",1), Env.empty);
      expect(
        I.evaluate("a")(env)
      ).to.eql(
        1
      )
      // Maybe.match(I.evaluate("a")(env),{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     expect(value).to.eql(ID.unit(1));
      //   }
      // });
      next();
    });
    describe('can apply builtin application', () => {
      it('can apply builtin application with primitive value', (next) => {
        // [+ 1 2] -> 3 
        expect(
          I.applyBuiltin(["+", 1, 2])(Env.empty)
        ).to.eql(
          3 
        )
        next();
      });
      it('can apply builtin application with variable', (next) => {
        // [+ x 3]:x->2 -> 3 
        const env =  Env.extend(Pair.cons("x",2), Env.empty);
        expect(
          I.applyBuiltin(["+", "x", 3])(env)
        ).to.eql(
          5 
        )
        const newEnv =  Env.extend(Pair.cons("y",3), env);
        expect(
          I.applyBuiltin(["+", "x", "y"])(newEnv)
        ).to.eql(
          5 
        )
        // [+ x [+ y x]] -> [+ 2 [+ 3 2]] -> 7
        expect(
          I.applyBuiltin(["+", "x", ["+", "y", "x"]])(newEnv)
        ).to.eql(
          7 
        )
        next();
      });
    });
    it('can evaluate function application', (next) => {
      // ~~~js
      // ((x) => {
      //   return x; 
      // })(3)
      // => 3
      // ~~~
      expect(
        I.evaluateLambda(["lambda", "x", "x"])(Env.empty)
      ).to.an(
        'function' 
      )
      expect(
        I.evaluateLambda(["lambda", "x", "x"])(Env.empty)(3)
      ).to.eql(
        3  
      )
      const closure = I.evaluate(["lambda", "x", "x"])(Env.empty)
      expect(
        I.applyClosure(closure, 3)(Env.empty)
      ).to.eql(
        3  
      )
      expect(
        I.evaluate([["lambda", "x", "x"], 3])(Env.empty)
      ).to.eql(
        3  
      )
      // expect((() => {
      //   const closure = I.evaluateLambda(["lambda", "x", ["+", 1, "x"]])(Env.empty)
      //   return I.applyClosure(closure, [3])(Env.empty)
      //   // return I.evaluate([["lambda", "x", ["+", 1, "x"]], 3])(Env.empty)
      // })()).to.eql(
      //   4  
      // )
      expect(
        I.evaluate([["lambda", "x", ["+", 1, "x"]], 3])(Env.empty)
      ).to.eql(
        4  
      )
      // (\x -> \y -> x+y)(2)(3)
      expect(
        I.evaluate(
          [[["lambda", "x", ["lambda", "y", ["+", "x", "y"]]], 2], 3]
        )(Env.empty)
      ).to.eql(
        4  
      )
      // Maybe.match(I.evaluateApplication([["lambda", "x", "x"], [3]])(Env.empty),{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     console.log(value) 
      //     expect(value).to.eql(ID.unit(4));
      //   }
      // });
      // const answer  = I.evaluate([["lambda", "x", ["+", 1, "x"]], 3])(Env.empty);
      // console.log("answer: " + answer)
      // Maybe.match(answer,{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     // expect().fail()
      //     expect(value).to.eql(ID.unit(4));
      //   }
      // });
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
