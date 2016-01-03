(function(exports) {
  "use strict";

  // math functions
  // =============================
  //
  var __ = require('../lib/kansuu.js');
  var expect = require('expect.js');
  var hasProp = {}.hasOwnProperty;
  var self = {
	succ: (n) => {
      expect(n).to.a('number');
      return n + 1;
	},
	prev: (n) => {
      expect(n).to.a('number');
      return n - 1;
	},
	// is:: FUNC[ANY -> BOOL] -> ANY -> BOOL
	is: (predicate) => {
      expect(predicate).to.a('function');
      return (target) => {
		return __.truthy(predicate(target));
      };
	},
	// eq:: ANY -> ANY -> BOOL
	eq: (x,y) => {
	  return x === y;
	},
    greater: (n) => {
      return (m) => {
        return n < m;
      };
    },
	smaller: (n) => {
	  return __.flip(self.greater)(n);
	},
	not: (predicate) => {
	  expect(predicate).to.a('function');
	  return (target) => {
	    return ! self.is(predicate)(target);
	  };
	},
	remainder: (n) => {
	  return (m) => {
		return n % m;
	  };
	},
	multiplyOf: (n) => {
	  expect(n).to.a('number');
	  return (m) => {
		expect(m).to.a('number');
		return self.eq(self.remainder(m)(n), 0);
	  };
	},
	// even:: NUM -> BOOL
	even: (n) => {
	  return self.multiplyOf(2);
	},
	// even: ((self) => {
	//   return self.multiplyOf(2);
	// })(self),
	// odd:: NUM -> BOOL
	odd: (n) => {
	  return self.not(self.even);
	},
	leastDivisor: (n) => {
	  expect(n).to.a('number');
	  var leastDivisorHelper = (k, n) => {
	    expect(k).to.a('number');
	    expect(n).to.a('number');
	    if(self.multiplyOf(k)(n)) {
	      return k;
	    } else {
	      if(self.is(self.greater(n))(k * k)) {
	        return n;
	      } else {
	        return leastDivisorHelper(k+1, n);
	      }
	    };
	  };
	  return leastDivisorHelper(2,n);
	},
	// isPrime:: Int -> Bool
	// ~~~haskell
	// prime :: Integer -> Bool
	// prime n | n < 1 = error "not a positive number"
	//         | n == 1 = False
	//         | otherwise = leastDivisor n == n
	// ~~~
	isPrime: (n) => {
	  if(n < 1) {
	    return new Error("argument not positive");
	  }
	  if(n === 1) {
	    return false;
	  } else {
	    return self.leastDivisor(n)  === n ;
	  }
	},
	/*
	  c.f. Haskell Road, p.19
	  ~~~haskell
	  factors :: Integer -> [Integer]
	  factors n | n < 1 = error "argument not positive"
	  | n == 1 = []
	  | otherwise = p : factors (div n p) where p = ld n
	  ~~~
	*/
	factors: (n) => {
	  if(n < 1) {
	    return new Error("argument not positive");
	  }
	  if(n === 1) {
	    return __.monad.list.empty();
	  } else {
	    var leastDivisorOfN = self.leastDivisor(n);
	    return __.monad.list.cons(leastDivisorOfN, self.factors(n / leastDivisorOfN));
	  }
	},
    // ## Vector example
    vector: {
      unit: (alist) => {
        return (index) => {
          return __.monad.list.at.call(self, alist)(index);
        };
      },
      // zero: self.unit(__.monad.list.fromArray.call(self,[0,0])),
      add: (vs) => {
        return (ws) => {
          return (index) => {
            return self.monad.maybeMonad.flatMap.call(self, vs(index))((v) => {
              return self.monad.maybeMonad.flatMap.call(self, ws(index))((w) => {
                return v + w;
              });
            });
            // return vs(index) + ws(index);
          };
        };
      },
      // innerProduct: (vs) => {
      //   return (ws) => {
      //     return 
      //   };
      // }
    }
  }; // end of 'self'


  module.exports = self;

})(module.exports);
