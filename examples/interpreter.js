"use strict";

/*
 lambda calculus interpreter

 c.f."Structuring functional programs by using monads" by Davor Obradovic

 */

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  ordinary: {
    evaluate: (exp) => {
      var self = this;
      expect(exp.type).to.eql('exp');
      return (env) => {
        __.list.censor.call(__,env);
        switch (exp.subtype) {
        case 'variable':
          return self.ordinary.env.lookup(exp.content, env);
        }
      };
    },
    exp: {
      variable: (name) => {
        return {
          type: 'exp',
          subtype: 'variable',
          content: name
        };
      }
    },
    data: {
      unit : (value) => {
        switch (__.typeOf(value)) {
        case 'number':
          return {
            type: 'data',
            subtype: 'number',
            content: value
          };
        case 'function':
          return {
            type: 'data',
            subtype: 'function',
            content: value
          };
        case 'undefined':
          return {
            type: 'data',
            subtype: 'error',
            content: value
          };
        default:
          throw new Error();
        }
      },
    },
    // environment
    // ~~~haskell
    // type Environment = [(Name, Value)]
    // ~~~
    env: {
      empty: __.list.empty,
      // empty: (() => {
      //   return __.monad.list.empty;
      // })(),
      extend: (pair, oldenv) => {
        __.pair.censor.call(__,pair);
        __.list.censor.call(__,oldenv);
        return __.list.cons.call(__, pair)(oldenv);
      },
      lookup: (name, env) => {
        var self = this;
        if(__.list.isEmpty.call(__,env)) {
          return __.monad.maybe.nothing;
        } else {
          return __.list.foldr.call(__,env)(__.monad.maybe.nothing)((item) => {
            return (accumulator) => {
              if(item.left === name) {
                return __.monad.maybe.unit.call(__,item.right);
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
