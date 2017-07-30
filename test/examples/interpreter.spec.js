"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Env = require('../../examples/interpreter.js').env,
  ID = require('../../lib/kansuu.js').monad.identity,
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  Pair = require('../../lib/kansuu.js').pair;

describe("'interpreter' example", () => {
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
  describe("Plain interpreter", () => {
    const I = require('../../examples/interpreter.js').plain;

    it('can evaluate number', (next) => {
      var exp = I.exp.number(2);
      Maybe.match(I.evaluate(exp)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(2));
        }
      });
      next();
    });
    it('can evaluate variable', (next) => {
      var exp = I.exp.variable("a");
      var env = Env.extend(Pair.cons("a",1), Env.empty);
      Maybe.match(I.evaluate(exp)(env),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(1));
        }
      });
      next();
    });
    it('can evaluate succ', (next) => {
      var n = I.exp.number(2);
      var succExp = I.exp.succ(n);
      Maybe.match(I.evaluate(succExp)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(3));
        }
      });
      next();
    });
    it("can't evaluate succ with boolean", (next) => {
      var f = I.exp.bool(false);
      var succExp = I.exp.succ(f);
      Maybe.match(I.evaluate(succExp)(Env.empty),{
        nothing: (_) => {
          expect(true).to.be.ok()
        },
        just: (value) => {
          expect().fail()
        }
      });
      next();
    });
    it('can evaluate add', (next) => {
      const one = I.exp.number(1),
        two = I.exp.number(2),
        addExp = I.exp.add(one, two);
      Maybe.match(I.evaluate(addExp)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(3));
        }
      });
      next();
    });
    it('can evaluate nested add', (next) => {
      const one = I.exp.number(1),
        two = I.exp.number(2),
        addExp = I.exp.add(one, I.exp.add(one, two));
      Maybe.match(I.evaluate(addExp)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (value) => {
          expect(value).to.eql(ID.unit(4));
        }
      });
      next();
    });
    it('can evaluate lambda expression', (next) => {
      // ~~~js
      // ((x) => {
      //   return x; 
      // })(1)
      // ~~~
      const lambdaExp = I.exp.lambda(I.exp.variable("x"), I.exp.variable("x"));
      Maybe.match(I.evaluate(lambdaExp)(Env.empty),{
        nothing: (_) => {
          expect().fail()
        },
        just: (closure) => {
          Maybe.flatMap(closure(3))(answer => {
            expect(answer).to.eql(ID.unit(3));
          });
        }
      });
      next();
    });
  });
});
//     describe("evaluate", () => {
//       it('can evaluate identity function', (next) => {
//         var n = intp.ordinary.exp.number(2);
// 		var x = intp.ordinary.exp.variable("x");
//         var lambda = intp.ordinary.exp.lambda(x, x);
//         var application = intp.ordinary.exp.app(lambda,n);
//         expect(
//           intp.ordinary.evaluate.call(intp,application)(intp.env.emptyEnv)
//         ).to.eql(
//           intp.ordinary.unit.call(intp,2)
//         );
//         next();
//       });
//       it('can evaluate (\\x.x + x)(10 + 11) = 42', (next) => {
//         var ten = intp.ordinary.exp.number(10);
//         var eleven = intp.ordinary.exp.number(11);
//         var addition = intp.ordinary.exp.add(ten,eleven);
// 		var x = intp.ordinary.exp.variable("x");
//         var lambda = intp.ordinary.exp.lambda(x,intp.ordinary.exp.add(x,x));
//         var application = intp.ordinary.exp.app(lambda,addition);
//         expect(
//           intp.ordinary.evaluate.call(intp,application)(intp.env.emptyEnv)
//         ).to.eql(
//           intp.ordinary.unit.call(intp,42)
//         );
//         next();
//       });
//     });
//   });
//   describe("'logging' interpreter", () => {
//     describe("evaluate", () => {
//       it('can evaluate variable', (next) => {
//         var exp = intp.logging.exp.variable("a");
//         var env = intp.logging.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.logging.env.empty);
//         expect(
//           intp.logging.evaluate.call(intp,exp)(env)
//         ).to.eql(
//           intp.logging.unit.call(intp,1)
//         );
//         next();
//       });
//       it('can evaluate number', (next) => {
//         var exp = intp.logging.exp.number(2);
//         expect(
//           intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty)
//         ).to.eql(
//           intp.logging.unit.call(intp,2)
//         );
//         next();
//       });
//       it('can evaluate logging', (next) => {
//         this.timeout(5000);
//         var exp = intp.logging.exp.log(intp.logging.exp.number(2));
//         expect(
//           intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).value
//         ).to.eql(
//           2
//         );
//         expect(
//           __.list.toArray.call(__,intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log)
//         ).to.eql(
//           [2]
//         );
//         expect(function () {
//           var n = intp.logging.exp.number(2);
//           var m = intp.logging.exp.number(3);
//           var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
//           return intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).value;
//         }()).to.eql(
//           5
//         );
//         expect(function () {
//           var n = intp.logging.exp.number(2);
//           var m = intp.logging.exp.number(3);
//           var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
//           return __.list.toArray.call(__,
//                                       intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log);
//         }()).to.eql(
//           [5]
//         );
//         expect(function () {
//           var n = intp.logging.exp.log(intp.logging.exp.number(2));
//           var m = intp.logging.exp.log(intp.logging.exp.number(3));
//           var exp = intp.logging.exp.log(intp.logging.exp.add(n)(m));
//           return __.list.toArray.call(__,
//                                       intp.logging.evaluate.call(intp,exp)(intp.logging.env.empty).log);
//         }()).to.eql(
//           [2,3,5]
//         );
//         next();
//       });
//     });
//   });
//   describe("'ambiguous' interpreter", () => {
//     describe("evaluate", () => {
//       it('can evaluate number', (next) => {
//         var exp = intp.ambiguous.exp.number(2);
//         intp.match(intp.ambiguous.evaluate.call(intp,
//                                                 exp)(intp.env.emptyEnv),{
//                                                   empty: (_) => {
//                                                     expect().fail();
//                                                   },
//                                                   cons: (head, tail) => {
//                                                     expect(head).to.eql(2);
//                                                   }
//                                                 });
//         next();
//       });
//       it('can evaluate variable', (next) => {
//         var exp = intp.ambiguous.exp.variable("a");
//         var environment = intp.env.extendEnv.call(intp,
//                                                   "a",1,intp.env.emptyEnv);
//         intp.match(intp.ambiguous.evaluate.call(intp,
//                                                 exp)(environment),{
//                                                   empty: (_) => {
//                                                     expect().fail();
//                                                   },
//                                                   cons: (head, tail) => {
//                                                     expect(head).to.eql(1);
//                                                   }
//                                                 });
//         next();
//       });
//       it('can evaluate add', (next) => {
//         var n = intp.ambiguous.exp.number(2);
//         var m = intp.ambiguous.exp.number(3);
//         var add = intp.ambiguous.exp.add(n,m);
// 		intp.match(intp.ambiguous.evaluate.call(intp,add)(intp.env.emptyEnv),{
//           empty: (_) => {
//             expect().fail();
//           },
//           cons: (head, tail) => {
//             expect(head).to.eql(5);
//           }
// 		});
//         next();
//       });
//       // it('can evaluate (\\x.x)(1) = 1', (next) => {
//       //   this.timeout(5000);
//       //   var x = intp.ambiguous.exp.variable("x");
//       //   var lambda = intp.ambiguous.exp.lambda(x,x); // λx.x
//       //   var one = intp.ambiguous.exp.number(1);
//       //   var application = intp.ambiguous.exp.app(lambda,one); // (λx.x)(1)
//       //   intp.match(intp.ambiguous.evaluate.call(intp,
//       //                                           application)(intp.env.emptyEnv),{
//       //                                             empty: (_) => {
//       //                                               expect().fail();
//       //                                             },
//       //                                             cons: (head, tail) => {
//       //                                               expect(head).to.eql(0);
//       //                                             }
//       //                                           });
//       //   // expect(
//       //   //   intp.ambiguous.evaluate.call(intp,application)(intp.env.emptyEnv).isEqual(__.list.mkList.call(__,[4,6]))
//       //   // ).to.ok();
//       //   next();
//       // });
//       // it('can evaluate (\\x.x + x)(amd (2,3)) = [4,6]', (next) => {
//       //   this.timeout(5000);
//       //   var x = intp.ambiguous.exp.variable("x");
//       //   var addition = intp.ambiguous.exp.add(x,x);
//       //   var lambda = intp.ambiguous.exp.lambda("x",addition); // λx.x + x
//       //   var n = intp.ambiguous.exp.number(2);
//       //   var m = intp.ambiguous.exp.number(3);
//       //   var amb = intp.ambiguous.exp.amb.call(intp,
//       //                                         n,m);
//       //   var application = intp.ambiguous.exp.app(lambda,amb);
//       //   intp.match(intp.ambiguous.evaluate.call(intp,
//       //                                           application)(intp.env.emptyEnv),{
//       //                                             empty: (_) => {
//       //                                               expect().fail();
//       //                                             },
//       //                                             cons: (head, tail) => {
//       //                                               expect(head).to.eql(1);
//       //                                             }
//       //                                           });
//       //   // expect(
//       //   //   intp.ambiguous.evaluate.call(intp,application)(intp.env.emptyEnv).isEqual(__.list.mkList.call(__,[4,6]))
//       //   // ).to.ok();
//       //   next();
//       // });
//     });
//   });
//   describe("'lazy' interpreter", () => {
//     describe("evaluate", () => {
//       it('can evaluate number', (next) => {
//         var exp = intp.lazy.exp.number(2);
//         intp.match(intp.lazy.evaluate.call(intp,
//                                            exp)(intp.env.emptyEnv),{
//                                              empty: (_) => {
//                                                expect().fail();
//                                              },
//                                              cons: (head, tail) => {
//                                                expect(head).to.eql(2);
//                                              }
//                                            });

