"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Array = require('../../lib/kansuu-array.js'),
  Env = require('../../examples/interpreter.js').env,
  Exp = require('../../examples/interpreter.js').exp,
  Syntax = require('../../examples/interpreter.js').syntax,
  ID = require('../../lib/kansuu.js').monad.identity,
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu.js').monad.list,
  Parser = require('../../lib/kansuu.js').monad.parser,
  Pair = require('../../lib/kansuu.js').pair;

describe("'interpreter' example", () => {
  describe("syntax", () => {
    it('list', function(next) {
      this.timeout(9000);
      expect(
        Parser.parse(
          Syntax.list() 
        )("( 1 )")
      ).to.eql(
        [{value:[1], remaining: ''}]
      );
      expect(
        Parser.parse(
          Syntax.list() 
        )("( identifier )")
      ).to.eql(
        [{value:[ "identifier" ], remaining: ''}]
      );
      expect(
        Parser.parse(
          Syntax.list() 
        )("(+ 1 2)")
      ).to.eql(
        [{value:["+", 1, 2], remaining: ''}]
      );
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
      // expect(
      //   Parser.parse(
      //     Syntax.atom() 
      //   )("this is a string")
      // ).to.eql(
      //   [{value:"this", remaining: 'is a string'}]
      // );
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
    // it('can evaluate number', (next) => {
    //   var exp = Exp.number(2);
    //   Maybe.match(I.evaluate(exp)(Env.empty),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(ID.unit(2));
    //     }
    //   });
    //   next();
    // });
    // it('can evaluate variable', (next) => {
    //   var exp = Exp.variable("a");
    //   var env = Env.extend(Pair.cons("a",1), Env.empty);
    //   Maybe.match(I.evaluate(exp)(env),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(ID.unit(1));
    //     }
    //   });
    //   next();
    // });
    // it('can evaluate succ', (next) => {
    //   var n = Exp.number(2);
    //   var succExp = Exp.succ(n);
    //   Maybe.match(I.evaluate(succExp)(Env.empty),{
    //     nothing: (_) => {
    //       expect().fail()
    //     },
    //     just: (value) => {
    //       expect(value).to.eql(ID.unit(3));
    //     }
    //   });
    //   next();
    // });
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
    // it('can evaluate function application', (next) => {
    //   // ~~~js
    //   // ((x) => {
    //   //   return x; 
    //   // })(3)
    //   // => 3
    //   // ~~~
    //   const lambdaExp = Exp.lambda(Exp.variable("x"), Exp.variable("x"));
    //   const appExp = Exp.apply(lambdaExp, Exp.number(7));  
    //   Maybe.flatMap(I.evaluate(appExp)(Env.empty))(answer => {
    //     expect(answer).to.eql(ID.unit(7));
    //   });
    //   next();
    // });
  });
});
