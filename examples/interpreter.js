"use strict";

// A lambda calculus interpreter
// =============================
//
// c.f. [Structuring functional programs by using monads](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.39.3974) by Davor Obradovic

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  ordinary: {
	unit: __.monad.identity.unit.bind(__),
	flatMap: __.monad.identity.flatMap.bind(__),
    apply: (rator) => {
      var self = this;
      return (rand) => {
        if(__.typeOf(rator) === 'function'){
          return self.ordinary.unit.call(self,rator.call(self,rand));
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
    // ## evaluate
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
    // ## expression
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
    // ## environment
    // ~~~haskell
    // type Environment = [(Name, Value)]
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
  }
};
