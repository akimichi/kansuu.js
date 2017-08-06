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

describe("'interpreter' example", () => {
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
      // Maybe.match(I.evaluate([["lambda", ["x"], "x"], 3])(Env.empty),{
      //   nothing: (_) => {
      //     expect().fail()
      //   },
      //   just: (value) => {
      //     expect(value).to.eql(ID.unit(3));
      //   }
      // });
      Maybe.match(I.evaluate([["lambda", ["x"], ["+", 1, "x"]], 3])(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
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
  // describe("interpret", () => {
  //   it('number', function(next) {
  //     this.timeout(9000);
  //     expect(
  //       Interpreter.interpret("1")
  //     ).to.eql(
  //       '1' 
  //     );
  //     next();
  //   });
  //   it('operator', function(next) {
  //     this.timeout(9000);
  //     expect(
  //       Interpreter.interpret("(+ 2 3)")
  //     ).to.eql(
  //       '5' 
  //     );
  //     next();
  //   });
  //   it('application', function(next) {
  //     this.timeout(20000);
  //     expect(
  //       Interpreter.interpret("((lambda (x) x) 1)")
  //     ).to.eql(
  //       '1' 
  //     );
  //     expect(
  //       Interpreter.interpret("((lambda (x) (+ 3 4)) 1)")
  //     ).to.eql(
  //       '1' 
  //     );
  //     expect(
  //       Interpreter.interpret("(((lambda (x) (lambda (y) (+ x y))) 1) 2)")
  //     ).to.eql(
  //       '1' 
  //     );
  //     next();
  //   });
  
  // });
  describe("syntax", () => {
    describe('s_exp', (next) => {
      it('application as s_exp', function(next) {
        this.timeout(20000);
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("((lambda (x) x) 1)")
        ).to.eql(
          [{value:[["lambda", ["x"], "x"], 1], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(lambda (x) (x))")
        ).to.eql(
          [{value:["lambda", ["x"], ["x"]], remaining: ''}]
        );
        next();
      });
      it('lambda as s_exp', function(next) {
        this.timeout(12000);
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(lambda (x) (+ x x))")
        ).to.eql(
          [{value:["lambda", ["x"], ["+", "x", "x"]], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(lambda (x) x)")
        ).to.eql(
          [{value:["lambda", ["x"], "x"], remaining: ''}]
          // []
        );
        next();
      });
      it('simple s_exp', function(next) {
        this.timeout(20000);
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(+)")
        ).to.eql(
          [{value:['+'], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(x)")
        ).to.eql(
          [{value:['x'], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(xyz)")
        ).to.eql(
          [{value:['xyz'], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("12345")
        ).to.eql(
          [{value:12345, remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(+ 2 3)")
        ).to.eql(
          [{value:['+', 2, 3], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(+ 2 3 4)")
        ).to.eql(
          [{value:['+', 2, 3, 4], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(+ (2) 3 4)")
        ).to.eql(
          [{value:['+', [2], 3, 4], remaining: ''}]
        );
        expect(
          Parser.parse(
            Syntax.s_exp() 
          )("(+ (2) (3))")
        ).to.eql(
          [{value:['+', [2], [3]], remaining: ''}]
        );
        next();
      });
    });
    it('buildin functions', function(next) {
      this.timeout(8000);
      expect(
        Parser.parse(
          Syntax.s_exp() 
        )("(not #t)")
      ).to.eql(
        [{value:['not', true], remaining: ''}]
      );
      next();
    });
    it('list', function(next) {
      this.timeout(12000);
      expect(
        Parser.parse(
          Syntax.list() 
        )("( 1 )")
      ).to.eql(
        [{value:[1], remaining: ''}]
      );
      // expect(
      //   Parser.parse(
      //     Syntax.list() 
      //   )("( identifier )")
      // ).to.eql(
      //   [{value:[ "identifier" ], remaining: ''}]
      // );
      // expect(
      //   Parser.parse(
      //     Syntax.list() 
      //   )("(+ 1 2)")
      // ).to.eql(
      //   [{value:["+", 1, 2], remaining: ''}]
      // );
      next();
    });
    it('atom', function(next){
      this.timeout(5000);
      expect(
        Array.head(Parser.parse(
          Syntax.atom() 
        )("#t")).value
      ).to.eql(
        true 
      );
      expect(
        Parser.parse(
          Syntax.atom() 
        )("12345")
      ).to.eql(
        [{value:12345, remaining: ''}]
      );
      expect(
        Parser.parse(
          Parser.ident()
          // Syntax.atom() 
        )("abc def")
      ).to.eql(
        [{value:"abc", remaining: ' def'}]
      );
      expect(
        Parser.parse(
          Syntax.atom() 
        )("xyz")
      ).to.eql(
        [{value:"xyz", remaining: ''}]
      );
      next();
    }) 
    it('bool', (next) => {
      expect(
        Array.head(Parser.parse(
          Syntax.bool() 
        )("#t")).value
      ).to.eql(
        true 
      );
      expect(
        Parser.parse(
          Syntax.bool() 
        )("  #f")
      ).to.eql(
        [{value:false, remaining: ''}]
      );
      next();
    }) 
  });

  describe("environment", () => {
    it('can lookup empty env', (next) => {
      Maybe.match(Env.lookup("a", Env.empty),{
        nothing: (_) => {
          expect(true).to.be.ok()
        },
        just: (value) => {
          expect().fail()
        }
      });
      next();
    });
    it('can lookup env', (next) => {
      const env = Env.extend(Pair.cons("a",1), Env.empty);
      Maybe.match(Env.lookup("a", env),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(1);
        }
      });
      next();
    });
    it('can extend and lookup env', (next) => {
      const env = Env.extend(Pair.cons("a",1), Env.empty);
      Maybe.match(Env.lookup("a", env),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(1);
        }
      });

      const newEnv = Env.extend(Pair.cons("a",2), env);
      Maybe.match(Env.lookup("a", newEnv),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(2);
        }
      });
      Maybe.match(Env.lookup("b", newEnv),{
        nothing: (_) => {
          expect(true).to.be.ok()
        },
        just: (value) => {
          expect().fail()
        }
      });
      next();
    });
  });
});
