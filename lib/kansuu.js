"use strict";

var expect = require('expect.js');

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
    /* return this.not(this.truthy)(any); */
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
    mkPair: function(left){
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
    left: function(pair){
      var self = this;
      return self.get.bind(self)("left")(pair);
    },
    right: function(pair){
      var self = this;
      return self.get.bind(self)("right")(pair);
    },
    swap: function(pair){
      var self = this;
      return self.pair.mkPair(pair.right)(pair.left);
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
  list: {
    censor: function(obj){
      expect(obj).to.have.property('type','list');
      expect(obj).to.have.property('head');
      expect(obj).to.have.property('tail');
      return obj;
    },
    nil: {
      type : 'list',
      head : null,
      tail : function(){
        return null;
      }
    },
    isNil: function(list){
      if(list.head == null && list.tail() == null){
        return true;
      } else {
        return false;
      }
    },
    // cons :: T => List[T] => List
    cons: function(any){
      var self = this;
      return function(list){
        self.list.censor.bind(self)(list);
        var obj = {
          self: self.list,
          type: 'list',
          head: any,
          tail: function(_){
            return list;
          }
        };
        Object.freeze(obj);
        return obj;
      };
    },
    snoc: function(any){
      var self = this;
      return function(list){
        self.list.censor(list);
        return self.list.concat.bind(self)(list)(self.list.mkList.bind(self)([any]));
      };
    },
    map: function(list){
      var self = this;
      self.list.censor(list);
      return function(fun){
        expect(fun).to.a('function');
        return self.list.reduce.bind(self)(list)(self.list.nil)(function(item){
          return function(accumulator){
            return self.list.cons.bind(self)(fun.call(self,item))(accumulator);
          };
        });
      };
    },
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
        var reversed =  self.list.reduce.bind(self)(list)(self.list.nil)(function(item){
		  return function(accumulator){
			if(self.truthy(predicate(item))) {
			  //return self.list.concat.bind(self)(self.list.mkList.bind(self)([item])(accumulator));
			  return self.list.snoc.bind(self)(item)(accumulator);
			} else {
			  return accumulator;
			}
          };
        });
		return self.list.reverse.bind(self)(reversed);
      };
    },
	// toArray : List[T] => array
	toArray: function(list){
      var self = this;
      self.list.censor(list);
	  var length = self.list.length.bind(self)(list);
      expect(length).to.a('number');
	  return self.list.take.bind(self)(list)(length);
    },
    reduce: function(list){
      var self = this;
      self.list.censor(list);
      return function(accumulator){
        return function(glue){
          expect(glue).to.a('function');
          var item = list.head;
          var tail = list.tail.bind(self)();
          if(self.list.isNil(tail)) {
            return glue(item)(accumulator);
          } else {
            return glue(item)(self.list.reduce.bind(self)(tail)(accumulator)(glue));
          }
        };
      };
    },
    // reverse :: List => List
    reverse: function(list){
      var self = this;
      self.list.censor(list);
      if(self.list.isNil(list)){
        return list;
      } else {
        return self.list.snoc.bind(self)(list.head)(self.list.reverse.bind(self)(list.tail()));
      }
    },
    // concat :: List => List => List
    concat: function(list1){
      var self = this;
      self.list.censor(list1);
      return function(list2){
        self.list.censor(list2);
        if(self.list.isNil(list1)){
          return list2;
        } else {
          var x = list1.head;
          var xs = list1.tail();
          return self.list.cons.bind(self)(x)(self.list.concat.bind(self)(xs)(list2));
        }
      };
    },
    // take :: List => array
    take: function(list){
      var self = this;
      self.list.censor(list);
      return function(n) {
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        if (n === 0) {
          return [];
        } else {
          return [list.head].concat(self.list.take.bind(self)(list.tail.bind(self)())(n-1));
        }
      };
    },
    length: function(list){
      var self = this;
      self.list.censor(list);
      return self.list.reduce.bind(self)(list)(0)(function(item){
        return function(accumulator){
          return 1 + accumulator;
        };
      });
    },
    // init :: List => List
    init: function(list){
      var self = this;
      self.list.censor(list);
      var length = self.list.length.bind(self)(list);
      var array = self.list.take.bind(self)(list)(length-1);
      return self.list.mkList.bind(self)(array);
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
        var rest = list.tail();
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

    // -- repeat x is an infinite list, with x the value of every element.
    // ~~~haskell
    // repeat           :: a -> [a]
    // repeat x         =  xs where xs = x:xs
    // ~~~
    repeat: function(any){
      var self = this;
      var tail = function(){
        return self.repeat(any);
      };
      return self.list.cons(any)(self.repeat(any));
    },
    mkList: function(array){
      expect(array).to.an('array');
      //expect(array.length).to.above(0);
      var self = this;
      if(array.length === 1){
        return self.list.cons.bind(self)(self.head(array))(self.list.nil);
      } else {
        return self.list.cons.bind(self)(self.head(array))(self.list.mkList.bind(self)(self.tail(array)));
      }
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
    mkStream: function(initial){
      var self = this;
      var take = function(stream){
        return function(n) {
          expect(n).to.a('number');
          expect(n).to.be.greaterThan(-1);
          if (n === 0) {
            return [];
          } else {
            var nextStream = stream.next();
            return [stream.value].concat(take.bind(self)(nextStream)(n-1));
          }
        };
      };
      return function(subsequent){
        expect(subsequent).to.a('function');
        var stream = {
          type : 'stream',
          value : initial,
          next : function(){
            return self.stream.mkStream.bind(self)(subsequent(initial))(subsequent);
          },
          take : function(n){
            return take.bind(self)(stream)(n);
          }
        };
        Object.freeze(stream);
        return stream;
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
  reduce: function(mappable){
    var self = this;
    return function(accumulator){
      return function(glue){
        expect(glue).to.a('function');
        if(self.isEmpty(mappable)) {
          return accumulator;
        } else {
          var item = self.head.bind(self)(mappable);
          var rest = self.tail.bind(self)(mappable);
          return glue(item)(self.reduce.bind(self)(rest)(accumulator)(glue));
        }
      };
    };
  },
  /*
  // reduce: function(array, glue, accumulator){
  //    return function(self){
  //      if(self.isEmpty(array)) {
  //        return accumulator;
  //      } else {
  //        return glue(self.head(array), self.reduce(self.tail(array), glue, accumulator));
  //      }
  //    }(this);
  // },
   */
  foldr: function(op, init, array) {
    return function(context){
      if (context.isEmpty(array)) {
        return init;
      } else {
        var head = context.head(array);
        return op(head, context.foldr(op, init, array));
      }
    }(this);
  },
  /*
   * Array
   */
  // cons:: (T)([T]) => [T]
  cons: function(value){
    var self = this;
    return function (array){
      expect(array).to.an('array');
      return [value].concat(array);
    };
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
  map: function(list){
    expect(list).to.an('array');
    var self = this;
    return function(fun){
      expect(fun).to.a('function');
      if (self.isEmpty(list)) {
        return [];
      } else {
        var x = self.head(list);
        var xs = self.tail(list);
        return self.cons(fun(x))(self.map.bind(self)(xs)(fun));
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
  snoc: function(value, array){
    return array.concat([value]);
  },
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
  get: function(key){
    return function(obj){
      expect(obj).to.an('object');
      expect(obj).to.have.property(key);
      return obj[key];
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
  head: function(mappable){
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
  tail: function(mappable){
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
        return self.pair.mkPair([])([]);
      } else {
        var head = self.head(list);
        var tail = self.tail(list);
        /* expect(list).to.an('array'); */
        var rest = self.span.bind(self)(predicate)(tail);
        expect(rest).to.an('object');
        expect(rest["type"]).to.be('pair');
        if(self.truthy(predicate(head))){
          return self.pair.mkPair(
            self.cons(head)(rest.left)
          )(
            rest.right
          );
        } else {
          return self.pair.mkPair([])(list);
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
  }
  // ~~~haskell
  // words            :: String -> [String]
  // words s          =  case dropWhile Char.isSpace s of
  //                     "" -> []
  //                     s' -> w : words s''
  //                          where (w, s'') = break Char.isSpace s'
  // ~~~
};


