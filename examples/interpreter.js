"use strict";

// A lambda calculus interpreter
// =============================
//
// c.f. [Structuring functional programs by using monads](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.39.3974) by Davor Obradovic

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  // ## 'ordinary' interpreter
  ordinary: {
    unit: __.monad.identity.unit.bind(__),
    flatMap: __.monad.identity.flatMap.bind(__),
    apply: (rator) => {
      var self = this;
      return (rand) => {
        if(__.typeOf(rator) === 'function'){
          return rator.call(self,rand);
        } else {
          return self.ordinary.unit.call(self,undefined);
        }
      };
    },
    add: (n) => {
      var self = this;
      return (m) => {
        if(__.isNumber(m) && __.isNumber(n)) {
          return self.ordinary.unit.call(self,m + n);
        } else {
          return self.ordinary.unit.call(self,undefined);
        }
      };
    },
    // ### evaluate
    evaluate: (exp) => {
      var self = this;
      expect(exp.type).to.eql('exp');
      return (env) => {
        __.list.censor.call(__,env);
        switch (exp.subtype) {
        case 'variable':
          return self.ordinary.env.lookup.call(self,exp.content, env);
        case 'number':
          return self.ordinary.unit.call(self,exp.content);
        case 'add':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          expect(rator.type).to.eql('exp');
          expect(rand.type).to.eql('exp');
          return self.ordinary.flatMap.call(self,self.ordinary.evaluate.call(self,rator)(env))(function (m) {
            return self.ordinary.flatMap.call(self,self.ordinary.evaluate.call(self,rand)(env))(function (n) {
              return self.ordinary.add.call(self, m)(n);
            });
          });
        case 'lambda':
          var closure = (arg) => {
            var newEnv = self.ordinary.env.extend.call(self, __.pair.mkPair.call(__,exp.content.arg)(arg),env);
            return self.ordinary.evaluate.call(self,exp.content.body)(newEnv);
          };
          return self.ordinary.unit.call(self,closure);
        case 'application':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          return self.ordinary.flatMap.call(self,self.ordinary.evaluate.call(self,rator)(env))(function (f) {
            return self.ordinary.flatMap.call(self,self.ordinary.evaluate.call(self,rand)(env))(function (a) {
              return self.ordinary.apply.call(self, f)(a);
            });
          });
        default:
          throw new Error("evaluate should accept expressions, but got " + exp);
        }
      };
    },
    // ### expression
    exp: {
      variable: (name) => {
        return {
          type: 'exp',
          subtype: 'variable',
          content: name
        };
      },
      number: (n) => {
        return {
          type: 'exp',
          subtype: 'number',
          content: n
        };
      },
      add: (n) => {
        return (m) => {
          return {
            type: 'exp',
            subtype: 'add',
            content: {
              rator: n,
              rand: m
            }
          };
        };
      },
      lambda: (name) => {
        return (exp) => {
          return {
            type: 'exp',
            subtype: 'lambda',
            content: {
              arg: name,
              body: exp
            }
          };
        };
      },
      app: (rator) => {
        return (rand) => {
          return {
            type: 'exp',
            subtype: 'application',
            content: {
              rator: rator,
              rand: rand
            }
          };
        };
      }
    },
    // ### environment
    // ~~~haskell
    // type Environment = List[(Name, Value)]
    // ~~~
    env: {
      empty: __.list.empty,
      extend: (pair, oldenv) => {
        __.pair.censor.call(__,pair);
        __.list.censor.call(__,oldenv);
        return __.list.cons.call(__, pair)(oldenv);
      },
      lookup: (name, env) => {
        var self = this;
        // var predicate = (pair) => {
        //   if(pair.left === name) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // };
        // return __.monad.maybe.getOrElse.call(__,
        //                                      __.list.find.call(__,env)(predicate))(undefined);
        if(__.list.isEmpty.call(__,env)) {
          return self.ordinary.unit.call(self,undefined);
        } else {
          return __.list.foldr.call(__,env)(self.ordinary.unit.call(self,undefined))((item) => {
            return (accumulator) => {
              if(item.left === name) {
                return self.ordinary.unit.call(self,item.right);
              } else {
                return accumulator;
              }
            };
          });
        }
      }
    }
  },
  // ## logging interpreter
  logging: {
    unit: (value) => {
      var self = this;
      return {
        log: __.list.empty,
        value: value
      };
    },
    // ### logging#flatMap
    flatMap: (instance) => {
      var self = this;
      return (transform) => {
        var currentLog = instance.log;
        var currentValue = instance.value;
        var pair = transform(currentValue);
        var newLog = pair.log;
        var newValue = pair.value;
        return {
          log: __.list.append.call(__,currentLog)(newLog),
          value: newValue
        };
      };
    },
    // ### logging#expression
    exp: {
      log: (exp) => {
        return {
          type: 'exp',
          subtype: 'log',
          content: exp
        };
      },
      variable: (name) => {
        return {
          type: 'exp',
          subtype: 'variable',
          content: name
        };
      },
      number: (n) => {
        return {
          type: 'exp',
          subtype: 'number',
          content: n
        };
      },
      add: (n) => {
        return (m) => {
          return {
            type: 'exp',
            subtype: 'add',
            content: {
              rator: n,
              rand: m
            }
          };
        };
      },
      lambda: (name) => {
        return (exp) => {
          return {
            type: 'exp',
            subtype: 'lambda',
            content: {
              arg: name,
              body: exp
            }
          };
        };
      },
      app: (rator) => {
        return (rand) => {
          return {
            type: 'exp',
            subtype: 'application',
            content: {
              rator: rator,
              rand: rand
            }
          };
        };
      }
    },
    apply: (rator) => {
      var self = this;
      return (rand) => {
        if(__.typeOf(rator) === 'function'){
          //return self.logging.unit.call(self,rator.call(self,rand));
          return rator.call(self,rand);
        } else {
          return self.logging.unit.call(self,undefined);
        }
      };
    },
    add: (n) => {
      var self = this;
      return (m) => {
        if(__.isNumber(m) && __.isNumber(n)) {
          return self.logging.unit.call(self,m + n);
        } else {
          return self.logging.unit.call(self,undefined);
        }
      };
    },
    log: (value) => {
      var self = this;
      console.log(value);
      return {
        log: __.list.mkList.call(__,[value]),
        value: value
      };
    },
    // ### logging#evaluate
    // evaluate:: Exp -> M[value]
    evaluate: (exp) => {
      var self = this;
      expect(exp.type).to.eql('exp');
      return (env) => {
        __.list.censor.call(__,env);
        switch (exp.subtype) {
        case 'log':
          return self.logging.flatMap.call(self,self.logging.evaluate.call(self,exp.content)(env))(function (a) {
            return self.logging.flatMap.call(self,self.logging.log.call(self, a))(function (b) {
              return self.logging.unit.call(self, b);
            });
          });
        case 'variable':
          return self.logging.env.lookup.call(self,exp.content, env);
        case 'number':
          return self.logging.unit.call(self,exp.content);
        case 'add':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          expect(rator.type).to.eql('exp');
          expect(rand.type).to.eql('exp');
          return self.logging.flatMap.call(self,self.logging.evaluate.call(self,rator)(env))(function (m) {
            return self.logging.flatMap.call(self,self.logging.evaluate.call(self,rand)(env))(function (n) {
              return self.logging.add.call(self, m)(n);
            });
          });
        case 'lambda':
          var closure = (arg) => {
            var newEnv = self.logging.env.extend.call(self, __.pair.mkPair.call(__,exp.content.arg)(arg),env);
            return self.logging.evaluate.call(self,exp.content.body)(newEnv);
          };
          return self.logging.unit.call(self,closure);
        case 'application':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          return self.logging.flatMap.call(self,self.logging.evaluate.call(self,rator)(env))(function (f) {
            return self.logging.flatMap.call(self,self.logging.evaluate.call(self,rand)(env))(function (a) {
              return self.logging.apply.call(self, f)(a);
            });
          });
        default:
          throw new Error("evaluate should accept expressions, but got " + exp);
        }
      };
    },
    // ### environment
    // ~~~haskell
    // type Environment = List[(Name, Value)]
    // ~~~
    env: {
      empty: __.list.empty,
      extend: (pair, oldenv) => {
        __.pair.censor.call(__,pair);
        __.list.censor.call(__,oldenv);
        return __.list.cons.call(__, pair)(oldenv);
      },
      lookup: (name, env) => {
        var self = this;
        if(__.list.isEmpty.call(__,env)) {
          return self.logging.unit.call(self,undefined);
        } else {
          return __.list.foldr.call(__,env)(self.logging.unit.call(self,undefined))((item) => {
            return (accumulator) => {
              if(item.left === name) {
                return self.logging.unit.call(self,item.right);
              } else {
                return accumulator;
              }
            };
          });
        }
      }
    }
  },
  // ## ambiguous interpreter
  ambiguous: {
    unit: __.monad.list.unit.bind(__),
    flatMap: __.monad.list.flatMap.bind(__),
    zero: __.list.empty,
    plus: __.list.append.bind(__),
    // ### ambiguous#expression
    exp: {
      fail: (_) => {
        return {
          type: 'exp',
          subtype: 'fail',
          content: undefined
        };
      },
      amb: (a) => {
        return (b) => {
          return {
            type: 'exp',
            subtype: 'amb',
            content: {
              a: a,
              b: b
            }
          };
        };
      },
      variable: (name) => {
        return {
          type: 'exp',
          subtype: 'variable',
          content: name
        };
      },
      number: (n) => {
        return {
          type: 'exp',
          subtype: 'number',
          content: n
        };
      },
      add: (n) => {
        return (m) => {
          return {
            type: 'exp',
            subtype: 'add',
            content: {
              rator: n,
              rand: m
            }
          };
        };
      },
      lambda: (name) => {
        return (exp) => {
          return {
            type: 'exp',
            subtype: 'lambda',
            content: {
              arg: name,
              body: exp
            }
          };
        };
      },
      app: (rator) => {
        return (rand) => {
          return {
            type: 'exp',
            subtype: 'application',
            content: {
              rator: rator,
              rand: rand
            }
          };
        };
      }
    },
    apply: (rator) => {
      var self = this;
      return (rand) => {
        if(__.typeOf(rator) === 'function'){
          return self,rator.call(self,rand);          //return self.ambiguous.unit.call(self,rator.call(self,rand));
        } else {
          return self.ambiguous.unit.call(self,undefined);
        }
      };
    },
    add: (n) => {
      var self = this;
      return (m) => {
        if(__.isNumber(m) && __.isNumber(n)) {
          return self.ambiguous.unit.call(self,m + n);
        } else {
          return self.ambiguous.unit.call(self,undefined);
        }
      };
    },
    // ### ambiguous#evaluate
    // evaluate:: Exp -> M[value]
    evaluate: (exp) => {
      var self = this;
      expect(exp.type).to.eql('exp');
      return (env) => {
        __.list.censor.call(__,env);
        switch (exp.subtype) {
        case 'fail':
          return self.ambiguous.zero;
        case 'amb':
          var aResult = self.ambiguous.evaluate.call(self,
                                                            exp.content.a)(env);
          var bResult = self.ambiguous.evaluate.call(self,
                                                            exp.content.b)(env);
          return self.ambiguous.plus.call(self,aResult)(bResult);
        case 'variable':
          return self.ambiguous.env.lookup.call(self,exp.content, env);
        case 'number':
          return self.ambiguous.unit.call(self,exp.content);
        case 'add':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          expect(rator.type).to.eql('exp');
          expect(rand.type).to.eql('exp');
          return self.ambiguous.flatMap.call(self,self.ambiguous.evaluate.call(self,rator)(env))(function (m) {
            return self.ambiguous.flatMap.call(self,self.ambiguous.evaluate.call(self,rand)(env))(function (n) {
              return self.ambiguous.add.call(self, m)(n);
            });
          });
        case 'lambda':
          var closure = (arg) => {
            var newEnv = self.ambiguous.env.extend.call(self, __.pair.mkPair.call(__,exp.content.arg)(arg),env);
            return self.ambiguous.evaluate.call(self,exp.content.body)(newEnv);
          };
          return self.ambiguous.unit.call(self,closure);
        case 'application':
          var rator = exp.content.rator;
          var rand =  exp.content.rand;
          return self.ambiguous.flatMap.call(self,self.ambiguous.evaluate.call(self,rator)(env))(function (f) {
            return self.ambiguous.flatMap.call(self,self.ambiguous.evaluate.call(self,rand)(env))(function (a) {
              return self.ambiguous.apply.call(self, f)(a);
            });
          });
        default:
          throw new Error("evaluate should accept expressions, but got " + exp);
        }
      };
    },
    // ### 'ambiguous' environment
    // ~~~haskell
    // type Environment = List[(Name, Value)]
    // ~~~
    env: {
      empty: __.list.empty,
      extend: (pair, oldenv) => {
        __.pair.censor.call(__,pair);
        __.list.censor.call(__,oldenv);
        return __.list.cons.call(__, pair)(oldenv);
      },
      lookup: (name, env) => {
        var self = this;
        if(__.list.isEmpty.call(__,env)) {
          return self.ambiguous.unit.call(self,undefined);
        } else {
          return __.list.foldr.call(__,env)(self.ambiguous.unit.call(self,undefined))((item) => {
            return (accumulator) => {
              if(item.left === name) {
                return self.ambiguous.unit.call(self,item.right);
              } else {
                return accumulator;
              }
            };
          });
        }
      }
    }
  },
  // // ## lazy interpreter
  // lazy: {
  //   unit: __.monad.list.unit.bind(__),
  //   flatMap: __.monad.list.flatMap.bind(__),
  //   zero: __.list.empty,
  //   plus: __.list.append.bind(__),
  //   // ### lazy#expression
  //   exp: {
  //     fail: (_) => {
  //       return {
  //         type: 'exp',
  //         subtype: 'fail',
  //         content: undefined
  //       };
  //     },
  //     amb: (a) => {
  //       return (b) => {
  //         return {
  //           type: 'exp',
  //           subtype: 'amb',
  //           content: {
  //             a: a,
  //             b: b
  //           }
  //         };
  //       };
  //     },
  //     variable: (name) => {
  //       return {
  //         type: 'exp',
  //         subtype: 'variable',
  //         content: name
  //       };
  //     },
  //     number: (n) => {
  //       return {
  //         type: 'exp',
  //         subtype: 'number',
  //         content: n
  //       };
  //     },
  //     add: (n) => {
  //       return (m) => {
  //         return {
  //           type: 'exp',
  //           subtype: 'add',
  //           content: {
  //             rator: n,
  //             rand: m
  //           }
  //         };
  //       };
  //     },
  //     lambda: (name) => {
  //       return (exp) => {
  //         return {
  //           type: 'exp',
  //           subtype: 'lambda',
  //           content: {
  //             arg: name,
  //             body: exp
  //           }
  //         };
  //       };
  //     },
  //     app: (rator) => {
  //       return (rand) => {
  //         return {
  //           type: 'exp',
  //           subtype: 'application',
  //           content: {
  //             rator: rator,
  //             rand: rand
  //           }
  //         };
  //       };
  //     }
  //   },
  //   apply: (rator) => {
  //     var self = this;
  //     return (rand) => {
  //       if(__.typeOf(rator) === 'function'){
  //         return self,rator.call(self,rand);          //return self.lazy.unit.call(self,rator.call(self,rand));
  //       } else {
  //         return self.lazy.unit.call(self,undefined);
  //       }
  //     };
  //   },
  //   add: (n) => {
  //     var self = this;
  //     return (m) => {
  //       if(__.isNumber(m) && __.isNumber(n)) {
  //         return self.lazy.unit.call(self,m + n);
  //       } else {
  //         return self.lazy.unit.call(self,undefined);
  //       }
  //     };
  //   },
  //   // ### lazy#evaluate
  //   // evaluate:: Exp -> M[value]
  //   evaluate: (exp) => {
  //     var self = this;
  //     expect(exp.type).to.eql('exp');
  //     return (env) => {
  //       __.list.censor.call(__,env);
  //       switch (exp.subtype) {
  //       case 'fail':
  //         return self.lazy.zero;
  //       case 'amb':
  //         var aResult = self.lazy.evaluate.call(self,
  //                                                           exp.content.a)(env);
  //         var bResult = self.lazy.evaluate.call(self,
  //                                                           exp.content.b)(env);
  //         return self.lazy.plus.call(self,aResult)(bResult);
  //       case 'variable':
  //         return self.lazy.env.lookup.call(self,exp.content, env);
  //       case 'number':
  //         return self.lazy.unit.call(self,exp.content);
  //       case 'add':
  //         var rator = exp.content.rator;
  //         var rand =  exp.content.rand;
  //         expect(rator.type).to.eql('exp');
  //         expect(rand.type).to.eql('exp');
  //         return self.lazy.flatMap.call(self,self.lazy.evaluate.call(self,rator)(env))(function (m) {
  //           return self.lazy.flatMap.call(self,self.lazy.evaluate.call(self,rand)(env))(function (n) {
  //             return self.lazy.add.call(self, m)(n);
  //           });
  //         });
  //       case 'lambda':
  //         var closure = (arg) => {
  //           var newEnv = self.lazy.env.extend.call(self, __.pair.mkPair.call(__,exp.content.arg)(arg),env);
  //           return self.lazy.evaluate.call(self,exp.content.body)(newEnv);
  //         };
  //         return self.lazy.unit.call(self,closure);
  //       case 'application':
  //         var rator = exp.content.rator;
  //         var rand =  exp.content.rand;
  //         return self.lazy.flatMap.call(self,self.lazy.evaluate.call(self,rator)(env))(function (f) {
  //           return self.lazy.flatMap.call(self,self.lazy.evaluate.call(self,rand)(env))(function (a) {
  //             return self.lazy.apply.call(self, f)(a);
  //           });
  //         });
  //       default:
  //         throw new Error("evaluate should accept expressions, but got " + exp);
  //       }
  //     };
  //   },
  //   // ### 'lazy' environment
  //   // ~~~haskell
  //   // type Environment = List[(Name, M[Value])]
  //   // ~~~
  //   env: {
  //     empty: __.list.empty,
  //     extend: (pair, oldenv) => {
  //       __.pair.censor.call(__,pair);
  //       __.list.censor.call(__,oldenv);
  //       return __.list.cons.call(__, pair)(oldenv);
  //     },
  //     lookup: (name, env) => {
  //       var self = this;
  //       if(__.list.isEmpty.call(__,env)) {
  //         return self.lazy.unit.call(self,undefined);
  //       } else {
  //         return __.list.foldr.call(__,env)(self.lazy.unit.call(self,undefined))((item) => {
  //           return (accumulator) => {
  //             if(item.left === name) {
  //               return self.lazy.unit.call(self,item.right);
  //             } else {
  //               return accumulator;
  //             }
  //           };
  //         });
  //       }
  //     }
  //   }
  // }
};
