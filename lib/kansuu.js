"use strict";

var expect = require('expect.js');
var base = require('../lib/kansuu-base.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var mt = Random.engines.mt19937();


module.exports = {
  id: function(any){
    return any;
  },
  not: function(any){
    return ! any;
  },
  and: function(predicate1){
    var self = this;
    return function(predicate2){
      return predicate1 && predicate2;
    };
  },
  or: function(p){
    var self = this;
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
      // expect(original).to.eql(target);
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
  compose: function(fun1){
    expect(fun1).to.a('function');
    var self = this;
    return function(fun2){
      expect(fun2).to.a('function');
      return function(_){
        return fun1.call(self, fun2.apply(self, arguments));
      };
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
  flip: function(fun) {
    expect(fun).to.a('function');
    var self = this;
    return function (first) {
      return function (second) {
        return fun.call(self, second)(first);
      };
    };
  },
  // pipe = flip(compose)
  pipe: function(fun) {
    expect(fun).to.a('function');
    var self = this;
    return self.flip.bind(self)(self.compose)(fun);
  },
  // pair module
  // ==============
  pair: {
    // ## censor
    // ### type
    // censor: OBJ => OBJ
    //
    // ### usage
    // ~~~
    // expect(
    //   pair.censor(obj)
    // ).to.eql(
    //   {
    //     type: "pair",
    //     left: 1,
    //     right: 2
    //   }
    // );
    // ~~~
    // pair#censor
    censor: function(obj){
      expect(obj).to.have.property('type','pair');
      expect(obj).to.have.property('left');
      expect(obj).to.have.property('right');
      return obj;
    },
    // pair.cons
    cons: (left) => {
      var self = this;
      return (right) => {
        var instance = {
          type : 'pair',
          left : left,
          right : right
        };
        return self.tap.call(self, instance)(function (target){
          Object.freeze(target);
        });
      };
    },
    mkPair: (left) => {
      var self = this;
      return (right) => {
        return self.pair.cons.call(self,left)(right);
      };
    },
    left: (pair) => {
      var self = this;
      return self.plucker.bind(self)("left")(pair);
    },
    right: (pair) => {
      var self = this;
      return self.plucker.bind(self)("right")(pair);
    },
    swap: (pair) => {
      var self = this;
      return self.pair.mkPair.bind(self)(pair.right)(pair.left);
    }
  },
  // take:: ([T])(n) => [T]
  take: function(array){
    expect(array).to.an('array');
    var self = this;
    return function(n){
      expect(n).to.be.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0)
        return [];
      else {
        if(self.isEmpty(array)) {
          return [];
        } else {
          var head = self.head(array);
          var tail = self.tail(array);
          return self.cons(head)(self.take.bind(self)(tail)(n-1));
        }
      }
    };
  },
  // drop
  drop: (array) => {
    expect(array).to.an('array');
    var self = this;
    return function(n){
      expect(n).to.be.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0)
        return array;
      else {
        if(self.isEmpty(array))
          return [];
        else {
          var tail = self.tail(array);
          return self.drop.bind(self)(tail)(n-1);
        }
      }
    };
  },
  // Split a list at the nth element:
  // ~~~haskell
  // splitAt :: Int → [a ] → ([a ], [a ])
  // splitAt n xs = (take n xs, drop n xs)
  // ~~~
  splitAt: (array) => {
    expect(array).to.an('array');
    var self = this;
    return (n) => {
      expect(n).to.a('number');
      return [self.take.bind(self)(array)(n), self.drop.bind(self)(array)(n)];
    };
  },
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
  list: {
    censor: function(obj){
      expect(obj).to.have.property('type','list');
      expect(obj).to.have.property('head');
      expect(obj).to.have.property('tail');
      return obj;
    },
    /* #@range_begin(list_empty) */
    // ### list#empty
    empty: {
      type : 'list',
      head : base.nothing,
      tail : base.nothing
    },
    /* #@range_end(list_empty) */
    // list#isEmpty
    isEmpty: function(list){
      var self = this;
      self.list.censor(list);
      if(self.list.head === base.nothing && list.tail === base.nothing){
        return true;
      } else {
        return false;
      }
    },
    /* #@range_begin(list_isEqual) */
    // ## list#isEqual
    isEqual: function(list1){
      var self = this;
      self.list.censor(list1);
      return function(list2){
        self.list.censor(list2);
        if(self.list.length.bind(self)(list1) === self.list.length.bind(self)(list2)){
          var zipped = self.list.zip.bind(self)(list1)(list2);
          return self.list.reduce.bind(self)(zipped)(true)(function(pair){
            return function(accumulator){
              return accumulator && (pair.left === pair.right);
            };
          });
        } else {
          return false;
        }
      };
    },
    /* #@range_end(list_isEqual) */
    // ## list#cons
    // cons :: T => List[T] => List
    /* #@range_begin(list_cons) */
    cons: function(any){
      var self = this;
      return function(list){
        self.list.censor.bind(self)(list);
        var instance = {
          type: 'list',
          head: any,
          tail: list,
          isEqual: function(list){
            self.list.censor(list);
            return self.list.isEqual.call(self,instance)(list);
          }
        };
        return self.tap.call(self, instance)(function (target){
          Object.freeze(target);
        });
      };
    },
    /* #@range_end(list_cons) */
    // list#at
    at: (list) => {
      var self = this;
      self.list.censor.call(self,list);
      return (index) => {
        expect(index).to.a('number');
        expect(index).to.be.greaterThan(-1);
        if (index === 0) {
          return list.head;
        } else {
          var nextList = list.tail;
          return self.list.at.call(self,
                                   nextList)(index-1);
        }
      };
    },
    // ## list#tail
    tail: function(list){
      var self = this;
      self.list.censor(list);
      return list.tail;
    },
    // head: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return list.head;
    // },
    // ## list#mkList
    mkList: function(array){
      expect(array).to.an('array');
      //expect(array.length).to.above(0);
      var self = this;
      if(array.length === 1){
        return self.list.cons.bind(self)(self.head(array))(self.list.empty);
      } else {
        return self.list.cons.bind(self)(self.head(array))(self.list.mkList.bind(self)(self.tail(array)));
      }
    },
    fromArray: (array) => {
      expect(array).to.an('array');
      var self = this;
      return self.list.mkList.call(self,array);
    },
    fromString: (string) => {
      expect(string).to.a('string');
      var self = this;
      return self.list.mkList.call(self,self.string.toArray.call(self,string));
    },
    // ## list#snoc
    // snoc :: T => List => List
    snoc: function(any){
      var self = this;
      return function(list){
        self.list.censor(list);
        return self.list.concat.bind(self)(list)(self.list.mkList.bind(self)([any]));
      };
    },
    // ## list#join
    // join :: List[List[T]] => List[T]
    //
    // ~~~haskell
    // join :: List (List a) -> List a
    // join Nil = Nil
    // join (Cons xs xss) =  concat xs (join xss)
    // ~~~
    join: function(list){
      var self = this;
      self.list.censor(list);
      if(self.list.isEmpty.bind(self)(list)){
        return self.list.empty;
      } else {
        return self.list.concat.bind(self)(list.head)(self.list.join.bind(self)(list.tail));
      }
    },
    // ## list#concat
    //
    // ~~~haskell
    // concat :: List => List => List
    // concat :: List a -> List a -> List a
    // concat Nil ys = ys
    // concat (Cons x xs) ys = Cons x (cat xs ys)
    // ~~~
    concat: function(xs){
      var self = this;
      self.list.censor(xs);
      return function(ys){
        self.list.censor(ys);
        if(self.list.isEmpty.bind(self)(xs)){
          return ys;
        } else {
          return self.list.cons.bind(self)(xs.head)(self.list.concat.bind(self)(xs.tail)(ys));
        }
      };
    },
    // ## list#foldr
    //
    // if the list is empty, the result is the initial value z; else
    // apply f to the first element and the result of folding the rest
    //
    // foldr (⊕) v [x0, x1, ..., xn] = x0 ⊕ (x1 ⊕ (...(xn ⊕ v)...))
    //
    // ~~~haskell
    // foldr f z []     = z
    // foldr f z (x:xs) = f x (foldr f z xs)
    // ~~~
    foldr: (list) => {
      var self = this;
      self.list.censor(list);
      return (accumulator) => {
          return (glue) => {
            expect(glue).to.a('function');
            if(self.list.isEmpty.call(self,list)){
              return accumulator;
            } else {
              var item = list.head;
              var tail = list.tail;
              return glue(item)(self.list.foldr.call(self,
                                                     tail)(accumulator)(glue));
            }
            // if(self.list.isEmpty.call(self,tail)) {
            //   return glue(item)(accumulator);
            // } else {
            //   return glue(item)(self.list.foldr.call(self,
            //                                          tail)(accumulator)(glue));
            // }
          };
      };
    },
    // ## list#foldl
    //
    //  if the list is empty, the result is the initial value; else
    //  we recurse immediately, making the new initial value the result
    //  of combining the old initial value with the first element.
    //
    // ~~~haskell
    // foldl :: (a → b → a) → a → [b ] → a
    // foldl _ v [ ] = v
    // foldl f v (x : xs) = foldl f (f v x) xs
    // ~~~
    foldl: function(list){
      var self = this;
      self.list.censor(list);
      //expect(self.list.isEmpty(list)).to.not.be(true);
      return function(accumulator){
        return function(glue){
          expect(glue).to.a('function');
          if(self.list.isEmpty.bind(self)(list)) {
            return accumulator;
          } else {
            var item = list.head;
            var tail = list.tail;
            return self.list.foldl.bind(self)(tail)(glue(item)(accumulator))(glue);
          }
        };
      };
    },
    // list#reduce
    /* #@range_begin(list_reduce) */
    reduce: (list) => {
      var self = this;
      self.list.censor(list);
      expect(self.list.isEmpty.bind(self)(list)).to.not.be(true);
      return (accumulator) => {
        return (glue) => {
          expect(glue).to.a('function');
          var item = list.head;
          var tail = list.tail;
          if(self.list.isEmpty.bind(self)(tail)) {
            return glue(item)(accumulator);
          } else {
            return glue(item)(self.list.reduce.bind(self)(tail)(accumulator)(glue));
          }
        };
      };
    },
    /* #@range_end(list_reduce) */
    // list#sum
    sum: (list) => {
      var self = this;
      self.list.censor(list);
      return self.list.reduce.bind(self)(list)(0)((currentValue) => {
        return (accumulator) => {
          return currentValue + accumulator;
        };
      });
    },
    // list#reverse
    // ~~~haskell
    // reverse :: List => List
    // reverse = foldl cons, []
    // ~~~
    reverse: function(list){
      var self = this;
      self.list.censor(list);
      return self.list.foldl.bind(self)(list)(self.list.empty)(self.list.cons.bind(self));
      // if(self.list.isEmpty.bind(self)(list)){
      //   return list;
      // } else {
      //   return self.list.snoc.bind(self)(list.head)(self.list.reverse.bind(self)(list.tail));
      // }
    },
    // ## list#flatMap
    //
    // ~~~haskell
    // flatMap :: List[T] => (T => List[S]) => List[S]
    // instance Monad [] where
    //   return x = [x]
    //   xs >>= f = join (map f xs)
    // ~~~
    flatMap: function(list){
      var self = this;
      self.list.censor(list);
      return function(transform){
        expect(transform).to.a('function');
        return self.list.censor.call(self,
                                     self.list.join.call(self,
                                                         self.list.map.call(self,
                                                                            list)(transform)));
        //return self.list.join.bind(self)(self.list.map.bind(self)(list)(transform));
      };
    },
    // ## list#map
    // map :: List => fun => List
    // ~~~haskell
    //  map f = foldr (cons . f) Nil
    // ~~~
    // map: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return function(transform){
    //     expect(transform).to.a('function');
    //     return self.list.reduce.bind(self)(list)(self.list.empty)(function(item){
    //       return function(accumulator){
    //         return self.list.cons.bind(self)(transform.call(self,item))(accumulator);
    //       };
    //     });
    //   };
    // },
    /* #@range_begin(list_map) */
    map: (list) => {
      var self = this;
      self.list.censor(list);
      return (transform) => {
        expect(transform).to.a('function');
        var glue = self.compose.call(self, self.list.cons.bind(self))(transform);
        return self.list.foldr.call(self,
                                    list)(self.list.empty)(glue);
      };
    },
    /* #@range_end(list_map) */
    //
    // ## list#filter
    //
    // ~~~haskell
    // filter p []  = []
    // filter p (x:xs)  = if p x then x:filter p xs
    //                    else filter p xs
    // ~~~
    filter: function(list){
      var self = this;
      self.list.censor(list);
      return function(predicate){
        expect(predicate).to.a('function');
        var reversed =  self.list.reduce.bind(self)(list)(self.list.empty)(function(item){
          return function(accumulator){
            if(self.truthy(predicate(item))) {
              return self.list.snoc.bind(self)(item)(accumulator);
            } else {
              return accumulator;
            }
          };
        });
        return self.list.reverse.bind(self)(reversed);
      };
    },
    // ## list#listToMaybe
    // ~~~haskell
    // listToMaybe            :: [a] -> Maybe a
    // listToMaybe []         =  Nothing
    // listToMaybe (a:_)      =  Just a
    // ~~~
    listToMaybe: (list) => {
      var self = this;
      self.list.censor(list);
      //console.log(list)
      if(self.list.isEmpty.call(self, list)) {
        return self.monad.maybe.nothing;
      } else {
        return self.monad.maybe.unit.call(self, list.head);
      }
    },
    // ## list#find
    // The find function takes a predicate and a list and returns the first element in the list matching the predicate, or Nothing if there is no such element.
    //
    // ~~~haskell
    // find :: (a -> Bool) -> [a] -> Maybe a
    // find                    :: (a -> Bool) -> [a] -> Maybe a
    // find p                  =  listToMaybe . filter p
    // ~~~
    find: (list) => {
      var self = this;
      self.list.censor(list);
      return (predicate) => {
        expect(predicate).to.a('function');
        // return self.list.listToMaybe.call(self,
        //                                   self.list.filter.call(self,
        //                                                         list)(predicate));
        return self.compose.call(self,
                                 self.list.listToMaybe.bind(self))(self.flip.call(self,self.list.filter.bind(self))(predicate))(list);
      };
    },
    // list#zip :: List[T] => List[U] => Pair[T,U]
    //
    // c.f. "Thinking Functionally with Haskell",p.73
    //
    // ~~~haskell
    // zip (x:xs) (y:ys) = (x,y) : zip xs ys
    // zip _ _           = []
    // ~~~
    // or,
    // ~~~haskell
    // zip = zipWith mkPair
    // ~~~
    zip: function(list1){
      var self = this;
      self.list.censor(list1);
      return function(list2){
        self.list.censor(list2);
        if(self.list.isEmpty.bind(self)(list1)){
          return self.list.empty;
        }
        if(self.list.isEmpty.bind(self)(list2)){
          return self.list.empty;
        }
        var x = list1.head;
        var xs = list1.tail;
        var y = list2.head;
        var ys = list2.tail;
        var head = self.pair.mkPair.bind(self)(x)(y);
        var tail = self.list.zip.bind(self)(xs)(ys);
        return self.list.cons.bind(self)(head)(tail);
      };
    },
    // list.zipWith :: function => List[T] => List[U] => List[S]
    //
    // c.f. "Thinking Functionally with Haskell",p.73
    //
    // ~~~haskell
    // zipWith (x:xs) (y:ys) = f x y : zipWith f xs ys
    // zipWith _ _           = []
    // ~~~
    zipWith: function(fun){
      expect(fun).to.a('function');
      var self = this;
      return function(list1){
        self.list.censor(list1);
        return function(list2){
          self.list.censor(list2);
          if(self.list.isEmpty.bind(self)(list1)){
            return self.list.empty;
          }
          if(self.list.isEmpty.bind(self)(list2)){
            return self.list.empty;
          }
          var x = list1.head;
          var xs = list1.tail;
          var y = list2.head;
          var ys = list2.tail;
          return self.list.cons.bind(self)(fun(x)(y))(self.list.zipWith.bind(self)(fun)(xs)(ys));
        };
      };
    },
    // ~~~haskell
    // pairs :: [a ] → [(a, a)]
    // pairs xs = zip xs (tail xs)
    // ~~~
    pairs: function(list){
      var self = this;
      self.list.censor(list);
      return self.list.zip.bind(self)(list)(list.tail);
    },
    // toArray : List[T] => array
    toArray: function(list){
      var self = this;
      self.list.censor(list);
      if(self.list.isEmpty.bind(self)(list)){
        return [];
      } else {
        return self.cons.bind(self)(list.head)(self.list.toArray.bind(self)(list.tail));
      }
    },
    // ## list#take
    // take :: List => List
    take: function(list){
      var self = this;
      self.list.censor(list);
      return function(n) {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        if (n === 0) {
          return self.list.empty;
        } else {
          return self.list.cons.call(self,list.head)(self.list.take.call(self,list.tail)(n-1));
        }
      };
    },
    // ## list#drop
    // drop :: List => List
    drop: function(list){
      var self = this;
      self.list.censor(list);
      return function(n){
        expect(n).to.be.a('number');
        expect(n).to.be.greaterThan(-1);
        if (n === 0)
          return list;
        else {
          if(self.list.isEmpty.bind(self)(list))
            return self.list.empty;
          else {
            var tail = list.tail;
            return self.list.drop.bind(self)(tail)(n-1);
          }
        }
        // if (n === 0)
        //   return list;
        // else {
        //   if(self.list.isEmpty(list))
        //  return [];
        //   else {
        //  var tail = list.tail();
        //  return self.list.drop.bind(self)(tail)(n-1);
        //   }
        // }
      };
    },
    // ## list#length
    length: (list) => {
      var self = this;
      self.list.censor(list);
      if(self.list.isEmpty.bind(self)(list)){
        return 0;
      } else {
        return self.list.reduce.bind(self)(list)(0)(function(item){
          return function(accumulator){
            return 1 + accumulator;
          };
        });
      }
    },
    // ## list#init
    // init :: List => List
    init: function(list){
      var self = this;
      self.list.censor(list);
      var length = self.list.length.bind(self)(list);
      return self.list.take.bind(self)(list)(length-1);
      // var array = self.list.take.bind(self)(list)(length-1);
      // return self.list.mkList.bind(self)(array);
    },
    // ## list#last
    // last:: List[T] => T
    // ~~~haskell
    // last [x] = x
    // last (_:xs) = last xs
    // ~~~
    last: function(list){
      var self = this;
      self.list.censor(list);
      var length = self.list.length.bind(self)(list);
      expect(length).above(0);
      if(length === 1) {
        return list.head;
      } else {
        var rest = list.tail;
        return self.list.last.bind(self)(rest);
      }
      /* return self.compose(self.head)(self.reverse)(list); */
    },
    // ## list#intersperse
    // intersperse :: a -> [a] -> [a] Source
    //
    // The intersperse function takes an element and a list and `intersperses' that element between the elements of the list. For example,
    //
    // intersperse ',' "abcde" == "a,b,c,d,e"
    intersperse: function(any){
      return function(list){
        expect(list).to.an('array');
      };
    },
    // intercalate :: [a] -> [[a]] -> [a] Source
    // intercalate xs xss is equivalent to (concat (intersperse xs xss)). It inserts the list xs in between the lists in xss and concatenates the result.

    // transpose :: [[a]] -> [[a]] Source
    // The transpose function transposes the rows and columns of its argument. For example,
    // transpose [[1,2,3],[4,5,6]] == [[1,4],[2,5],[3,6]]   // tail:: [T] => [T]

    // subsequences :: [a] -> [[a]] Source
    //
    // The subsequences function returns the list of all subsequences of the argument.
    //
    // subsequences "abc" == ["","a","b","ab","c","ac","bc","abc"]

    // permutations :: [a] -> [[a]] Source
    //
    // The permutations function returns the list of all permutations of the argument.
    //
    // permutations "abc" == ["abc","bac","cba","bca","cab","acb"]

    // list.repeat
    // -- repeat x is an infinite list, with x the value of every element.
    // ~~~haskell
    // repeat           :: a -> [a]
    // repeat x         =  xs where xs = x:xs
    // ~~~
    //
    // ## list#replicate
    replicate: function(n){
      var self = this;
      expect(n).to.a('number');
      expect(n).to.be.greaterThan(-1);
      return function(any){
        return self.stream.take.bind(self)(self.stream.repeat.bind(self)(any))(n);
      };
    },
    // ## list#and
    // and :: List => Bool
    and: function(list){
      var self = this;
      self.list.censor(list);
      return self.list.reduce.bind(self)(list)(true)(function(item){
        return function(accumulator){
          return self.truthy(item) && accumulator;
        };
      });
    },
    // or :: List[Bool] => Bool
    or: function(list){
      var self = this;
      self.list.censor(list);
      return self.list.reduce.bind(self)(list)(false)(function(item){
        return function(accumulator){
          return self.truthy(item) || accumulator;
        };
      });
    },
    all: function(list){
      var self = this;
      self.list.censor(list);
      return function(predicate){
        expect(predicate).to.a('function');
        return self.compose.bind(self)(self.list.and.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
      };
    },
    any: function(list){
      var self = this;
      self.list.censor(list);
      return function(predicate){
        expect(predicate).to.a('function');
        return self.compose.bind(self)(self.list.or.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
      };
    },
    // elem: function(value){
    //   var self = this;
    //   return function(list){
    //  self.list.censor(list);

    //   };
    // }
    // c.f. "Thinking Functionally with Haskell",p.774
    // ~~~haskell
    // position           :: (Eq a) => a -> [a] -> Int
    // position x         =  head ([j | (j,y) <- zip [0..] xs, y==x] ++ [-1])
    // ~~~
    // position: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return function(any){

    //   });
    // },

    // sort :: List => List
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // sort [] = []
    // sort [x] = [x]
    // sort xs = merge (sort ys) (sort zs)
    //            where (ys, zs) = halve xs
    // ~~~
    sort: function(list) {
      var self = this;
      self.list.censor(list);
      var length = self.list.length.bind(self)(list);
      switch (length) {
      case 0:
        return list;
        break;
      case 1:
        return list;
        break;
      default:
        var halve = self.list.halve.bind(self)(list);
        return self.list.merge.bind(self)(self.list.sort.bind(self)(halve.left))(self.list.sort.bind(self)(halve.right));
        break;
      }
    },
    // ## list#halve
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // halve xs = (take n xs, drop n xs)
    //            where n = length xs `div` 2
    // ~~~
    halve: (list) => {
      var self = this;
      self.list.censor(list);
      var n = self.div(self.list.length.bind(self)(list))(2);
      var left = self.list.take.call(self,list)(n);
      var right = self.list.drop.call(self,list)(n);
      return self.pair.mkPair.call(self,left)(right);
    },
    // ## list#append
    //
    // ~~~haskell
    // append [] ys = ys
    // append (x:xs) ys = x:(xs `append` ys)
    //
    // append xs ys = foldr cons xs ys
    // ~~~
    append:(xs) => {
      var self = this;
      self.list.censor(xs);
      return function(ys){
        self.list.censor(ys);
        return self.list.foldr.call(self,xs)(ys)(self.list.cons.bind(self));
      };
    },
    // append:(listX) => {
    //   var self = this;
    //   self.list.censor(listX);
    //   return function(listY){
    //     self.list.censor(listY);
    //     if(self.list.isEmpty.bind(self)(listX)){
    //       return listY;
    //     }
    //     var x = listX.head;
    //     var xs = listX.tail;
    //     return self.list.cons.bind(self)(x)(self.list.append.bind(self)(xs)(listY));
    //   };
    // },
    // ## list#merge
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // merge [] ys = ys
    // merge xs [] = xs
    // merge (x:xs) (y:ys) =
    //    | x <= y = x:merge xs (y:ys)
    //    | otherwise = y:merge (x:xs) ys
    // ~~~
    merge: (listX) => {
      var self = this;
      self.list.censor(listX);
      return function(listY){
        self.list.censor(listY);
        if(self.list.isEmpty.bind(self)(listX)){
          return listY;
        }
        if(self.list.isEmpty.bind(self)(listY)){
          return listX;
        }
        var x = listX.head;
        var xs = listX.tail;
        var y = listY.head;
        var ys = listY.tail;
        if(x <= y){
          return self.list.cons.bind(self)(x)(self.list.merge.bind(self)(xs)(listY));
        } else {
          return self.list.cons.bind(self)(y)(self.list.merge.bind(self)(listX)(ys));
        }
      };
    },
    // ## list#unfold
    //  unfold builds a list from a seed value.
    // ~~~haskell
    // unfoldr :: (b -> Maybe (a, b)) -> b -> [a]
    //
    // unfold p h t seed | p seed      = []
    //                   |otherwise = h seed : unfold p h t (t seed)
    // ~~~
    //
    // ~~~scheme
    // (unfold p f g seed) =
    //    (if (p seed) (tail-gen seed)
    //        (cons (f seed)
    //              (unfold p f g (g seed))))
    // ~~~
    unfold: (until) => {    // Determines when to stop unfolding.
      var self = this;
      return (mapper) => { // Maps each seed value to the corresponding list element.
        return (next) => { // Maps each seed value to next seed value.
          return (seed) => {
            if(until.call(self,seed)) {
              return self.list.empty;
            } else {
              return self.list.cons.call(self, seed)(self.list.unfold.call(self, until)(mapper)(next)(next.call(self,seed)));
            }
          };
        };
      };
    },
  }, /* end of 'list' module */
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
  // 'stream' module
  // ==============
  //
  //  c.f. https://gist.github.com/kana/5344530
  //
  //  data Stream a = Cons a (Stream a) deriving (Eq, Ord)
  //
  stream: {
    force: (promise) => {
      var self = this;
      expect(promise).to.a('function');
      return promise();
    },
    censor: function(strm){
      var self = this;
      expect(strm).to.a('function');
      //expect(obj).to.an('array');
      var obj = self.stream.force.call(self,strm);

      expect(obj).to.have.property('type','stream');
      expect(obj).to.have.property('value');
      expect(obj).to.have.property('next');
      return strm;
    },
    // stream#empty
    empty: (_) => {
      return {
        type : 'stream',
        value : base.nothing,
        next : base.fail
      };
    },
    //empty: [],
    delay: (expressionAsFunction) => {
      var cache;
      var isEvaluated = false;
      expect(expressionAsFunction).to.a('function');
      return () => {
        if (!isEvaluated) {
          cache = expressionAsFunction();
          isEvaluated = true;
        }
        return cache;
      };
    },
    // stream#cons
    cons: (head) => {
      // expect(head).not.to.a('function');
      var self = this;
      return (tail) => {
        self.stream.censor.call(self,tail);
        // expect(tail).to.a('function');
        return self.stream.delay.call(self,(_) => {
          return {
            type : 'stream',
            value : head,
            next : self.stream.delay.call(self,(_) => {
              return tail();
            })
          };
        });
      };
    },
    mkStream: (array) => {
      expect(array).to.an('array');
      var self = this;
      if(array.length === 0){
        return self.stream.empty;
      } else {
        var head = self.head(array);
        var tail = self.stream.mkStream.call(self,self.tail(array));
        return self.stream.cons.call(self,head)(tail);
      }
    },
    head: (stream) => {
      var self = this;
      return self.compose.call(self,self.stream.force)(self.stream.censor)(stream).value;
      // return self.stream.censor.call(self,
      //                                self.stream.force.call(self,
      //                                                       stream)).value;
    },
    tail: (stream) => {
      var self = this;
      // return self.compose.call(self,self.stream.force)(self.stream.censor)(stream).next;
      return self.stream.force.call(self,
                                    self.stream.censor.call(self,stream)).next;

    },
    // ### stream#isEmpty
    isEmpty: (stream) => {
      var self = this;
      if(self.stream.head.call(self,stream) === base.nothing){
        return true;
      } else {
        return false;
      }
    },
    // ### stream#isEqual
    /* #@range_begin(stream_isEqual) */
    isEqual: (stream1) => {
      var self = this;
      self.stream.censor.call(self,stream1);
      return (stream2) => {
        self.stream.censor.call(self,stream2);
        var compare = (streamX, streamY) => {
          if(self.stream.isEmpty.call(self,streamX) && self.stream.isEmpty.call(self,streamY)){
            return true;
          } else {
            var x = self.stream.head.call(self,streamX);
            var y = self.stream.head.call(self,streamY);
            if(self.stream.isEmpty.call(self,streamX)){
              return false;
            }
            if(self.stream.isEmpty.call(self,streamY)){
              return false;
            }
            if(x === y) {
              var xs = self.stream.tail.call(self,streamX);
              var ys = self.stream.tail.call(self,streamY);
              return compare(xs,ys);
            } else {
              return false;
            }
          };
        };
        return compare(stream1,stream2);
      };
    },
    /* #@range_end(stream_isEqual) */
    // ### stream#at
    // stream.at :: Stream[A] => Int => A
    at: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (n) => {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        if (n === 0) {
          return self.stream.head.call(self,stream);
        } else {
          var tail = self.stream.tail.call(self,stream);
          return self.stream.at.call(self,
                                     tail)(n-1);
        }
      };
    },
    // ### stream#take
    // stream.take :: Stream[A] => Int => List[A]
    take: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (n) => {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        if(self.stream.isEmpty.call(self,stream)){
          return self.list.empty;
        } else {
          if (n === 0) {
            return self.list.empty;
          } else {
            var head = self.stream.head.call(self,stream);
            var tail = self.stream.tail.call(self,stream);
            return self.list.cons.call(self,head)(self.stream.take.call(self,tail)(n-1));
          }
        }
      };
    },
    // ### stream#zip
    // stream.zip :: Stream[T] => Stream[U] => Stream[Pair[T,U]]
    //
    // c.f. "Thinking Functionally with Haskell",p.73
    //
    // ~~~haskell
    // zip (x:xs) (y:ys) = (x,y) : zip xs ys
    // zip _ _           = []
    // ~~~
    zip: (stream1) => {
      var self = this;
      self.stream.censor.call(self,stream1);
      return (stream2) => {
        self.stream.censor.call(self,stream2);
        if(self.stream.isEmpty.call(self,stream1)){
          return self.stream.empty;
        }
        if(self.stream.isEmpty.call(self,stream2)){
          return self.stream.empty;
        }
        var x = self.stream.head.call(self,stream1);
        var xs = self.stream.tail.call(self,stream1);
        var y = self.stream.head.call(self,stream2);
        var ys = self.stream.tail.call(self,stream2);
        var head = self.pair.mkPair.call(self,x)(y);
        return self.stream.cons.call(self,head)(self.stream.zip.call(self,xs)(ys));
      };
    },
    // ### stream#from
    from:(n) => {
      expect(n).to.a('number');
      var self = this;
      return (step) => {
        return self.stream.unfold.call(self,n)((x) => {
          return self.monad.maybe.unit.call(self,self.pair.cons.call(self,x)(step(x)));
        });
      };
    },
    // ### stream#valueOption
    valueOption: (stream) => {
      var self = this;
      self.stream.censor(stream);
      if(self.stream.isEmpty(stream)){
        return base.nothing;
      } else {
        return self.monad.maybe.unit.bind(self)(stream.value());
      }
    },
    // ### stream#iterate
    /*
     'iterate' @f x@ returns an infinite list of repeated applicationsof @f@ to @x@:
     -- > iterate f x == [x, f x, f (f x), ...]

     ~~~haskell
     iterate :: (a -> a) -> a -> [a]
     iterate f x =  x : iterate f (f x)
     ~~~
     */
    iterate: (func) => {
      var self = this;
      expect(func).to.a('function');
      return (arg) => {
        return self.stream.delay.call(self,(_) => {
          var nextValue = func.call(self,arg);
          return {
            type : 'stream',
            value : arg,
            next : self.stream.iterate.call(self,
                                            func)(nextValue)
          };
        });
        // var tail =  (_) => {
        //   var nextValue = func.call(self,arg);
        //   return {
        //     type : 'stream',
        //     value : nextValue,
        //     next : self.stream.iterate.call(self,
        //                                     func)(nextValue)
        //   };
        // };
        // return self.stream.cons.call(self,
        //                              arg)(tail);
      };
    },

    // ### stream#unfold
    // stream.unfold :: A => (A => maybe[pair[B,A]]) => Stream[B]
    // ~~~scala
    // def unfold[A, B](start: B)(f: B => Option[Pair[A,B]]): Stream[A] = f(start) match {
    //    case Some((elem, next)) => elem #:: unfold(next)(f)
    //    case None => empty
    // }
    // ~~~
    unfold: (start) => {
      var self = this;
      return (fun) => { //  (A => maybe[pair[B,A]])
        expect(fun).to.a('function');
        var maybe = fun(start);
        self.monad.maybe.censor(maybe);
        if(self.existy(maybe.just)){
          var elem = maybe.just.left;
          //return self.stream.cons.call(self,elem)(self.stream.unfold.call(self,maybe.just.right)(fun));
          return self.stream.delay.call(self,(_) => {
            return {
              type : 'stream',
              value : elem,
              next : self.stream.unfold.call(self,maybe.just.right)(fun)
            };
            //self.stream.unfold.call(self,maybe.just.right)(fun);
            //return self.stream.cons.call(self,elem)(next);
          });
        } else {
          return self.stream.empty;
        }
      };
    },
    // ### stream#constant
    constant:(any) => {
      var self = this;
      return self.stream.unfold.call(self,any)((x) => {
        return self.monad.maybe.unit.call(self,self.pair.cons.call(self,x)(x));
      });
    },
    // ### stream#cycle
    // def cycle[T](a:Iterable[T]) = Stream.const(a).flatMap(v=>v)
    cycle: (list) => {
      var self = this;
      return self.stream.flatMap.call(self,self.stream.constant.call(self,list))((n) => {
        return n;
      });
    },
    // ### stream#repeat
    // repeat :: T => Stream[T]
    repeat: (any) => {
      var self = this;
      return self.stream.unfold.call(self,any)((n) => {
        return self.monad.maybe.unit.call(self,self.pair.cons.bind(self)(n)(n));
      });
    },
    // ### stream#reduce
    reduce: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (accumulator) => {
        return (glue) => {
          expect(glue).to.a('function');
          var item =  self.stream.head.call(self,stream);
          // var item = stream.value();
          if(self.stream.isEmpty.call(self,stream)) {
            return accumulator;
            //return glue(item)(accumulator);
          } else {
            var next = self.stream.tail.call(self,stream);
            // var next = stream.next();
            return glue(item)(self.stream.reduce.call(self,next)(accumulator)(glue));
          }
        };
      };
    },
    // ### stream#map
    map: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (transform) => {
        return self.stream.reduce.call(self,stream)(self.stream.empty)((item) => {
          return (accumulator) => {
            return self.stream.delay.call(self,(_) => {
              return {
                type : 'stream',
                value : transform(item),
                next : accumulator
              };
            });
            // var value = (_) => {
            //   return transform(item);
            // };
            // var tail = (_) => {
            //   return accumulator;
            // };
            // return self.stream.cons.bind(self)(value)(tail);
          };
        });
      };
    },
    // ### stream#append
    append: (stream1) => {
      var self = this;
      self.stream.censor.call(self,stream1);
      return function(stream2){
        self.stream.censor.call(self,stream2);
        if(self.stream.isEmpty.call(self,stream1)) {
          return stream2;
        }
        if(self.stream.isEmpty.call(self,stream2)) {
          return stream1;
        }
        var x = self.stream.head.call(self,stream1);
        var xs = self.stream.tail.call(self,stream1);
        return self.stream.cons.call(self,x)(self.stream.append.call(self,
                                                                     xs)(stream2));
      };
    },
    // ## stream#flatten
    flatten: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      if(self.stream.isEmpty.call(self,stream)){
        return self.stream.empty;
      } else {
        var head = self.stream.head.call(self,stream);
        //var head = self.stream.cons.call(self,self.stream.head.call(self,stream))(self.stream.empty);
        var tail = self.stream.tail.call(self,stream);
        // var tail = self.stream.delay.call(self,(_) => {
        //   return self.stream.tail.call(self,stream);
        // });
        return self.stream.append.call(self,head)(self.stream.flatten.call(self,tail));
        // return self.stream.append.call(self,stream.value())(self.stream.flatten.call(self,stream.next()));
      }

    },
    // ### stream#flatMap
    // ~~~haskell
    // flatMap xs f = flatten (map f xs)
    //~~~
    flatMap: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (transform) => {
        return self.stream.flatten.call(self,
                                        self.stream.map.call(self,
                                                             stream)(transform));
      };
    },
    // ### stream#scan
    //
    //  'scan' yields a stream of successive reduced values from:
    //
    // -- > scan f z [x1, x2, ...] == [z, z `f` x1, (z `f` x1) `f` x2, ...]
    // scan :: (a -> b -> a) -> a -> Stream b -> Stream a
    // scan f z ~(Cons x xs) =  z <:> scan f (f z x) xs
    //
    // (stream-scan + 0 (stream-from 1))
    // ⇒ (stream 0 1 3 6 10 15 …)
    // (stream-scan * 1 (stream-from 1))
    // ⇒ (stream 1 1 2 6 24 120 …)
    scan: (stream) => {
      var self = this;
      self.stream.censor(stream);
      return (accumulator) => {
        return (glue) => {
          expect(glue).to.a('function');
          var head = stream.value();
          if(self.stream.isEmpty.call(self,stream)) {
            return accumulator;
            //return glue(item)(accumulator);
          } else {
            var next = stream.next();

            //return glue(head)(self.stream.scan.call(self,next)(accumulator)(glue));
          }
        };
      };
    },
    // ### stream#exists
    exists: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (predicate) => {
        return self.stream.reduce.call(self,stream)(false)((item) => {
          return (accumulator) => {
            return accumulator || predicate(item);
          };
        });
      };
    },
    // ### stream#merge
    //
    // ~~~haskell
    // merge :: [T] => [T] => [T]
    // merge (x:xs) (y:ys) | x < y  = x:merge xs (y:ys)
    //                     | x == y  = x:merge xs ys
    //                     | x > y  = y:merge (x:xs) ys
    //~~~
    merge: (stream1) => {
      var self = this;
      self.stream.censor.call(self,stream1);
      return (stream2) => {
        self.stream.censor.call(self,stream2);
        if(self.stream.isEmpty.call(self,stream1))
          return stream2;
        if(self.stream.isEmpty.call(self,stream2))
          return stream1;
        var x = self.stream.head.call(self,stream1);
        var xs = self.stream.tail.call(self,stream1);
        // var x = stream1.value;
        // var xs = stream1.next;
        var y = self.stream.head.call(self,stream2);
        var ys = self.stream.tail.call(self,stream2);
        // var y = stream2.value;
        // var ys = stream2.next;
        if(x < y) {
          return self.stream.cons.call(self,x)(self.stream.merge.call(self,xs)(stream2));
        } else {
          if(x === y) {
            return self.stream.cons.call(self,x)(self.stream.merge.call(self, xs)(ys));
          } else {
            return self.stream.cons.call(self,y)(self.stream.merge.call(self,stream1)(ys));
          }
        };
      };
    },
    // ### stream#filter
    // ~~~haskell
    // filter :: (a -> Bool) -> [a] -> [a]
    // filter p []                 = []
    // filter p (x:xs) | p x       = x : filter p xs
    //                 | otherwise = filter p xs
    // ~~~
    filter: (stream) => {
      var self = this;
      self.stream.censor.call(self,stream);
      return (predicate) => {
        expect(predicate).to.a('function');
        if(self.stream.isEmpty.call(self,stream)){
          return stream;
        } else {
          var value = self.stream.head.call(self,stream);
          var next = self.stream.tail.call(self,stream);
          if(self.truthy(predicate(value))){
            var tail = self.stream.filter.call(self,next)(predicate);
            return self.stream.cons.call(self,value)(tail);
          } else {
            return self.stream.filter.call(self,next)(predicate);
          }
        }
      };
    }
  },  /* end of 'stream' module */
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
  // reduce
  /* #@range_begin(reduce) */
  reduce: (mappable) => {
    var self = this;
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        if(self.isEmpty.bind(self)(mappable)) {
          return accumulator;
        } else {
          var item = self.head.bind(self)(mappable);
          var rest = self.tail.bind(self)(mappable);
          return glue(item)(self.reduce.bind(self)(rest)(accumulator)(glue));
        }
      };
    };
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
  // map
  // map :: array => Fun => List
  /* #@range_begin(map) */
  map: (array) => {
    expect(array).to.an('array');
    var self = this;
    return (transform) => {
      return self.reduce.bind(self)(array)([])((item) => {
        return (accumulator) => {
          return self.cons.bind(self)(transform(item))(accumulator);
        };
      });
    };
  },
  /* #@range_end(map) */
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
  // takeWhile :: (Fun,[T]) => [T]
  takeWhile: function(list) {
    var self = this;
    expect(list).to.an('array');
    return function(fun){
      expect(fun).to.a('function');
      if(self.isEmpty(list)) {
        return [];
      } else {
        var head = self.head(list);
        var tail = self.tail(list);
        if( self.truthy(fun(head))) {
          return self.cons(head)((self.takeWhile.bind(self)(tail)(fun)));
        } else {
          return [];
        }
      }
    };
  },
  // dropWhile
  // dropWhile :: (T=>Bool,[T]) => [T]
  dropWhile: (array) => {
    expect(array).to.an('array');
    var self = this;
    return function(predicate){
      expect(predicate).to.a('function');
      if(self.truthy(self.isEmpty(array))){
        return [];
      } else {
        var head = self.head(array);
        var tail = self.tail(array);
        if(self.truthy(predicate(head))){
          return self.dropWhile.bind(self)(tail)(predicate);
        } else {
          return array;
        }
      }
    };
  },
  //
  // ~~~haskell
  // before x = takewhile (!= x)
  // ~~~
  //
  before: (x) => {
    var self = this;
    return (array) => {
      expect(array).to.an('array');
      var notEqual = (y) => {
        return x != y;
      };
      return self.takeWhile.bind(self)(array)(notEqual);
    };
  },
  //
  // ~~~haskell
  // after x = tail . dropWhile (!= x)
  // ~~~
  //
  after: (x) => {
    var self = this;
    var notEqual = (y) => {
      return x != y;
    };
    var flippedDropWhile = self.flip.bind(self)(self.dropWhile);
    return self.compose.bind(self)(self.tail)(flippedDropWhile(notEqual));
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
  // zip
  zip: function(listX){
    expect(listX).to.an('array');
    var self = this;
    return function(listY){
      expect(listX).to.an('array');
      if(self.isEmpty(listX)){
        return [];
      }
      if(self.isEmpty(listY)){
        return [];
      }
      var x = self.head(listX);
      var xs = self.tail(listX);
      var y = self.head(listY);
      var ys = self.tail(listY);
      return self.cons([x,y])(self.zip.bind(self)(xs)(ys));
    };
  },
  filter: function(array){
    expect(array).to.an('array');
    var self = this;
    return function(predicate){
      expect(predicate).to.a('function');
      if(self.isEmpty(array)){
        return [];
      } else {
        var x = self.head(array);
        var xs = self.tail(array);
        if(self.truthy(predicate(x))) {
          return self.cons(x)(self.filter.bind(self)(xs)(predicate));
        } else {
          return self.filter.bind(self)(xs)(predicate);
        }
      }
    };
  },
  // reverse :: [a] -> [a] Source
  // reverse xs returns the elements of xs in reverse order. xs must be finite.
  reverse: function(array){
    expect(array).to.an('array');
    return array.reduce((function(accumulator, item) {
      return [item].concat(accumulator);
    }), []);
  },
  // init = reverse . tail . reverse
  init: function(array){
    expect(array).to.an('array');
    expect(array).to.not.be.empty();
    var self = this;
    return self.compose(self.reverse)(self.compose(self.tail)(self.reverse))(array);
  },
  // snoc: function(value, array){
  //   return array.concat([value]);
  // },
  length: function(list){
    return list.length;
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
  times: (count) => {
    expect(count).to.be.a('number');
    expect(count).to.be.greaterThan(-1);
    var self = this;
    return (fun) => {
      expect(fun).to.a('function');
      return (memo) => {
        if (count === 0)
          return memo;
        else
          return self.times.call(self,count-1)(fun)(fun(memo));
      };
    };
  },
  // times: function(n, init, fun){
  //   return function(self){
  //     if (n === 1)
  //       return init;
  //     else
  //       return self.times(n-1, fun(init), fun);
  //   }(this);
  // },
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
  // 'string' module
  // ==============
  string: {
    mkString: function(string){
      return {
        type : 'string',
        head : self.string.head(string),
        tail : self.thunk(self.string.tail(string))
      };
    },
    head: function(string){
      expect(string).to.a('string');
      var self = this;
      expect(self.isNonEmpty(string)).to.be.ok();
      return string[0];
    },
    tail: function(string){
      expect(string).to.a('string');
      var self = this;
      expect(self.isNonEmpty(string)).to.be.ok();
      return string.substring(1);
    },
    toArray: function(string){
      expect(string).to.a('string');
      var self = this;
      var glue = function(item){
        return function(rest) {
          return [item].concat(rest);
        };
      };
      return self.reduce(string)([])(glue);
    }
  },
  // 'span' is kind of like takeWhile, only it returns a pair of lists. The first list
  // contains everything the resulting list from takeWhile would contain if it were
  // called with the same predicate and the same list. The second list contains the
  // part of the list that would have been dropped.
  // c.f. "Thinking Functionally with Haskell",p.774
  //
  // ~~~haskell
  // span :: (a -> Bool) -> [a] -> ([a],[a])
  // span p []            = ([],[])
  // span p xs@(x:xs')
  //          | p x       =  (x:ys,zs)
  //          | otherwise =  ([],xs)
  //                         where (ys,zs) = span p xs'
  // ~~~
  span: function(predicate){
    expect(predicate).to.a('function');
    var self = this;
    return function(list){
      /* expect(list).to.an('array'); */
      if(self.isEmpty(list)){
        return self.pair.mkPair.bind(self)([])([]);
      } else {
        var head = self.head(list);
        var tail = self.tail(list);
        /* expect(list).to.an('array'); */
        var rest = self.span.bind(self)(predicate)(tail);
        expect(rest).to.an('object');
        expect(rest["type"]).to.be('pair');
        if(self.truthy(predicate(head))){
          return self.pair.mkPair.bind(self)(
            self.cons(head)(rest.left)
          )(
            rest.right
          );
        } else {
          return self.pair.mkPair.bind(self)([])(list);
        }
      }
    };
  },
  // Synopsis
  // ========
  //
  // break, applied to a predicate p and a list xs, returns a tuple where first element is longest prefix (possibly empty) of xs of elements that do not satisfy p and second element is the remainder of the list:
  //
  // Definition
  // ==========
  //
  // ~~~haskell
  // break             :: (a -> Bool) -> [a] -> ([a],[a])
  // break p           =  span (not . p)
  // ~~~


  break: function(predicate){
    expect(predicate).to.a('function');
    var self = this;
    var not = function(x){
      return ! x;
    };
    return self.span.bind(self)(self.compose.bind(self)(self.not)(predicate));
    // return self.span.bind(self)(self.not(predicate));
    // return function(listLike){
    //   return self.span.bind(self)(self.not(predicate))(listLike);
    //   //return self.span.bind(self)(self.compose.bind(self)(not)(predicate))(listLike);
    // };
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
  lines: function(string) {
    expect(string).to.a('string');
    var self = this;
    if(self.isEmpty(string)){
      return [];
    } else {
      var isNewline = function(ch){
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
  // ## monad modle
  //
  // ~~~haskell
  // class  Monad m  where
  //     (>>=)   :: m a -> (a -> m b) -> m b
  //     (>>)    :: m a -> m b -> m b
  //     return  :: a -> m a
  //     fail    :: String -> m a
  //     m >> k  =  m >>= \_ -> k
  //     fail s  = error s
  // ~~~
  monad: {
    /*
    mkMonad: function(m){
      m.unit = function(g){
        return g(this());
      };
      m.join = function(){
      };
      m.fmap = function(){
      };
      m.bind = function(g){
        return g(this());
      };
      return m;
    },
     */
    // ## 'identity' monad
    // The Identity monad is a monad that does not embody any computational strategy.
    // It simply applies the bound function to its input without any modification.
    //
    // ~~~haskell
    // type M a = a
    // unit :: a -> I a
    // unit a = a
    // (>>=) :: M a -> (a -> M b) -> M b
    // a >>= k = k a
    // ~~~
    identity: {
      // ## identity#unit
      unit: (value) => {
        var self = this;
        return value;
      },
      flatMap: (instance) => {
        var self = this;
        return function(transform){
          expect(transform).to.a('function');
          return transform(instance);
        };
      }
    },
    writer: {
      unit: function(value){
        var self = this;
        return function(buffer){
          self.list.censor(buffer);
          var instance = {
            type: 'writer',
            value: value,
            buffer: buffer
          };
          return self.tap.call(self, instance)(function (target){
            Object.freeze(target);
          });
        };
      },
      flatMap: function(writer){
        var self = this;
        return function(transform){
          expect(transform).to.a('function');
          var result = transform(writer.value);
          return self.monad.writer.unit.bind(self)(result.value)(self.list.concat.bind(self)(writer.buffer)(result.buffer));
        };
      }
    },
    // ## maybe monad
    // ~~~haskell
    // (>>) :: Maybe a -> (a -> Maybe b) -> Maybe b
    // Nothing >> _ = Nothing
    // Just v  >> f = f v
    // ~~~
    maybe: {
      censor: function(obj){
        expect(obj).to.have.property('type','maybe');
        return obj;
      },
      nothing: {
        type: 'maybe',
        just: void(0)
      },
      unit: function(value){
        var self = this;
        var instance = self.existy(value) ? {
          type: 'maybe',
          just: value
        } : self.monad.maybe.nothing;
        return self.tap.call(self, instance)(function (target){
          Object.freeze(target);
        });
      },
      // getOrElse :: T => T
      // getOrElse: function(maybe){
      //   var self = this;
      //    self.monad.maybe.censor(maybe);
      //    self.monad.maybe.flatMap(maybe)(function(item){
      //    }
      // }
      // orElse :: maybe[T] => maybe[T]
      // filter :: fun[T => Bool] => maybe[T]
      //
      // maybe#map
      // map :: maybe[T] => fun[T => U] => maybe[U]
      map: function(maybe){
        var self = this;
        self.monad.maybe.censor(maybe);
        return function(transform){
          expect(transform).to.a('function');
          if(self.existy(maybe.just)){
            return self.monad.maybe.unit.bind(self)(transform(maybe.just));
          } else {
            return self.monad.maybe.nothing;
          }
        };
      },
      // maybe#flatMap
      flatMap: (instance) => {
        var self = this;
        self.monad.maybe.censor(instance);
        return function(transform){
          expect(transform).to.a('function');
          if(self.existy(instance.just)){
            return self.monad.maybe.censor.call(self,
                                                transform.call(self,
                                                               instance.just));
          } else {
            return self.monad.maybe.nothing;
          }
        };
      },
      // ## maybe#getOrElse
      getOrElse:(instance) => {
        var self = this;
        self.monad.maybe.censor(instance);
        return (alternative) => {
          if(self.existy(instance.just)){
            return instance.just;
          } else {
            return alternative;
          }
        };
      },
      //  maybe#lift
      lift: function(transform){
        var self = this;
        expect(transform).to.a('function');
        return function(maybe){
          self.monad.maybe.censor(maybe);
          return self.monad.maybe.map.bind(self)(maybe)(transform);
        };
      },
      // maybe#ap
      ap: (justFunction) => {
        var self = this;
        self.monad.maybe.censor(justFunction);
        return function(instance){
          return self.monad.maybe.flatMap.call(self, justFunction)(function(func){
            return self.monad.maybe.flatMap.call(self, instance)(function(x){
              return self.monad.maybe.unit.call(self, func(x));
            });
          });
        };
      },
      flatten: (instanceMM) => {
        var self = this;
        self.monad.maybe.censor.call(self, instanceMM);
        return self.monad.maybe.flatMap.call(self, instanceMM)(function(instanceM){
          return self.monad.maybe.censor.call(self, instanceM);
        });
      }
    }, /* end of 'maybe' monad */
    // ## either monad
    // ~~~haskell
    // data  Either a b  =  Left a | Right b
    // instance Functor (Either a) where
    //   fmap f (Right x) = Right (f x)
    //   fmap f (Left x) = Left x
    //
    // instance Monad (Either a b) where
    //   return x = Right x
    //   Right x >>= f = f x
    //   Left x >>= Left x
    // ~~~
    either: {
      unit: (value) => {
        var self = this;
        return self.monad.either.right.call(self, value);
      },
      censor: (instance) => {
        var self = this;
        return self.pair.censor.call(self,instance);
      },
      left: (value) => {
        var self = this;
        return self.pair.mkPair.bind(self)(value)(null);
      },
      right: (value) => {
        var self = this;
        return self.pair.mkPair.bind(self)(null)(value);
      },
      // either#map
      map: function(instance){
        var self = this;
        self.monad.either.censor(instance);
        return function(transform){
          expect(transform).to.a('function');
          if(self.existy(instance.right)){
            return self.monad.either.right.bind(self)(transform(instance.right));
          } else {
            return self.monad.either.left.bind(self)(transform(instance.left));
          }
        };
      },
      // either#flatMap
      flatMap: (instance) => {
        var self = this;
        self.monad.either.censor.call(self,instance);
        return (transform) => {
          expect(transform).to.a('function');
          if(self.existy(instance.right)){
            return self.monad.either.censor.call(self,
                                                 transform.call(self,
                                                                instance.right));
          } else {
            return instance;
          }
        };
      },
      bindM: (instance) => {
        var self = this;
        self.monad.either.censor.call(self,instance);
        return (transform) => {
          expect(transform).to.a('function');
          return self.monad.either.flatMap.call(self,instance)(transform);
        };
      }
    }, /* end of 'either' monad */
    random: {
      // ~~~scala
      // def unit[A](a:A) : Rand[A] =
      //   rng => (a, rng)
      // ~~~
      unit: (value) => {
        var self = this;
        return (rng) => {
          return self.pair.cons.bind(self)(value)(rng);
        };
      },
      // ~~~scala
      // def map[A,B](s:Rand[A])(f: A=>B) : Rand[B] =
      //   rng => {
      //     val (a, rng2) = s(rng)
      //     (f(a), rng2)
      // ~~~
      // def map[B](f: A => B): State[S, B] =
      //   flatMap(a => unit(f(a)))
      map: (s) => {
        var self = this;
        return (fun) => {
          return (rng) => {
            var pair = s(rng);
            var a = pair.left;
            var rng2 = pair.right;
            return self.pair.cons.bind(self)(fun(a))(rng2);
          };
        };
      },
      // ~~~scala
      // def map2[A,B,C](ra: Rand[A], rb: Rand[B])(f: (A, B) => C): Rand[C] =
      //   rng => {
      //     val (a, r1) = ra(rng)
      //     val (b, r2) = rb(r1)
      //     (f(a, b), r2)
      //   }
      // ~~~
      //
      // ~~~scala
      // def flatMap[A,B](f: Rand[A])(g: A => Rand[B]): Rand[B] =
      //   rng => {
      //     val (a, r1) = f(rng)
      //     g(a)(r1) // We pass the new state along
      //   }
      // ~~~

      flatMap: function(rand){
        expect(rand).to.a('function');
        var self = this;
        return function(transform){
          expect(transform).to.a('function');
          return function(rng){
            var pair = rand(rng);
            return transform(pair.left)(pair.right);
          };
        };
      },
      // random.int
      //
      // def int(rng:RNG): (Int,RNG)
      int: (rng) => {
        var self = this;
        var newRandomValue = rng();
        var rng2 = Random.engines.mt19937();
        var newRng = rng2.seed(newRandomValue);
        return self.monad.random.unit.bind(self)(newRandomValue)(newRng);
      },
      // random.ints
      //
      // ~~~scala
      // def ints(count: Int)(rng: RNG): (List[Int], RNG) =
      //   if (count == 0)
      //     (List(), rng)
      //   else {
      //     val (x, r1)  = rng.nextInt
      //     val (xs, r2) = ints(count - 1)(r1)
      //     (x :: xs, r2)
      //   }
      // ~~~
      ints: (count) => {
        expect(count).to.a('number');
        var self = this;
        return (rng) => {
          if(count === 0) {
            return self.pair.cons.bind(self)(self.list.empty)(rng);
          } else {
            var nextRandom = self.monad.random.int.bind(self)(rng);
            var restRandom = self.monad.random.ints.bind(self)(count -1)(nextRandom.right);
            return self.pair.cons.bind(self)(self.list.cons.bind(self)(nextRandom.left)(restRandom.left))(restRandom.right);
          }
          /* stream: Stream[Pair[Int,Rng]]*/
          // var stream = __.stream.unfold.bind(__)(rng)((rng) => {
          //    var randomValue = rng();
          //    return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(randomValue)(rng));
          // });
          // __.stream.take.bind(__)(count)
        };
      },
      double: (rng) => {
      },
      boolean: (rng) => {
        var self = this;
        return self.monad.random.unit.bind(self)(self.monad.random.int(rng) % 2)(rng);
      }
    },/* end of 'random' monad */
    // ## list monad
    // ~~~haskell
    // instance Monad [] where
    //   return x = [x]
    //   xs >>= f = concat (map f xs)
    //   fail _   = []
    // ~~~
    list:{
      // ### list#unit
      unit: (value) => {
        var self = this;
        return self.list.mkList.call(self,[value]);
      },
      // ### monad.list#flatten
      // ~~~haskell
      // flatten :: [[a]] -> [a]
      // flatten =  foldr (++) []
      // ~~~
      flatten: (instanceMM) => {
        var self = this;
        self.list.censor.call(self, instanceMM);
        return self.monad.list.flatMap.call(self, instanceMM)(function(instanceM){
          return self.list.censor.call(self, instanceM);
        });
      },
      // ### monad.list.map
      map: (instanceM) => {
        var self = this;
        self.list.censor(instanceM);
        return (transform) => {
          expect(transform).to.a('function');
          return self.list.reduce.call(self,
                                       instanceM)(self.list.empty)(function(item){
            return (accumulator) => {
              return self.list.cons.call(self,
                                         transform.call(self,
                                                        item))(accumulator);
            };
          });
        };
      },
      // ### monad.list#flatMap
      flatMap: (instanceM) => {
        var self = this;
        self.list.censor(instanceM);
        return (transform) => {
          expect(transform).to.a('function');
          return self.list.censor.call(self,
                                       self.list.join.call(self,
                                                           self.flip.call(self,
                                                                          self.monad.list.map.bind(self))(transform.bind(self))(instanceM)));
        };
      }
    },
    // ## stream monad
    //  c.f. https://patternsinfp.wordpress.com/2010/12/31/stream-monad/
    stream:{

    },
    // ## state monad
    // ~~~haskell
    // type State s a = s -> (a,s)
    //
    // unit :: a -> State s a
    // unit x s = (x,s)
    // ~~~
    //
    // c.f. https://wiki.haskell.org/State_Monad
    //
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
      // ### monad.state#unit
      //
      // unit :: a -> State s a
      // unit x s = (x,s)
      unit: (value) => {
        var self = this;
        return (stack) => {
          var instance = {
            type : 'state',
            value: value,
            state: stack
          };
          return self.freeze(instance);
        };
      },
      state:(value) => {
        var self = this;
        return (stack) => {
          return (runState) =>{
            var instance = {
              type : 'state',
              value: value,
              state: stack,
              run: runState
            };
            return self.freeze(instance);
          };
        };
      },
      censor: (obj) => {
        expect(obj).to.have.property('type','state');
        expect(obj).to.have.property('run');
        expect(obj.run).to.a('function');
        return obj;
      },
      // ### monad.state#flatMap
      // var bind = (operate, transform) => {
      //   return (stack) => {
      //     var newState = operate(stack);
      //     return transform(newState.value)(newState.stack);
      //   };
      // };
      flatMap: (instance) => {
        var self = this;
        //self.monad.state.censor.call(self, instance);
        return (transform) => { // s => State
          return (stack) => {
            expect(transform).to.a('function');
            var newState /* (a, s) */ = instance(stack);
            //self.monad.state.censor.call(self, newState);
            return transform(newState.value)(newState.right);
          };
        };
      },
      // flatMap: (state) => {
      //   var self = this;
      //   return (transform) => {
      //     expect(transform).to.a('function');
      //     return (s) => {
      //       var newStatePair = state.run(s);
      //       var newValue = newStatePair.left;
      //       var g = transform(newValue);
      //       return self.monad.state.censor.call(self,
      //                                           g(newStatePair.right));
      //       //return g(newStatePair.right);
      //     };
      //   };
      // },
      // ~~~haskell
      // get :: State s s
      // get s = (s,s)
      // ~~~
      // ~~~scala
      // def get[S]: State[S,S] = State(s => (s,s))
      // ~~~
      get: function(state){
        var self = this;
        return self.monad.unit.bind(self)(state)(state);
        //return self.pair.cons(state)(state);
      },
      //
      // put :: s -> State s ()
      // put x s = ((),x)
      put: function(value){
        var self = this;
        return function(state){
          return self.monad.unit.bind(self)(state)(state);
        };
      },
      // ## IO monad
      //
      // c.f.
      //
      // map : IO[A](fn: A -> B): IO[B]
      // flatMap : IO[A](fn: A -> IO[B]): IO[B]
      //
      // flatMap : IO a -> (a -> IO b) -> IO b
      //
      IO: {
      }
    }
  }
};
