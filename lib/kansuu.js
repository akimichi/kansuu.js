"use strict";

var expect = require('expect.js');
var base = require('../lib/kansuu-base.js');

module.exports = {
  id: function(any){
    return any;
  },
  not: function(any){
    return ! any;
    /* return !predicate(any); */
  },
  and: function(predicate1){
    var self = this;
    return function(predicate2){
      return predicate1 && predicate2;
    };
  },
  or: function(predicate1){
    var self = this;
    return function(predicate2){
      return predicate1 || predicate2;
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
  divide: function(n1){
    return function(n2){
      return n1 / n2;
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
  typeOf: function(obj) {
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
  tap: function(target) {
    var self = this;
    var original = target;
    return function doSideEffect(sideEffect) {
      sideEffect(target);
      expect(original).to.eql(target);
      return target;
    };
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
  //
  // pair module
  //
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
    censor: function(obj){
      expect(obj).to.have.property('type','pair');
      expect(obj).to.have.property('left');
      expect(obj).to.have.property('right');
      return obj;
    },
	// pair.cons
    cons: function(left){
      return function(right){
        var pair = {
          type : 'pair',
          left : left,
          right : right
        };
        Object.freeze(pair);
        return pair;
      };
    },
    mkPair: function(left){
      var self = this;
      return function(right){
        return self.pair.cons.bind(self)(left)(right);
      };
    },
    left: function(pair){
      var self = this;
      return self.plucker.bind(self)("left")(pair);
    },
    right: function(pair){
      var self = this;
      return self.plucker.bind(self)("right")(pair);
    },
    swap: function(pair){
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
  drop: function(array){
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
  splitAt: function(array){
    expect(array).to.an('array');
    var self = this;
    return function(n){
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
    empty: {
      type : 'list',
      head : base.nothing,
      tail : base.nothing
    },
	/* #@range_end(list_empty) */
    // list.isEmpty
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
    // list.cons
    // cons :: T => List[T] => List
	/* #@range_begin(list_cons) */
    cons: function(any){
      var self = this;
      return function(list){
        self.list.censor.bind(self)(list);
        var obj = {
          //self: self.list,
          type: 'list',
          head: any,
          tail: list,
          isEqual: function(list){
            self.list.censor(list);
            return self.list.isEqual.bind(self)(obj)(list);
          }
        };
        Object.freeze(obj);
        return obj;
      };
    },
	/* #@range_end(list_cons) */
    tail: function(list){
      var self = this;
      self.list.censor(list);
      return list.tail;
    },
    // list.mkList
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
    // snoc :: T => List => List
    snoc: function(any){
      var self = this;
      return function(list){
        self.list.censor(list);
        return self.list.concat.bind(self)(list)(self.list.mkList.bind(self)([any]));
      };
    },
    // list.join
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
    // list.concat
    //
    // concat :: List => List => List
    // concat :: List a -> List a -> List a
    // concat Nil ys = ys
    // concat (Cons x xs) ys = Cons x (cat xs ys)
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
    /*
    concat: function(list1){
      var self = this;
      self.list.censor(list1);
      return function(list2){
        self.list.censor(list2);
        if(self.list.isEmpty(list1)){
          return list2;
        } else {
          var x = list1.head;
          var xs = list1.tail();
          return self.list.cons.bind(self)(x)(self.list.concat.bind(self)(xs)(list2));
        }
      };
    },
     */
    // list.reduce
	/* #@range_begin(list_reduce) */
    reduce: function(list){
      var self = this;
      self.list.censor(list);
      expect(self.list.isEmpty.bind(self)(list)).to.not.be(true);
      return function(accumulator){
        return function(glue){
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
    // list.foldl
    // ~~~haskell
    // foldl :: (a → b → a) → a → [b ] → a
    // foldl _ v [ ] = v
    // foldl f v (x : xs) =foldl f (f v x) xs
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
    // list.reverse
    // ~~~haskell
    // reverse :: List => List
    // reverse = foldr (\xs -> x:xs) []
    // ~~~
    reverse: function(list){
      var self = this;
      self.list.censor(list);
      if(self.list.isEmpty.bind(self)(list)){
        return list;
      } else {
        return self.list.snoc.bind(self)(list.head)(self.list.reverse.bind(self)(list.tail));
        // return self.list.reduce.bind(self)(list)(self.list.empty)(function(xs){
        //   return function(x){
        //  return self.list.cons.bind(self)(x)(xs);
        //   };
        // });
      }
    },
    // list.flatMap
    // flatMap :: List[T] => (T => List[S]) => List[S]

    // ~~~haskell
    // instance Monad [] where
    //   return x = [x]
    //   xs >>= f = join (map f xs) 
    // ~~~
    flatMap: function(list){
      var self = this;
      self.list.censor(list);
      return function(transform){
        expect(transform).to.a('function');
        return self.list.join.bind(self)(self.list.map.bind(self)(list)(transform));
      };
    },
    // list.map
    // map :: List => fun => Bool
	/* #@range_begin(list_map) */
    map: function(list){
      var self = this;
      self.list.censor(list);
      return function(fun){
        expect(fun).to.a('function');
        return self.list.reduce.bind(self)(list)(self.list.empty)(function(item){
          return function(accumulator){
            return self.list.cons.bind(self)(fun.call(self,item))(accumulator);
          };
        });
      };
    },
	/* #@range_end(list_map) */
    //
	// list.filter
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
    // list.zip :: List[T] => List[U] => Pair[T,U]
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
    // take :: List => List
    take: function(list){
      var self = this;
      self.list.censor(list);
      return function(n) {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        if (n === 0) {
          return self.list.empty;
          //return [];
        } else {
          return self.list.cons.bind(self)(list.head)(self.list.take.bind(self)(list.tail)(n-1));
        }
      };
    },
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
    length: function(list){
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
    // init :: List => List
    init: function(list){
      var self = this;
      self.list.censor(list);
      var length = self.list.length.bind(self)(list);
      return self.list.take.bind(self)(list)(length-1);
      // var array = self.list.take.bind(self)(list)(length-1);
      // return self.list.mkList.bind(self)(array);
    },
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
    // list.replicate
    replicate: function(n){
      var self = this;
      expect(n).to.a('number');
      expect(n).to.be.greaterThan(-1);
      return function(any){
        return self.stream.take.bind(self)(self.stream.repeat.bind(self)(any))(n);
      };
    },
    // list.and
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
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // halve xs = (take n xs, drop n xs)
    //            where n = length xs `div` 2
    // ~~~
    halve: function(list){
      var self = this;
      self.list.censor(list);
      var n = Math.floor(self.list.length.bind(self)(list) / 2);
      var left = self.list.take.bind(self)(list)(n);
      var right = self.list.drop.bind(self)(list)(n);
      return self.pair.mkPair.bind(self)(left)(right);
    },
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // merge [] ys = ys
    // merge xs [] = xs
    // merge (x:xs) (y:ys) = 
    //    | x <= y = x:merge xs (y:ys)
    //    | otherwise = y:merge (x:xs) ys
    // ~~~
    merge: function(listX) {
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
    } /* end of mkList */
  }, /* end of 'list' module */
  // 'stream' module
  //  ==============
  //
  //  c.f. https://gist.github.com/kana/5344530
  //
  stream: {
    censor: function(obj){
      expect(obj).to.have.property('type','stream');
      expect(obj).to.have.property('value');
      expect(obj).to.have.property('next');
      return obj;
    },
    // stream.empty
    empty: {
      type : 'stream',
      value : function(){
		return base.nothing;
	  },
      next : base.fail
    },
	// stream.cons
    cons: (head) => {
      expect(head).to.a('function');
      var self = this;
      return (tail) => {
        expect(tail).to.a('function');
        var obj = {
          // self: self.stream,
          type: 'stream',
          value: head,
          next : tail
        };
        Object.freeze(obj);
        return obj;
      };
    },
    mkStream: (array) => {
      expect(array).to.an('array');
      var self = this;
      if(array.length === 0){
        return self.stream.empty;
      } else {
		var head = base.thunk(self.head(array));
		var tail = base.thunk(self.stream.mkStream.bind(self)(self.tail(array)));
        return self.stream.cons.bind(self)(head)(tail);
      }
    },
    // mkStream: function(init){
    //   var self = this;
    //   return function(subsequent){
    //     return self.stream.cons.bind(self)(base.thunk(init))(subsequent);
	// 	/* return self.stream.cons.bind(self)(function(){ return init; })(subsequent); */
    //   };
    // },
    isEmpty: (stream) => {
      if(stream.value() === base.nothing){
        return true;
      } else {
        return false;
      }
    },
	/* #@range_begin(stream_isEqual) */
	// stream.isEqual
    isEqual: (stream1) => {
      var self = this;
      self.stream.censor(stream1);
      return (stream2) => {
        self.stream.censor(stream2);
        var zipped = self.stream.zip.bind(self)(stream1)(stream2);
        return self.stream.reduce.bind(self)(zipped)(true)(function(pair){
		  //if(pair.
		  //self.pair.censor(pair);
          return function(accumulator){
            return accumulator && (pair.left === pair.right);
          };
        });
      };
    },
	/* #@range_end(stream_isEqual) */
	// stream.valueOption
	valueOption: (stream) => {
      var self = this;
      self.stream.censor(stream);
	  if(self.stream.isEmpty(stream)){
		return base.nothing;
	  } else {
		return self.monad.maybe.unit.bind(self)(stream.value());
	  }
	},
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
      self.stream.censor(stream1);
      return (stream2) => {
        self.stream.censor(stream2);
        if(self.stream.isEmpty.bind(self)(stream1)){
          return self.stream.empty;
        }
        if(self.stream.isEmpty.bind(self)(stream2)){
          return self.stream.empty;
        }
        var x = stream1.value;
        var xs = stream1.next;
        var y = stream2.value;
        var ys = stream2.next;
        var head = function(){
		  return self.pair.mkPair.bind(self)(x())(y());
		};
        return self.stream.cons.bind(self)(head)(function(){
		  return self.stream.zip.bind(self)(xs())(ys());
		});
      };
    },
	// stream.take :: Stream[A] => Int => List[A]
    take: (stream) => {
      var self = this;
      self.stream.censor(stream);
      return function(n) {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
		if(self.stream.isEmpty.bind(self)(stream)){
		  return self.list.empty;
		} else {
          if (n === 0) {
			return self.list.empty;
          } else {
			var nextStream = stream.next();
			return self.list.cons.bind(self)(stream.value())(self.stream.take.bind(self)(nextStream)(n-1));
          }
		}
      };
    },
	// stream.unfold :: A => (A => maybe[pair[B,A]]) => Stream[B]
	// ~~~scala
	// def unfold[A, B](start: B)(f: B => Option[Pair[A,B]]): Stream[A] = f(start) match {
	//    case Some((elem, next)) => elem #:: unfold(next)(f)
	//    case None => empty
	// }
	// ~~~
	unfold: (start) => {
	  var self = this;
	  return (fun) => { /* (A => maybe[pair[B,A]]) */
        expect(fun).to.a('function');
		var maybe = fun(start);
		self.monad.maybe.censor(maybe);
        if(self.existy(maybe.just)){
		  var elem = ((_) => {
			return maybe.just.left;
		  });
		  var next = ((_) => {
			return self.stream.unfold.bind(self)(maybe.just.right)(fun);
		  });
		  var stream = self.stream.cons.bind(self)(elem)(next);
		  return stream;
        } else {
		  return self.stream.empty;
        }
	  };
	},
	/*
	// stream.sequence
	sequence: (any) => {
	  var self = this;
	  return function(step){
        expect(step).to.a('function');
		var head = function(){
		  return any;
		};
		var tail = function(){
		  return self.stream.sequence.bind(self)(step(any))(step);
		};
		return self.stream.cons.bind(self)(head)(tail);
      };
	},
	 */
    // stream.repeat
	// repeat :: T => Stream[T]
    repeat: (any) => {
      var self = this;
	  return self.stream.unfold.bind(self)(any)((n) => {
		return self.monad.maybe.unit.bind(self)(self.pair.cons.bind(self)(n)(n));
	  });
	  //return self.stream.sequence.bind(self)(any)(base.id);
    },
	// stream.map
	map: (stream) => {
      var self = this;
	  return (transform) => {
		return self.stream.reduce.bind(self)(stream)(self.stream.empty)((item) => {
		  return (accumulator) => {
			var value = (_) => {
			  return transform(item);
			};
			var tail = (_) => {
			  return accumulator;
			};
			return self.stream.cons.bind(self)(value)(tail);
		  };
		});
	  };
	},
    // stream.reduce
    reduce: (stream) => {
      var self = this;
      self.stream.censor(stream);
      return function(accumulator){
        return function(glue){
          expect(glue).to.a('function');
          var item = stream.value();
          if(self.stream.isEmpty.bind(self)(stream)) {
			return accumulator;
            //return glue(item)(accumulator);
          } else {
			var next = stream.next();
            return glue(item)(self.stream.reduce.bind(self)(next)(accumulator)(glue));
          }
        };
      };
    },
	// stream.exists
    exists: (stream) => {
      var self = this;
      self.stream.censor(stream);
      return function(predicate){
        return self.stream.reduce.bind(self)(stream)(false)(function(item){
          return function(accumulator){
            return accumulator || predicate(item);
          };
        });
      };
      // return (predicate) => {
      //   return self.stream.reduce.bind(self)(stream)(false)((item) => {
      //     ((accumulator) => {
	  // 		return accumulator || predicate(item);
	  // 	  });
      //   });
      // };
    },
	// stream.merge
	// ~~~haskell
	// merge :: [T] => [T] => [T]
	// merge (x:xs) (y:ys) | x < y  = x:merge xs (y:ys)
    //                     | x == y  = x:merge xs ys
    //                     | x > y  = y:merge (x:xs) ys
	//~~~
	merge: (stream1) => {
      var self = this;
      self.stream.censor(stream1);
	  return function(stream2){
		self.stream.censor(stream2);
		var x = stream1.value;
		var xs = stream1.next;
		var y = stream2.value;
		var ys = stream2.next;
		if(x() < y()) {
		  return self.stream.cons.bind(self)(x)(function(){
			return self.stream.merge.bind(self)(xs())(stream2);
		  });
		} else {
		  if(x() === y()) {
			return self.stream.cons.bind(self)(x)(function(){
			  return self.stream.merge.bind(self)(xs())(ys());
			});
		  } else {
			return self.stream.cons.bind(self)(y)(function(){
			  return self.stream.merge.bind(self)(stream1)(ys());
			});
			
		  }
		};
	  };
	},
	// stream.filter
	// ~~~haskell
	// filter :: (a -> Bool) -> [a] -> [a]
	// filter p []                 = []
	// filter p (x:xs) | p x       = x : filter p xs
	//                 | otherwise = filter p xs
	// ~~~
    filter: (stream) => {
      var self = this;
      self.stream.censor(stream);
      return function(predicate){
        expect(predicate).to.a('function');
		if(self.stream.isEmpty.bind(self)(stream)){
		  return stream;
		} else {
		  var value = stream.value;
		  var next = stream.next;
		  if(self.truthy(predicate(value()))){
			var tail = function(){
			  return self.stream.filter.bind(self)(next())(predicate);
			};
			return self.stream.cons.bind(self)(value)(tail);
		  } else {
			return self.stream.filter.bind(self)(next())(predicate);
		  }
		}
      };
    },
    /*
    // next: function (n) {
    //   var self = this;
    //   return function(subsequent){
    //  expect(subsequent).to.a('function');
    //  return self.stream.cons.bind(self)(n, self.stream.delay.bind(self)(function() {
    //    return self.stream.next.bind(self)(subsequent(n))(subsequent);
    //  }));
    //   };
    // },
    // head: function(stream) {
    //   return stream[0];
    // },
    // tail: function(stream) {
    //   var self = this;
    //   return self.stream.force.bind(self)(stream[1]);
    // },
    // delay: function(lazyFun) {
    //   expect(lazyFun).to.a('function');
    //   var self = this;
    //   var result;
    //   var isEvaluated = false;
    //   return function () {
    //  if (!isEvaluated)
    //    result = lazyFun.bind(self)();
    //  return result;
    //   };
    // },
    // force: function(promise) {
    //   expect(promise).to.a('function');
    //   var self = this;
    //   return promise.bind(self)();
    // },
    // cons: function(car, cdr) {
    //   return [car, cdr];
    // },
    // // take:: Stream => Int => List
    // take: function(stream){
    //   var self = this;
    //   return function(n){
    //  expect(n).to.be.a('number');
    //  expect(n).to.be.greaterThan(-1);
    //  if (n === 0) {
    //    return [];
    //  } else {
    //    var head = self.stream.head.bind(self)(stream);
    //    var tail = self.stream.tail.bind(self)(stream);
    //    return self.list.cons.bind(self)(head)(self.stream.take.bind(self)(tail)(n-1));
    //  }
    //   };
    // }
     */
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
  // 
  // math module
  //
  //
  math: {
    times: function(n1){
      expect(n1).to.a('number');
      return function(n2){
        return n1 * n2;
      };
    },
    signum: function(n){
      expect(n).to.a('number');
      if(n < 0){
        return -1;
      } else {
        if(n === 0){
          return 0;
        } else {
          return 1;
        }
      }
    },
    /*
    // lower: function(n){
    //   expect(n).to.a('number');
    //   var self = this;
    //   return self.until.bind(self)(self.math.geq.bind(self)(n))(self.math.times.bind(self)(2))(-1);
    // },
     */
    leq: function(n1){
      expect(n1).to.a('number');
      var self = this;
      return function(n2){
        expect(n2).to.a('number');
        return (n1 < n2) || (n1 == n2);
        /*
        //return self.or.bind(self)(self.op['<'].bind(self)(n1)(n2))(self.op['=='].bind(self)(n1)(n2));
        //return self.orify.bind(self)(self.op['<'].bind(self)(n1)(n2))(self.op['=='].bind(self)(n1)(n2));
        */
      };
    },
    geq: function(n1){
      expect(n1).to.a('number');
      var self = this;
      return function(n2){
        expect(n2).to.a('number');
        return (n1 > n2) || (n1 == n2);
      };
    },
    isEqual: function(n1){
      expect(n1).to.a('number');
      return function(n2){
        expect(n2).to.a('number');
        return n2 === n1;
      };
    },
    isLessThan: function(n1){
      expect(n1).to.a('number');
      return function(n2){
        expect(n2).to.a('number');
        return n2 < n1;
      };
    },
    isMoreThan: function(n1){
      expect(n1).to.a('number');
      return function(n2){
        expect(n2).to.a('number');
        return n2 > n1;
      };
    },
    isPrime: function(n){
      expect(n).to.a('number');
      if (n == 1 || n == 2) {
        return true;
      }
      for (var i=2; i<n; i++) {
        if (n % i == 0) {
          return false;
        }
      }
      return true;
    },
    configureFunction: function(improve){
      expect(improve).to.a('function');
      return function(good_enough){
        expect(improve).to.a('function');
        return function(precision){
          expect(precision).to.a('number');
          return {
            improve : improve,
            good_enough : good_enough
          };
        };
      };
    },
    configureSqrt: function(precision){
      expect(precision).to.a('number');
      return {
        improve : function(n) {
          expect(n).to.a('number');
          return function improveGuess(guess){
            expect(guess).to.a('number');
            return (guess + (n / guess)) / 2.0;
          };    
        },
        good_enough : function(guess) {
          expect(guess).to.a('number');
          return function isGoodEnough(n){
            expect(n).to.a('number');
            return Math.abs(guess * guess - n) < precision;
          };
        }
      };
    },
    mkApproximate: function(config) {
      expect(config).to.an('object');
      var self = this;
      return function(n) {
        expect(n).to.a('number');
        var iterate = function(guess) {
          expect(guess).to.a('number');
          if (config.good_enough(guess)(n)) {
            return guess;
          } else {
            var improvedGuess = config.improve(n)(guess);
            expect(improvedGuess).to.a('number');
            return iterate(improvedGuess);
          }
        };
        return iterate;
      };
    },
    improve_sqrt: function(n) {
      expect(n).to.a('number');
      return function(guess){
        expect(guess).to.a('number');
        return (guess + (n / guess)) / 2.0;
      };
    },
    good_enough_sqrt: function(precision){
      expect(precision).to.a('number');
      return function(guess) {
        expect(guess).to.a('number');
        return function(n){
          expect(n).to.a('number');
          return Math.abs(guess * guess - n) < precision;
        };
      };
    },
    approximate: function(improve) {
      expect(improve).to.a('function');
      var self = this;
      return function(precision){
        return function(n) {
          expect(n).to.a('number');
          var iterate = function(guess) {
            expect(guess).to.a('number');
            if (self.math.good_enough_sqrt(precision)(guess)(n)) {
              return guess;
            } else {
              var newGuess = improve(n)(guess);
              expect(newGuess).to.a('number');
              return iterate(newGuess);
            }
          };
          return iterate;
        };
      };
    }
  }, /* end of 'math' module */
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
      return mappable.slice(1,mappable.length);;
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
    expect(list).to.an('array');
    var self = this;
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
  //dropWhile :: (T=>Bool,[T]) => [T]
  dropWhile: function(list){
    expect(list).to.an('array');
    var self = this;
    return function(predicate){
      expect(predicate).to.a('function');
      if(self.truthy(self.isEmpty(list))){
        return [];
      } else {
        var head = self.head(list);
        var tail = self.tail(list);
        if(self.truthy(predicate(head))){
          return self.dropWhile.bind(self)(tail)(predicate);
        } else {
          return list;
        }
      }
    };
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
  times: function(n, init, fun){
    return function(self){
      if (n === 1)
        return init;
      else
        return self.times(n-1, fun(init), fun);
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
  // string module
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
  state:{
    mkState: function(value){
      var self = this;
      return function(state){
        var instance = {
          type : 'state',
          run: function(s){
            return self.pair.cons(value)(state);
          }
        };
        Object.freeze(instance);
        return instance;
      };
    }
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
    // ~~~haskell
    // type M a = a
    // unit :: a -> I a
    // unit a = a
    // (>>=) :: M a -> (a -> M b) -> M b
    // a >>= k = k a
    // ~~~
    id: {
      unit: function(value){
        var self = this;
        return value;
      },
      flatMap: function(id){
        var self = this;
        return function(transform){
          expect(transform).to.a('function');
          return transform(id);
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
          Object.freeze(instance);
          return instance;
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
    // ~~~haskell
    // data  Either a b  =  Left a | Right b   deriving (Eq, Ord, Read, Show)
    // either               :: (a -> c) -> (b -> c) -> Either a b -> c
    // either f g (Left x)  =  f x
    // either f g (Right y) =  g y
    // ~~~
    either: {
      left: function(value){
        var self = this;
        return self.pair.mkPair.bind(self)(value)(null);
      },
      right: function(value){
        var self = this;
        return self.pair.mkPair.bind(self)(null)(value);
      }
    },
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
        Object.freeze(instance);
        return instance;
      },
      flatMap: function(maybe){
        var self = this;
        self.monad.maybe.censor(maybe);
        return function(transform){
          expect(transform).to.a('function');
          if(self.existy(maybe.just)){
            return transform(maybe.just);
            //return self.monad.maybe.censor(transform(maybe.just));
          } else {
            return self.monad.maybe.nothing;
            //return self.monad.maybe.censor(self.monad.maybe.nothing);
          }
        };
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
      // map :: fun[T => U] => maybe[U]
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
      lift: function(transform){
        var self = this;
        expect(transform).to.a('function');
        return function(maybe){
          self.monad.maybe.censor(maybe);
          return self.monad.maybe.map.bind(self)(maybe)(transform);
        };
      }
    },
    /*
    list:{
      unit: function(value){
        var self = this;
        return self.list.mkList([value]);
      },
      bind: function(list){
        var self = this;
        return function(fun){
          self.list.map(list)(fun);
          return self.list.concat()();
        };
      }
      // flatMap: function(list){
      //    var self = this;
      //    self.list.censor(list);
      //    return function(fun){
      //      expect(fun).to.a('function');
      //      return self.list.concat(self.list.map)();
      //    }
      // },
    },
    */
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
    state :{
      // return :: a -> State s a
      // return x s = (x,s)
      unit: function(value){
        var self = this;
        var instance = {
          type : 'state',
          run: function(s){
            return self.pair.cons(value)(s);
          }
        };
        Object.freeze(instance);
        return instance;
      },
      censor: function(obj){
        expect(obj).to.have.property('type','state');
        return obj;
      },
      flatMap: function(state){
        var self = this;
        return function(transform){
          expect(transform).to.a('function');
          return function(s){
            var newStatePair = state.run(s);
            var newValue = newStatePair.left;
            var g = transform(newValue);
            return g(newStatePair.right);
          };
        };
      },
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
    }
  }
};


