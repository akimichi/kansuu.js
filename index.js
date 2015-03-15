"use strict";

var expect = require('expect.js');

module.exports = {
  id: function(any){
	return any;
  },
  op: {
	"&" : function(x){
	  return function(y) { return x && y; };
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
  // op: {
  // 	"+" : function(x,y) { return x + y; },
  // 	"-" : function(x,y) { return x - y; },
  // 	"*" : function(x,y) { return x * y; },
  // 	"/" : function(x,y) { return x / y; },
  // 	"!" : function(x) { return !x; }
  // },
  tap: function(target) {
    var original = target;
    return function doSideEffect(sideEffect) {
      sideEffect(target);
      expect(original).to.eql(target);
      return target;
    };
  },
  // tap: function(target, sideEffect) {
  // 	sideEffect(target);
  // 	return target;
  // },
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
  andify: function(predicateA){
	expect(predicateA).to.a('function');
	var self = this;
	return function(predicateB){
	  expect(predicateB).to.a('function');
	  return function applyAnd(any) {
		return self.op['&'].bind(self)(predicateA(any))(predicateB(any));
		//return predicateA(any) || predicateB(any);
	  };
	};
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
  compose: function(latter){
	var self = this;
	return function(former){
	  return function(arg){
  		return latter.call(self, former.call(self, arg));
	  };
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
	  // return function (array){
	  // 	expect(array).to.an('array');
	  // 	return [value].concat(array);
	  // };
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
  },
  // end of 'math' module
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
  negate: function(fun){
	return function applyNegate(n) {
	  return - fun(n);
	};
  },
  add: function(x){
	return function (y) {
	  return x + y;
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
  }
};


  // bind: function(fun, context){
  //   return function(){
  //     return fun.apply(context, arguments);
  // 	  //return fun.call(context, args);
  // 	};
  // },

  // FLIP: function(fun) {
  // 	return function (first) {
  // 	  return function (second) {
  // 		return fun.call(this, second, first);
  // 	  };
  // 	};
  // },
  // flip: function(fun) {
  // 	return function flipped(x,y){
  // 	  return fun.call(this, y,x);
  // 	};
  // },

  // take: function(n, list){
  // 	return function(self){
  // 	  if (n === 0)
  // 		return [];
  // 	  else {
  // 		if(self.isEmpty(list))
  // 		  return [];
  // 		else {
  // 		  var head = self.head(list);
  // 		  var tail = self.tail(list);
  // 		  return self.cons(head, self.take(n-1,tail));
  // 		}
  // 	  }
  // 	}(this);
  // },
  // drop: function(n, list){
  // 	return function(self){
  // 	  if (n === 0)
  // 		return list;
  // 	  else {
  // 		if(self.isEmpty(list))
  // 		  return [];
  // 		else {
  // 		  var tail = self.tail(list);
  // 		  return self.drop(n-1,tail);
  // 		}
  // 	  }
  // 	}(this);
  // },

  // head :: [T] => T
  // head: function(array){
  //   //@demand [@isArray(ary), ary.length > 0]
  //   return array[0];
  // },
  // // tail :: [T] => [T]
  // tail: function(array){
  //   //@demand [@isArray(ary)], "argument should be array, but a #{@typeOf ary}"
  //   //@demand [ary.length > 0], "argument should have more than 1 element"
  //   return array.slice(1,array.length);
  // },
  // last: function(list){
  // 	return function(self){
  //     return self.compose(self.head, self.reverse)(list)
  // 	}(this);
  // 	// return array[array.length - 1];
  //   // return this.compose(this.head, this.reverse)(list)
  // },
  // init = reverse . tail . reverse
  // init: function(list){
  // 	return function(self){
  //     return self.compose(self.reverse, self.compose(self.tail, self.reverse))(list)
  // 	}(this);
  // },

  // reverse: function(list){
  //   return list.reduce((function(accumulator, item) {
  //     return [item].concat(accumulator);
  //   }), []);
  // },

  // cons :: (T,[T]) => [T]
  // cons: function(value, array){
  // 	this.demand([this.beArray(array)]);
  //   return [value].concat(array);
  // },
  // snoc :: (T,[T]) => [T]
