"use strict";

const expect = require('expect.js'),
  base = require('../lib/kansuu-base.js'),
  fs = require('fs');
// var math = require('../lib/kansuu-math.js');

const id = (any) => {
  return any;
};


const compose = (fun1, fun2) => {
  expect(fun1).to.a('function');
  expect(fun2).to.a('function');
  return (arg) => {
    return fun1(fun2(arg));
  };
};
// const compose = (fun1) => {
//   expect(fun1).to.a('function');
//   return (fun2) => {
//     expect(fun2).to.a('function');
//     return (_) => {
//       return fun1(fun2.apply(arguments));
//     };
//   };
// };

const flip = (fun) => {
  expect(fun).to.a('function');
  return (first) => {
    return (second) => {
      return fun(second)(first);
    };
  };
};

const times = (count) => {
  expect(count).to.be.a('number');
  expect(count).to.be.greaterThan(-1);
  return (fun) => {
    expect(fun).to.a('function');
    return (memo) => {
      if (count === 0)
        return memo;
      else
        return times(count-1)(fun)(fun(memo));
    };
  };
};

const match = (exp, pattern) => {
  return exp(pattern);
};

const not = (predicate) => {
  return (any) => {
    return ! predicate(any);
  };
};

const and = (predicate1) => {
  return (predicate2) => {
    return predicate1 && predicate2;
  };
};

const or = (p) => {
  return (q) => {
    return p || q;
  };
};
const existy = (any) => {
  return any != null;
};

const truthy = (any) => {
  return any !== false && any != null;
};

const falsy = not(truthy); 

// typeOf:: obj => String
const typeOf = (obj) => {
  if(obj === undefined || obj === null)
    return String(obj);
  var classToType = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object'
  };
  return classToType[Object.prototype.toString.call(obj)];
};
const isBool = (value) => {
  return typeOf(value) === 'boolean';
};
const isString = (value) => {
  return typeOf(value) === 'string';
};
const isNumber = (value) => {
  return typeOf(value) === 'number';
};
const isFunction = (value) => {
  return typeOf(value) === 'function';
};
const isRegex = (value) => {
  return typeOf(value) === 'regexp';
};
const isArray = (value) => {
  return typeOf(value) === 'array';
};
const isObject = (value) => {
  return typeOf(value) === 'object';
};
const isEmpty = (obj) => {
  if (isArray(obj))
    return obj.length === 0;
  if (isString(obj))
    return obj.length === 0;
  if (isObject(obj)) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for(var key in obj){
      if(hasOwnProperty.call(obj, key))
        return false;
    }
  }
  return true;
};

const isNonEmpty = (obj) => {
  return ! isEmpty(obj);
};

const curry = (fun) => {
  return function curried(x,optionalY){
    if(arguments.length > 1){
      return fun.call(this, x,optionalY);
    } else {
      return function partiallyApplied(y) {
        return fun.call(this, x,y);
      };
    }
  };
};
/*
 * def uncurry g [a,b] = g a b
 *
 */
const uncurry = (fun) => {
  expect(fun).to.a('function');
  return function () {
    var result = fun;
    for (var i = 0; i < arguments.length; i++) { 
      result = result(arguments[i]);
    }
    return result;
  };
};

const loop = (predicate) => {
  expect(predicate).to.a('function');
  return (accumulator) => {
    var doLoop = (fun) => {
      expect(fun).to.a('function');
      if(truthy(predicate(accumulator))){
        return loop(predicate)(fun(accumulator))(fun);
      } else {
        return accumulator;
      }
    };
    return doLoop;
  };
};

const tap = (target) => {
  return (sideEffect) => {
    sideEffect(target);
    return target;
  };
};
// pipe = flip(compose)
const pipe = (fun) => {
  expect(fun).to.a('function');
  return flip(compose)(fun);
};
const read = (msg) => {
  return (g) => {
    return (input) => {
      var line = before('\n')(input);
      var input_ = after('\n')(input);
      return msg.concat(line.concat(['\n'].concat(g(line)(input_))));
    };
  };
};

const write = (msg) => {
  var self = this;
  return (g) => {
    return (input) => {
      return msg.concat(g.bind(self)(input));
    };
  };
};

// 'until' p f  yields the result of applying f until p holds.
//   ~~~haskell
// until :: (a -> Bool) -> (a -> a) -> a -> a
// until p f x
//   | p x       =  x
//   | otherwise =  until p f (f x)
// ~~~
const until = (predicate) => {
  expect(predicate).to.a('function');
  return (fun) => {
    expect(fun).to.a('function');
    return (any) => {
      if(truthy(predicate(any))) {
        return any;
      } else {
        return until(predicate)(fun)(fun(any));
      }
    };
  };
};

const fluent = (body) => {
  return function applyFluent() {
    body.apply(this, arguments);
    return this;
  };
};

module.exports = {
  either: require('./kansuu-either.js'),
  math: require('./kansuu-math.js'),
  pair: require('./kansuu-pair.js'),
  stream: require('./kansuu-stream.js'),
  string: require('./kansuu-string.js'),
  array: require('./kansuu-array.js'),
  record: require('./kansuu-record.js'),
  // monad: require('./kansuu-monad.js'),
  monad: {
    identity: require('./kansuu-monad.js').identity,
    maybe: require('./kansuu-monad.js').maybe,
    list: require('./kansuu-monad.js').list,
    io: require('./kansuu-monad.js').io,
    random: require('./kansuu-monad.js').random,
    parser: require('./kansuu-monad.js').parser,
    cont: require('./kansuu-monad.js').cont
  },
  match: match,
  id: id,
  compose: compose,
  flip: flip,
  curry: curry,
  uncurry: uncurry,
  not: not, 
  and: and,
  or: or,
  times: times,
  existy: existy,
  truthy: truthy,
  falsy: falsy,
  typeOf: typeOf,
  isBool: isBool,
  isString: isString,
  isNumber: isNumber,
  isFunction: isFunction,
  isRegex: isRegex,
  isArray: isArray,
  isObject: isObject,
  isEmpty: isEmpty,
  isNonEmpty: isNonEmpty,
  loop: loop,
  tap: tap,
  pipe: pipe,
  read: read,
  write: write,
  fluent: fluent,
  until: until,
};

