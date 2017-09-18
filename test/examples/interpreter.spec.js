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
        this.timeout(40000);
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
        this.timeout(30000);
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
