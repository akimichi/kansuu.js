"use strict";

const expect = require('expect.js'),
  base = require('../lib/kansuu-base.js'),
  fs = require('fs');
// var math = require('../lib/kansuu-math.js');

const id = (any) => {
  return any;
};

const not = (any) => {
  return ! any;
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

const existy = (any) => {
  return any != null;
};

const truthy = (any) => {
  return any !== false && any != null;
};

const falsy = (any) => {
  return not(truthy(any));
};

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
  return function() {
    var result = fun;
    for (var i = 0; i < arguments.length; i++) { 
      result = result(arguments[i]);
    }
    return result;
  };
};

module.exports = {
  either: require('./kansuu-either.js'),
  match: match,
  id: id,
  compose: compose,
  flip: flip,
  curry: curry,
  uncurry: uncurry,
  not: not, 
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
  and: (predicate1) => {
    return (predicate2) => {
      return predicate1 && predicate2;
    };
  },
  or: function(p){
    return function(q){
      return p || q;
    };
  },
  add: function(n1){
    return function (n2) {
      return n1 + n2;
    };
  },
  multiply: function(n1){
    return function(n2){
      return n1 * n2;
    };
  },
  div: function(n){
    expect(n).to.a('number');
    return function(m){
      expect(m).to.a('number');
      return Math.floor(n / m);
    };
  },
  subtract: function(n1){
    return function(n2){
      return n1 - n2;
    };
  },
  equal: function(any1){
    return function(any2){
      return (any1 === any2);
    };
  },
  orify: function(predicateA){
    expect(predicateA).to.a('function');
    var self = this;
    return function(predicateB){
      expect(predicateB).to.a('function');
      return function applyOr(any) {
        return self.op['|'].bind(self)(predicateA(any))(predicateB(any));
      };
    };
  },
  andify: function(predicate1){
    expect(predicate1).to.a('function');
    var self = this;
    return function(predicate2){
      expect(predicate2).to.a('function');
      return function applyAnd(any) {
        return self.op['&'].bind(self)(predicate1(any))(predicate2(any));
      };
    };
  },
  /*
  // not: function(predicate){
  //    return function applyNot(any) {
  //      return !predicate(any);
  //    };
  // },
  */
  op: {
    "&" : function(n1){
      return function(n2) {
        return n1 && n2;
      };
    },
    "|" : function(x){
      return function(y) {
        return x || y;
      };
    },
    "+" : function(x){
      return function(y) { return x + y; };
    },
    "-" : function(x){
      return function(y) { return x - y; };
    },
    "*" : function(x){
      return function(y) { return x * y; };
    },
    "/" : function(x){
      return function(y) { return x / y; };
    },
    "!" : function(x){
      return !x;
    },
    ">" : function(n1){
      expect(n1).to.a('number');
      return function(n2) {
        expect(n2).to.a('number');
        return n1 > n2;
      };
    },
    "<" : function(n1){
      expect(n1).to.a('number');
      return function(n2) {
        expect(n2).to.a('number');
        return n1 < n2;
      };
    },
    "==" : function(n1){
      return function(n2) {
        return n1 === n2;
      };
    },
  },
  negate: function(fun){
    return function applyNegate(n) {
      return - fun(n);
    };
  },
  tap: (target) => {
    var self = this;
    var original = target;
    return (sideEffect) => {
      sideEffect(target);
      expect(original).to.eql(target);
      return target;
    };
  },
  freeze: (instance) => {
    var self = this;
    return self.tap.call(self, instance)(function (target){
      Object.freeze(target);
    });
  },
  loop: function(predicate){
    expect(predicate).to.a('function');
    var self = this;
    return function(accumulator) {
      var doLoop = function(fun){
        expect(fun).to.a('function');
        if(self.truthy(predicate(accumulator))){
          return self.loop(predicate)(fun(accumulator))(fun);
        } else {
          return accumulator;
        }
      };
      return doLoop;
    };
  },
  // pipe = flip(compose)
  pipe: function(fun) {
    expect(fun).to.a('function');
    var self = this;
    return self.flip.bind(self)(self.compose)(fun);
  },
  read: (msg) => {
    var self = this;
    return (g) => {
      return (input) => {
        var line = self.before('\n')(input);
        var input_ = self.after('\n')(input);
        return msg.concat(line.concat(['\n'].concat(g.bind(self)(line)(input_))));
      };
    };
  },
  write: (msg) => {
    var self = this;
    return (g) => {
      return (input) => {
        return msg.concat(g.bind(self)(input));
      };
    };
  },
  end: (input) => {
    return "";
  },
  fluent: function(body){
    return function applyFluent() {
      body.apply(this, arguments);
      return this;
    };
  },
  always: function(value){
    return function applyAlways(_) {
      return value;
    };
  },
  thunk: function(val){
    return function() {
      return val;
    };
  },
  time: function(fun){
    var start = (new Date()).getTime();
    try {
      fun(arguments);
    } finally {
      var end = (new Date()).getTime();
      return (end - start)/1000;
    }

  },
  generator: function(initial){
    return function (self) {
      return function (step) {
        var current = initial;
        return function generate(){
          return self.tap(current)(function(the_current){
            current = step(the_current);
          });
        };
      };
    }(this);
  },
  takeCPS: function(n, gen, continues){
    return function(self){
      if (n === 1)
        return continues([gen()]);
      else
        return self.takeCPS(n-1, gen, function (result) {
          return continues(result.concat(gen()));
        });
    }(this);
  },
  plucker: function(key){
    return function(obj){
      return obj[key];
    };
  },
  // get
  // get :: String => Object => Maybe[Any]
  get: function(key){
    var self = this;
    return function(obj){
      expect(obj).to.an('object');
      return self.monad.maybe.unit.bind(self)(obj[key]);
      //expect(obj).to.have.property(key);
      //return obj[key];
    };
  },
  // 'until' p f  yields the result of applying f until p holds.
  //
  // ~~~haskell
  // until :: (a -> Bool) -> (a -> a) -> a -> a
  // until p f x
  //       | p x       =  x
  //       | otherwise =  until p f (f x)
  // ~~~
  until: function(predicate){
    expect(predicate).to.a('function');
    var self = this;
    return function(fun){
      expect(fun).to.a('function');
      return function(any){
        if(self.truthy(predicate(any))) {
          return any;
        } else {
          return self.until.bind(self)(predicate)(fun)(fun(any));
        }
      };
    };
  },
  cond: function(predicate){
    return function(trueCase){
      return function(falseCase){
        if (predicate) {
          return trueCase();
        } else {
          return falseCase();
        }
      };
    };
  },
  // lines breaks a string up into a list of strings at newline characters.
  // The resulting strings do not contain newlines.  Similary, words
  // breaks a string up into a list of words, which were delimited by
  // white space.  unlines and unwords are the inverse operations.
  // unlines joins lines with terminating newlines, and unwords joins
  // words with separating spaces.
  //
  // ~~~haskell
  // lines            :: String -> [String]
  // lines ""         =  []
  // lines s          =  let (l, s') = break (== '\n') s
  //                       in  l : case s' of
  //                                 []      -> []
  //                                 (_:s'') -> lines s''
  // ~~~
  //
  // type:  lines :: String -> [String]
  // description:   applied to a list of characters containing newlines, returns a list of lists by breaking the original list into lines using the newline character as a delimiter. The newline characters are removed from the result.
  //
  // definition:
  //
  // lines [] = []
  // lines (x:xs)
  //   = l : ls
  //   where
  //   (l, xs') = break (== '\n') (x:xs)
  //   ls
  //     | xs' == [] = []
  //     | otherwise = lines (tail xs')
  //
  // usage:
  // ~~~haskell
  // lines "hello world\nit's me,\neric\n"
  // ["hello world", "it's me,", "eric"]
  // ~~~
  lines: (string) => {
    expect(string).to.a('string');
    var self = this;
    if(self.isEmpty(string)){
      return [];
    } else {
      var isNewline = (ch) => {
        return ch === '\n';
      };
      var broken = self.break.bind(self)(isNewline)(self.string.toArray.bind(self)(string));
      var l = broken.left;
      var xs_ = broken.right;
      if(self.isEmpty(xs_)){
        return self.list.cons.bind(self)(l)([]);
      } else {
        return self.list.cons.bind(self)(l)(self.lines.bind(self)(self.list.tail.bind(self)(xs_)));
      }
    }
  },
  // ~~~haskell
  // words            :: String -> [String]
  // words s          =  case dropWhile Char.isSpace s of
  //                     "" -> []
  //                     s' -> w : words s''
  //                          where (w, s'') = break Char.isSpace s'
  // ~~~

};