//         next();
//       });
//       it('can evaluate variable', (next) => {
//         var exp = intp.lazy.exp.variable("a");
//         var environment = intp.env.extendEnv.call(intp,
// 												  "a",1, intp.env.emptyEnv);
//         // var env = intp.lazy.env.extend.call(intp, __.pair.mkPair.call(__,"a")(n),intp.lazy.env.empty);
//         //console.log(intp.lazy.evaluate.call(intp,exp)(env));
//         intp.match(intp.lazy.evaluate.call(intp,
//                                            exp)(environment),{
//                                              empty: (_) => {
//                                                expect().fail();
//                                              },
//                                              cons: (head, tail) => {
//                                                expect(head).to.eql(1);
//                                              }
//                                            });
//         // expect(
//         //   intp.lazy.evaluate.call(intp,exp)(env).isEqual(intp.lazy.unit.call(intp,1))
//         // ).to.ok();
//         next();
//       });
//       // it('can evaluate (\\x.x + x)(amd (2,3)) = [4,5,5,6]', (next) => {
//       //   this.timeout(5000);
//       //   var x = intp.lazy.exp.variable("x");
//       //   var addition = intp.lazy.exp.add(x,x);
//       //   var lambda = intp.lazy.exp.lambda(x,addition);
//       //   var n = intp.lazy.exp.number(2);
//       //   var m = intp.lazy.exp.number(3);
//       //   var amb = intp.lazy.exp.amb.call(intp,n)(m);
//       //   var application = intp.lazy.exp.app(lambda)(amb);
//       //   expect(
//       //     intp.lazy.evaluate.call(intp,application)(intp.lazy.env.empty).isEqual(__.list.mkList.call(__,[4,5,5,6]))
//       //   ).to.ok();
//       //   next();
//       // });
//     });
//   });
//   describe("'cps' interpreter", () => {
//     describe("evaluate", () => {
//       it('can evaluate number', (next) => {
//         var exp = intp.cps.exp.number(2);
//         expect(
//           intp.cps.evaluate.call(intp,exp)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
//         ).to.equal(
//           2
//         );
//         next();
//       });
//       it('can evaluate variable', (next) => {
//         var exp = intp.cps.exp.variable("a");
//         var env = intp.cps.env.extend.call(intp, __.pair.mkPair.call(__,"a")(1),intp.cps.env.empty);
//         expect(
//           intp.cps.evaluate.call(intp,exp)(env)(__.monad.identity.unit.bind(intp))
//         ).to.equal(
//           1
//         );
//         next();
//       });
//       it('can evaluate (\\x.x)(2) = 2', (next) => {
//         this.timeout(5000);
//         var x = intp.cps.exp.variable("x");
//         var n = intp.cps.exp.number(2);
//         var lambda = intp.cps.exp.lambda("x")(x);
//         var application = intp.cps.exp.app(lambda)(n);
//         expect(
//           intp.cps.evaluate.call(intp,application)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
//         ).to.equal(
//           2
//         );
//         next();
//       });
//       it('can evaluate (\\x.x+x)(2) = 4', (next) => {
//         this.timeout(5000);
//         var x = intp.cps.exp.variable("x");
//         var addition = intp.cps.exp.add(x)(x);
//         var lambda = intp.cps.exp.lambda("x")(addition);
//         var n = intp.cps.exp.number(2);
//         var application = intp.cps.exp.app(lambda)(n);
//         expect(
//           intp.cps.evaluate.call(intp,application)(intp.cps.env.empty)(__.monad.identity.unit.bind(intp))
//         ).to.equal(
//           4
//         );
//         next();
//       });
//     });
//   });
//   // describe("'callcc' interpreter", () => {
//   //   describe("evaluate", () => {
//   //     it('can evaluate (Add (Num 1) (Callcc "k" (Add (Num 2) (App (Var "k") (Num 4)))))', (next) => {
//   //       this.timeout(5000);
//   //       var k = intp.callcc.exp.variable("k");
//   //       var one = intp.cps.exp.number(1);
//   //       var two = intp.callcc.exp.number(2);
//   //       var four = intp.callcc.exp.number(4);
//   //       var expression = intp.cps.exp.add(one)(intp.callcc.exp.callcc.call(intp,"k")(intp.cps.exp.add(two)(intp.cps.exp.app(k)(four))));
//   //       expect(
//   //         intp.callcc.evaluate.call(intp,expression)(intp.callcc.env.empty)
//   //       ).to.equal(
//   //         2
//   //       );
//   //       next();
//   //     });
//   //   });
