"use strict";

var expect = require('expect.js');
var base = require('../lib/kansuu-base.js');
// var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var mt = Random.engines.mt19937();
var fs = require('fs');

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
// times: function(n, init, fun){
//   return function(self){
//     if (n === 1)
//       return init;
//     else
//       return self.times(n-1, fun(init), fun);
//   }(this);
// },

const match = (exp, pattern) => {
  return exp(pattern);
};


module.exports = {
  either: require('./kansuu-either.js'),
  match: match,
  id: id,
  compose: compose,
  flip: flip,
  not: not, 
  times: times,
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
  existy: function(any) {
    return any != null;
  },
  truthy: function(any) {
    return any !== false && any != null;
  },
  falsy: function(any) {
    var self = this;
    return self.not.bind(self)(self.truthy(any));
  },
  // typeOf:: obj => String
  typeOf: (obj) => {
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
  },
  isBool: function(value){
    var self = this;
    return self.typeOf(value) === 'boolean';
  },
  isString: function(value){
    var self = this;
    return self.typeOf(value) === 'string';
  },
  isNumber: function(value){
    var self = this;
    return self.typeOf(value) === 'number';
  },
  isFunction: function(value){
    var self = this;
    return self.typeOf(value) === 'function';
  },
  isRegex: function(value){
    var self = this;
    return self.typeOf(value) === 'regexp';
  },
  isArray: function(value){
    var self = this;
    return self.typeOf(value) === 'array';
  },
  isObject: function(value){
    var self = this;
    return self.typeOf(value) === 'object';
  },
  isEmpty: function(obj) {
    var self = this;
    if (self.isArray(obj))
      return obj.length === 0;
    if (self.isString(obj))
      return obj.length === 0;
    if (self.isObject(obj)) {
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      for(var key in obj){
        if(hasOwnProperty.call(obj, key))
          return false;
      }
    }
    return true;
  },
  isNonEmpty: function(obj) {
    var self = this;
    return ! self.isEmpty(obj);
  },
  algebraic: {
    match: (exp, pattern) => {
      var self = this;
      return exp.call(pattern, pattern);
    }
  },
  combinator: {
    /*
     * S x y z = (x z)(y z)
     */
    S: function(x) {
      return function(y){
        return function(z){
          return (x(z))(y(z));
        };
      };
    },
    /* #@range_begin(K_combinator) */
    K: function(x){
      return function(y){
        return x;
      };
    },
    /* #@range_end(K_combinator) */
    I: function(any) {
      return any;
    },
    /*
       B f g x = f(g(x))
       */
    B: function(x) {
      return function(y){
        return function(z){
          return x(y(z));
        };
      };
    },
    /*
       C f g x = f x g
       */
    C: function(x) {
      return function(y){
        return function(z){
          return (x(z))(y);
        };
      };
    },
    /* #@range_begin(Y_combinator) */
    Y: function(F) {
      return (function(g) {
        return function(x) {
          return F(g(g))(x);
        };
      })(function(g) {
        return function(x) {
          return F(g(g))(x);
        };
      });
    },
    /* #@range_end(Y_combinator) */
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
  /* #@range_begin(curry) */
  curry: function(fun) {
    return function curried(x,optionalY){
      if(arguments.length > 1){
        return fun.call(this, x,optionalY);
      } else {
        return function partiallyApplied(y) {
          return fun.call(this, x,y);
        };
      }
    };
  },
  /* #@range_end(curry) */
  /*
   * def uncurry g [a,b] = g a b
   *
   */
  uncurry : function (fun) {
    expect(fun).to.a('function');
    return function() {
      var result = fun;
      for (var i = 0; i < arguments.length; i++)
        result = result(arguments[i]);
      return result;
    };
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
  // // 'objects' module
  // // ==============
  // objects: {
  //   empty: {
  //   },
  //   unit: (key, value) => {
  //     var self = this;
  //     return self.objects.set.call(self,key)(value)(self.objects.empty);
  //     // return self.tap(self.objects.empty)((obj) => {
  //     //    obj[key] = value;
  //     // });
  //   },
  //   set: (key) => {
  //     var self = this;
  //     return (value) => {
  //       return (obj) => {
  //         expect(obj).to.an('object');
  //         return self.tap.call(self,obj)((target) => {
  //           target[key] = value;
  //         });
  //       };
  //     };
  //   },
  //   get: (key) => {
  //     var self = this;
  //     return (obj) => {
  //       expect(obj).to.an('object');
  //       return obj[key];
  //     };
  //   },
  //   isEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     var hasOwnProperty = Object.prototype.hasOwnProperty;
  //     for(var key in obj){
  //       if(hasOwnProperty.call(obj, key))
  //         return false;
  //     }
  //   },
  //   isNotEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     return self.not.call(self,self.objects.isEmpty(obj));
  //   },
  // },
  //
  // 'list' module
  // ===========
  //
  // ~~~scala
  // trait List[+T] {
  //   def isEmpty: Boolean
  //   def head: T
  //   def tail: List[T]
  //   def ::[U>:T](item: U): List[U]
  //   def map[U](f: T => U): List[U] = if (isEmpty) Nil
  //                                    else f(head) :: tail.map(f)
  //   def last: T = {
  //     @annotation.tailrec
  //     def recursive(list:List[T]):T = {
  //       if(list.tail.isEmpty)
  //         list.head
  //       else {
  //        recursive(list.tail)
  //       }
  //     }
  //     recursive(this)
  //   }
  //   def foreach(f: T => Unit): Unit = {
  //     if(isEmpty)
  //       return
  //     else {
  //       f(head)
  //       tail.foreach(f)
  //     }
  //   }
  // }
  // case class ListImpl[T](val head: T, val tail: List[T]) extends List[T] {
  //   def ::[U>:T](item: U): List[U] = new ListImpl(item, this)
  //   def isEmpty = false
  // }
  // case object Nil extends List[Nothing] {
  //   def ::[U>:Nothing](item: U): List[U] = ListImpl(item, Nil)
  //   override def isEmpty = true
  //   def head: Nothing = throw new NoSuchElementException("no head in empty list")
  //   def tail: List[Nothing] = throw new NoSuchElementException("no tail in empty list")
  // }
  // ~~~
  // 'btree' module
  // ===========
  //
  // ~~~haskell
  // type BTree a = Leaf a
  //              | Fork (BTree a) (BTree a)
  //
  // unit x = Leaf x
  // flatMap (Leaf x) = \f -> f x
  // flatMap (Fork t1 t1) =
  //   \f -> Fork (flatMap t1 f)
  //              (flatMap t2 f)
  // ~~~
  btree: {
    censor: function(obj){
      expect(obj).to.have.property('type','btree');
      expect(obj).to.have.property('leaf');
      expect(obj).to.have.property('fork');
      return obj;
    },
    unit: (value) => {
      return {
        type: 'btree',
        leaf: value,
        fork: base.nothing
      };
    },
    // ## btree#mkBtree
    // ~~~haskell
    // mkBtree :: List a -> Btree a
    // mkBtree xs =
    //
    // ~~~
    mkBtree: (list) => {
      var self = this;
      self.list.censor.call(self,list);
      expect(list).to.not.be.empty();
      if(self.list.length.call(self, list) === 1) {
        return self.btree.unit.call(self, list.head);
      } else {
        var pair = self.list.halve.call(self, list);
        var leftList = self.pair.left.call(self,pair);
        var rightList = self.pair.right.call(self,pair);
        self.list.censor.call(self,leftList);
        self.list.censor.call(self,rightList);
        var leftBranch = self.btree.mkBtree.call(self, leftList);
        var rightBranch = self.btree.mkBtree.call(self, rightList);
        return {
          type: 'btree',
          leaf: base.nothing,
          fork: self.pair.mkPair.call(self,leftBranch)(rightBranch)
        };
      }
    },
    // ## btree#flatMap
    // ~~~haskell
    // flatMap (Leaf x) = \f -> f x
    // flatMap (Fork t1 t1) =
    //   \f -> Fork (flatMap t1 f)
    //              (flatMap t2 f)
    // ~~~
    flatMap: (btree) => {
      var self = this;
      self.btree.censor.call(self,btree);
      return (transform) => {
        expect(transform).to.a('function');
        if(self.existy(btree.leaf)){
          return transform.call(self, btree.leaf);
        } else {
          self.pair.censor.call(self,btree.fork);
          var leftBranch = self.pair.left.call(self, btree.fork);
          var rightBranch = self.pair.right.call(self, btree.fork);
          return {
            type: 'btree',
            leaf: base.nothing,
            fork: self.pair.mkPair.call(self,
                self.btree.flatMap.call(self, leftBranch)(transform))(self.btree.flatMap.call(self, rightBranch)(transform))
          };
        }
      };

    },
    // ## btree#map
    // c.f."Introduction to Functional Programming using Haskell",p.184
    // ~~~haskell
    //  map f (Leaf x) = Leaf (f x)
    //  map f (Fork xt yt) = Fork (map f xt) (map f yt)
    // ~~~
    map: (btree) => {
      var self = this;
      self.btree.censor.call(self,btree);
      return (transform) => {
        expect(transform).to.a('function');
        if(self.existy(btree.leaf)){
          return self.btree.unit.call(self, transform.call(self, btree.leaf));
        } else {
          self.pair.censor.call(self,btree.fork);
          var leftBranch = self.pair.left.call(self, btree.fork);
          var rightBranch = self.pair.right.call(self, btree.fork);
          return {
            type: 'btree',
            leaf: base.nothing,
            fork: self.pair.mkPair.call(self,
                self.btree.map.call(self, leftBranch)(transform))(self.btree.map.call(self, rightBranch)(transform))
          };
        }
      };
    },
    // ## btree#size
    // c.f."Introduction to Functional Programming using Haskell",p.181
    // ~~~haskell
    // size = length . flatten
    // ~~~
    size: (btree) => {
      var self = this;
      self.btree.censor.call(self,btree);
      return self.compose.call(self, self.list.length.bind(self))(self.btree.flatten.bind(self))(btree);
    },
    // ## btree#flatten
    // ~~~haskell
    //  flatten = fold wrap append
    // ~~~
    flatten: (btree) => {
      var self = this;
      self.btree.censor.call(self,btree);
      var wrap = (value) => {
        return self.list.cons.call(self, value)(self.list.empty);
      };
      return self.btree.fold.call(self,btree)(wrap.bind(self))(self.list.append.bind(self));
      // if(self.existy(btree.leaf)){
      //   return self.list.cons.call(self,btree.leaf)(self.list.empty);
      // } else {
      //   self.pair.censor.call(self,btree.fork);
      //   var leftBranch = self.btree.flatten.call(self, self.pair.left.call(self, btree.fork));
      //   var rightBranch = self.btree.flatten.call(self, self.pair.right.call(self, btree.fork));
      //   return  self.list.append.call(self,
      //                                 leftBranch)(rightBranch);
      // }
    },
    // ## btree#fold
    // c.f."Introduction to Functional Programming using Haskell",p.184
    // ~~~haskell
    //  fold f g (Leaf x) = f x
    //  fold f g (Fork xt yt) = g(fold f g xt) (fold f g yt))
    // ~~~
    fold: (btree) => {
      var self = this;
      self.btree.censor.call(self,btree);
      return (f) => {
        expect(f).to.a('function');
        return (g) => {
          expect(g).to.a('function');
          if(self.existy(btree.leaf)){
            return f.call(self, btree.leaf);
          } else {
            self.pair.censor.call(self,btree.fork);
            var xt = self.pair.left.call(self, btree.fork);
            var yt = self.pair.right.call(self, btree.fork);
            return g.call(self, self.btree.fold.call(self, xt)(f)(g))(self.btree.fold.call(self, yt)(f)(g));
          }
        };
      };
    },
    append:(xt) => {
      var self = this;
      self.btree.censor(xt);
      return function(yt){
        self.btree.censor(yt);
        if(self.existy(xt.leaf)){
          return {
            type: 'btree',
            leaf: base.nothing,
            fork: self.pair.mkPair.call(self,xt.leaf)(yt)
          };
        } else {
          self.pair.censor.call(self,xt.fork);
          var leftBranch = self.pair.left.call(self, xt.fork);
          var rightBranch = self.pair.right.call(self, xt.fork);
          return {
            type: 'btree',
            leaf: base.nothing,
            fork: self.btree.append.call(self,self.btree.append.call(self,leftBranch)(rightBranch))(yt)
          };
        }
      };
    },
    // empty: {
    //   type : 'btree',
    //   leaf : base.nothing,
    //   fork : base.nothing
    // },
    // // tree#isEmpty
    // isEmpty: function(btree){
    //   var self = this;
    //   self.btree.censor(btree);
    //   if(self.btree.head === base.nothing && list.btree === base.nothing){
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
  }, /* end of 'btree' module */
  /* #@range_begin(record_module) */
  record:{
    empty: function(_){
      var self = this;
      return self.monad.maybe.nothing;
    },
    extend: function(record){
      expect(record).to.a('function');
      var self = this;
      return function(key){
        return function(value){
          return function(lookupKey){
            if(lookupKey === key){
              return self.monad.maybe.unit.bind(self)(value);
            } else {
              return record(lookupKey);
            }
          };
        };
      };
    },
    lookup: function(record){
      return function(key){
        return record(key);
      };
    },
  }, /* end of 'record' module */
  /* #@range_end(record_module) */
  /*
   * Array
   */
  // cons:: (T)([T]) => [T]
  cons: (any) => {
    var self = this;
    return (array) => {
      expect(array).to.an('array');
      return [any].concat(array);
    };
  },
  snoc: (any) => {
    return function(array){
      expect(array).to.an('array');
      return array.concat([any]);
    };
  },
  head: (mappable) => {
    var self = this;
    switch (self.typeOf(mappable)){
      case 'array':
        return mappable[0]; //self.head.bind(self)(mappable);
        break;
      case 'string':
        return self.string.head.bind(self)(mappable);
        break;
      default:
        expect.fail();
        break;
    }
  },
  tail: (mappable) => {
    var self = this;
    expect(self.isNonEmpty(mappable)).to.be.ok();
    switch (self.typeOf(mappable)){
      case 'array':
        return mappable.slice(1,mappable.length);
        break;
      case 'string':
        return self.string.tail.bind(self)(mappable);
        break;
      default:
        expect.fail();
        break;
    }
  },
  /* #@range_end(reduce) */
  foldr: function(op, init, array) {
    return function(context){
      if (context.isEmpty.bind(self)(array)) {
        return init;
      } else {
        var head = context.head(array);
        return op(head, context.foldr(op, init, array));
      }
    }(this);
  },
  // last:: [T] => T
  last: function(list){
    expect(list).to.an('array');
    expect(list).to.not.be.empty();
    var self = this;
    return self.compose(self.head)(self.reverse)(list);
  },
  // concat :: ([T])([T]) => [T]
  concat: function(xs){
    expect(xs).to.an('array');
    return function(ys){
      expect(ys).to.an('array');
      return xs.concat(ys);
    };
  },
  // tail: function(array){
  //    expect(array).to.an('array');
  //    expect(array).to.not.be.empty();
  //   return array.slice(1,array.length);
  // },
  //
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

  // ## state monad
  //
  // ~~~scala
  // case class State[S, +A](run: S => (A, S)) {
  //   def map[B](f: A => B): State[S, B] =
  //     flatMap(a => unit(f(a)))
  //   def map2[B,C](sb: State[S, B])(f: (A, B) => C): State[S, C] =
  //     flatMap(a => sb.map(b => f(a, b)))
  //   def flatMap[B](f: A => State[S, B]): State[S, B] = State(s => {
  //     val (a, s1) = run(s)
  //     f(a).run(s1)
  //   })
  // }
  // ~~~
  // ~~~haskell
  // newtype State s a = State { runState :: s -> (a, s) }
  // instance Monad (State s) where
  // return a = State $ \s -> (a, s)
  // m >>= k  = State $ \s -> let (a, s') = runState m s
  //    in runState (k a) s'
  // ~~~
  // ~~~scheme
  // (define-monad State
  //   (unitM (x)   (lambda (s) (values x s)))
  //   (bindM (m f) (lambda (s)
  //                  (receive (val s*) (m s)
  //                    ((f val) s*))))
  //   (getM  ()    (lambda (s) (values s s)))
  //   (putM  (s)   (lambda (_) (values #f s)))
  //   (runM  (m init) (m init)))
  // ~~~
  state:{
    // ### state#unit
    unit: (value) => {
      var self = this;
      var instance = {
        type : 'state',
        run: (s) => { //s -> (a,s)
          return self.pair.cons.call(self,
              value)(s);
        }
      };
      return self.tap.call(self, instance)(function (target){
        Object.freeze(target);
      });
    },
    // state#flatMap
    flatMap: (state) => {
      var self = this;
      return (transform) => {
        return (s) => {
          var newTransition /* (a, s) */ = state.run(s);
          return transform(newTransition.left).run(newTransition.right);
        };
      };
      // return (transform /* A => State[S,B] */ ) => {
      //   var newTransition /* Pair[A,State] */ = stateA.run(s);
      //   return transform(newTransition.left).run(newTransition.right);
      //   // var run = (s) => {
      //   //   var newTransition /* Pair[A,State] */ = stateA.run(s);
      //   //   return transform(newTransition.left).run(newTransition.right);
      //   // };
      //   // return run.call(self, stateA);
      //   // return self.monad.state.unit.call(self,
      //   //                                   run);
      // };
    },
    map: (stateA) => {
      var self = this;
      return (transform /* A => B */ ) => {
        return self.monad.state.flatMap.bind(self)(stateA)((a) => {
          self.monad.state.unit.bind(self)(transform(a));
        });
      };
    }
    //def get[S]: State[S, S] = State(s => (s, s))

    //def set[S](s: S): State[S, Unit] = State(_ => ((), s))
  },
};
