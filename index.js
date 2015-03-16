"use strict";

var expect = require('expect.js');

module.exports = {

  id: function(any){
	return any;
  },
  not: function(predicate){
	return function applyNot(x) {
	  return !predicate(x);
	};
  },
  and: function(predicate1, predicate2){
	return function applyAnd(arg) {
	  return predicate1(arg) && predicate2(arg);
	};
  },
  or: function(predicate1, predicate2){
	return function applyOr(arg) {
	  return predicate1(arg) || predicate2(arg);
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
		//return predicateA(any) || predicateB(any);
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
		//return predicateA(any) || predicateB(any);
	  };
	};
  },
  op: {
	"&" : function(n1){
	  return function(n2) { 
		return n1 && n2;
	  };
	},
	"|" : function(x){
	  return function(y) { return x || y; };
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
	}
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
    return this.not(this.truthy)(any);
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
  // uncurry: function(fun,arg){
  //   return fun(arg);
  // },
  compose: function(fun1){
	expect(fun1).to.a('function');
	var self = this;
	return function(fun2){
	  expect(fun2).to.a('function');
	  return function(arg){
		//return fun1.call(self, fun2.call(self, arguments));
  		return fun1.call(self, fun2.call(self, arg));
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
  pair: {
	mkPair: function(left){
	  return function(right){
		return {
		  type : 'pair',
		  left : left,
		  right : right
		};
	  };
	},
	left: function(pair){
	  var self = this;
	  return self.get("left")(pair);
	},
	right: function(pair){
	  var self = this;
	  return self.get("right")(pair);
	},
  },
  list: {
	// last:: [T] => T
	last: function(list){
	  expect(list).to.an('array');
	  expect(list).to.not.be.empty();
	  var self = this;
	  return self.compose(self.list.head)(self.list.reverse)(list);
	  // return array[array.length - 1];
      // return this.compose(this.head, this.reverse)(list)
	},
	// init = reverse . tail . reverse
	init: function(list){
	  expect(list).to.an('array');
	  expect(list).to.not.be.empty();
	  var self = this;
	  return self.compose(self.list.reverse)(self.compose(self.list.tail)(self.list.reverse))(list);
	},
	// head:: [T] => T
	head: function(array){
	  expect(array).to.an('array');
	  expect(array).to.not.be.empty();
      return array[0];
	},
	reverse: function(list){
	  expect(list).to.an('array');
      return list.reduce((function(accumulator, item) {
		return [item].concat(accumulator);
      }), []);
	},
	// cons:: (T)([T]) => [T]
	cons: function(value){
	  var self = this;
	  return function (array){
		expect(array).to.an('array');
		return [value].concat(array);
		// return self.tap.bind(self)([value].concat(array), function(result){
	    //   expect(result).to.an('array');
		//   return result;
		// });
	  };
	},
	// tail:: [T] => [T]
	tail: function(array){
	  expect(array).to.an('array');
	  expect(array).to.not.be.empty();
      return array.slice(1,array.length);
	},
	// append :: ([T])([T]) => [T]
	append: function(xs){
	  expect(xs).to.an('array');
	  return function(ys){
		expect(ys).to.an('array');
		return xs.concat(ys);
	  };
	},
	// take:: ([T])(n) => [T]
	take: function(list){
	  expect(list).to.an('array');
	  var self = this;
	  return function(n){
		expect(n).to.be.a('number');
		expect(n).to.be.greaterThan(-1);
		if (n === 0)
		  return [];
		else {
		  if(self.isEmpty(list)) {
			return [];
		  } else {
			var head = self.list.head(list);
			var tail = self.list.tail(list);
			return self.list.cons(head)(self.list.take.bind(self)(tail)(n-1));
		  }
		}
	  };
	},
	drop: function(list){
	  expect(list).to.an('array');
	  var self = this;
	  return function(n){
		expect(n).to.be.a('number');
		expect(n).to.be.greaterThan(-1);
		if (n === 0)
		  return list;
		else {
		  if(self.isEmpty(list))
			return [];
		  else {
			var tail = self.list.tail(list);
			return self.list.drop.bind(self)(tail)(n-1);
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
		  var x = self.list.head(list);
		  var xs = self.list.tail(list);
		  return self.list.cons(fun(x))(self.list.map.bind(self)(xs)(fun));
		}
	  };
	},
	/*
	 • Split a list at the nth element:
	 splitAt :: Int → [a ] → ([a ], [a ])
	 splitAt n xs = (take n xs, drop n xs)
	 */
	splitAt: function(list){
	  expect(list).to.an('array');
	  var self = this;
	  return function(n){
		expect(n).to.a('number');
		return [self.list.take.bind(self)(list)(n), self.list.drop.bind(self)(list)(n)];
	  };
	},
	// takeWhile :: (Fun,[T]) => [T]
	takeWhile: function(list) {
	  expect(list).to.an('array');
	  var self = this;
	  return function(fun){
		expect(fun).to.a('function');
		if(self.isEmpty(list)) {
		  return [];
		} else {
		  var head = self.list.head(list);
		  var tail = self.list.tail(list);
		  if( self.truthy(fun(head))) {
			return self.list.cons(head)((self.list.takeWhile.bind(self)(tail)(fun)));
		  } else {
			return [];
		  }
		}
	  };
	},
	// takeWhile : function(pred, gen, continues){
	//   return function(self){
	// 	var current = gen();
	// 	if (pred(current))
	// 	  return self.takeWhile(pred, gen, function(t0){
	// 		return continues(self.cons(current, t0));
	// 	  });
	// 	else
	// 	  return continues([]);
	//   }(this);
	// },
	//dropWhile :: (T=>Bool,[T]) => [T]
	dropWhile: function(list){
	  expect(list).to.an('array');
	  var self = this;
	  return function(predicate){
		expect(predicate).to.a('function');
		if(self.truthy(self.isEmpty(list))){
		  return [];
		} else {
		  var head = self.list.head(list);
		  var tail = self.list.tail(list);
		  if(self.truthy(predicate(head))){
			return self.list.dropWhile.bind(self)(tail)(predicate);
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
		var x = self.list.head(listX);
		var xs = self.list.tail(listX);
		var y = self.list.head(listY);
		var ys = self.list.tail(listY);
		return self.list.cons([x,y])(self.list.zip.bind(self)(xs)(ys));
	  };
	},
	filter: function(list){
	  expect(list).to.an('array');
	  var self = this;
	  return function(predicate){
		expect(predicate).to.a('function');
		if(self.isEmpty(list)){
		  return [];
		} else {
		  var x = self.list.head(list);
		  var xs = self.list.tail(list);
		  if(self.truthy(predicate(x))) {
			return self.list.cons(x)(self.list.filter.bind(self)(xs)(predicate));
		  } else {
			return self.list.filter.bind(self)(xs)(predicate);
		  }
		}
	  };
	},
  },
  // end of 'list' module
  /*
   * math module
   *
   */
  math: {
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
		  //var config = {};
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
  reduce: function(array, glue, accumulator){
  	return function(self){
	  if(self.isEmpty(array)) {
		return accumulator;
	  } else {
		return glue(self.head(array), self.reduce(self.tail(array), glue, accumulator));
	  }
  	}(this);
  },
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
   * List
   */
  snoc: function(value, array){
    return array.concat([value]);
  }, 
  // append :: ([T],[T]) => [T]
  // append: function(xs, ys){
  //   return xs.concat(ys);
  // },
  length: function(list){
    return list.length;
  },
  // map: function(mappable, fun){
  //   if (this.isEmpty(mappable)) {
  //     return [];
  //   } else {
  //     var x = this.head(mappable);
  //     var xs = this.tail(mappable);
  //     return this.cons(fun(x), this.map(xs,fun));
  // 	}
  // },
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
		  return self.tap(current, function(the_current){
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
	  return obj[key];
	};
  },
  until: function(condition){
	return function(self){
      return function(fun){
		if(self.falsy(condition)) {
          fun();
          return self.until(condition)(fun);
		}
	  };
	}(this);
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
	  expect(list).to.an('array');
	  if(self.isEmpty(list)){
		return self.pair.mkPair([])([]);
	  } else {
		var head = self.list.head(list);
		var tail = self.list.tail(list);
		expect(list).to.an('array');
		var rest = self.span.bind(self)(predicate)(tail);
		expect(rest).to.an('object');
		expect(rest["type"]).to.be('pair');
		if(self.truthy(predicate(head))){
		  return self.pair.mkPair(
			self.list.cons(head)(rest.left)
		  )(
			rest.right
		  );
		} else {
		  return self.pair.mkPair([])(rest.left);
		}
	  }
	};
  },
  // ~~~haskell
  // break             :: (a -> Bool) -> [a] -> ([a],[a])
  // break p           =  span (not . p)
  // ~~~
  break: function(predicate){
	expect(predicate).to.a('function');
	var self = this;
	return self.span(self.compose(self.not)(predicate));
  }
  // ~~~haskell
  // words            :: String -> [String]
  // words s          =  case dropWhile Char.isSpace s of
  //                     "" -> []
  //                     s' -> w : words s''
  //                          where (w, s'') = break Char.isSpace s'
  // ~~~
};


