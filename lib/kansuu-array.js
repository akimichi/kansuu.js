"use strict";

const expect = require('expect.js');
var __ = require('./kansuu.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');


// 'arrays' module
// ==============

const array = {
  empty: [],
  isEmpty: (anArray) => {
    expect(anArray).to.an('array');
    return (anArray.length === 0);
  },
  // cons:: (T)([T]) => [T]
  cons : (value, anArray) => {
    expect(anArray).to.an('array');
    return [value].concat(anArray);
  },
  snoc: (value, anArray) => {
    return array.concat(anArray,[value]);
  },
  push: (anArray, value) => {
    return array.snoc(value, anArray);
  },
  head : (anArray) => {
    expect(anArray).to.an('array');
    return anArray[0];
  },
  tail: (anArray) => {
    expect(anArray).to.an('array');
    // expect(anArray.length).to.be.greaterThan(0);
    return anArray.slice(1, anArray.length);
  },
  concat: (array1, array2) => {
    expect(array1).to.an('array');
    expect(array2).to.an('array');
    // return [...array1, ...array2];
    return array1.concat(array2);
  },
  // ## Array#join
  // join :: [[a]] -> [a]
  // join = foldr append empty
  join: (anArray) => {
    return array.reduce(anArray)([])(item => {
      return (accumulator) => {
        return array.concat(item, accumulator);
      };
    });
    // return array.foldr([])(item => {
    //   console.log(item)
    //   return (accumulator) => {
    //     console.log(accumulator)
    //     return array.concat(item, accumulator);
    //   };
    // });
    // __ = require('./kansuu.js');
    // return array.reduce(anArray)([])(__.curry(array.concat));
  },
  // ## Array#and
  // and :: [Bool] -> Bool
  // and = foldr (&&) false
  and: (anArray) => {
    return array.reduce(anArray)(true)(__.and);
  },
  // ## Array#or
  // or :: [Bool] -> Bool
  // or = foldr (||) false
  or: (anArray) => {
    return array.reduce(anArray)(false)(__.or);
  },
  // ## Array#all
  // all :: (a -> Bool) -> [a] -> Bool
  // all = and . map p 
  all:  (anArray) => {
    return (predicate) => {
      return __.compose(array.and, __.flip(array.map)(predicate))(anArray)
    };
  },
  // ## Array#any
  // any :: (a -> Bool) -> [a] -> Bool
  // any = or . map p 
  any : (anArray) => {
    return (predicate) => {
      return __.compose(array.or, __.flip(array.map)(predicate))(anArray)
    };
  },
  elem: (anArray) => {
    return (x) => {
      if(array.isEmpty(anArray)){
        return false;
      } else {
        if(array.head(anArray) === x) {
          return true;
        } else {
          return array.elem(array.tail(anArray))(x);
        }
      }
    };
  },
  // take:: ([T])(n) => [T]
  take: (anArray) => {
    expect(anArray).to.an('array');
    return (n) => {
      expect(n).to.be.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0)
        return [];
      else {
        if(array.isEmpty(anArray) === true) {
          return array.empty;
        } else {
          return array.cons(array.head(anArray), array.take(array.tail(anArray))(n-1));
        }
      }
    };
  },
  // drop
  drop: (anArray) => {
    expect(anArray).to.an('array');
    return (n) => {
      expect(n).to.be.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0)
        return anArray;
      else {
        if(array.isEmpty(anArray) === true)
          return [];
        else {
          return array.drop(array.tail(anArray))(n-1);
        }
      }
    };
  },
  // reverse :: [a] -> [a] Source
  // reverse xs returns the elements of xs in reverse order. xs must be finite.
  reverse: (anArray) => {
    expect(anArray).to.an('array');
    const __ = require('./kansuu.js');
    const snoc = __.curry(array.snoc);
    // con snoc = (value) => {
    //   return (anArray) => {
    //     return array.concat(anArray,[value]);
    //   };
    // };
    return array.foldr(anArray)(array.empty)(snoc);
    // return anArray.reduce(((accumulator, item) => {
    //   return [item].concat(accumulator);
    // }), []);
  },
  // init = reverse . tail . reverse
  init: (anArray) => {
    __ = require('./kansuu.js');
    expect(anArray).to.an('array');
    expect(anArray).to.not.be.empty();
    return __.compose(array.reverse,__.compose(array.tail,array.reverse))(anArray);
  },
  length: (array) => {
    return array.length;
  },
  // Split an array at the nth element:
  // ~~~haskell
  // splitAt :: Int → [a ] → ([a ], [a ])
  // splitAt n xs = (take n xs, drop n xs)
  // ~~~
  splitAt: (anArray) => {
    expect(anArray).to.an('array');
    return (n) => {
      expect(n).to.a('number');
      return [array.take(anArray)(n), array.drop(anArray)(n)];
    };
  },

  // takeWhile :: (Fun,[T]) => [T]
  takeWhile: (anArray) => {
    expect(anArray).to.an('array');
    return (predicate) => {
      expect(predicate).to.a('function');
      if(array.isEmpty(anArray) === true) {
        return [];
      } else {
        if(predicate(array.head(anArray)) === true) {
          return array.cons(array.head(anArray), array.takeWhile(array.tail(anArray))(predicate));
        } else {
          return [];
        }
      }
    };
  },
  // dropWhile
  // dropWhile :: (T=>Bool,[T]) => [T]
  dropWhile: (anArray) => {
    expect(anArray).to.an('array');
    return (predicate) => {
      expect(predicate).to.a('function');
      if(array.isEmpty(anArray) === true){
        return [];
      } else {
        if(predicate(array.head(anArray)) === true ){
          return array.dropWhile(array.tail(anArray))(predicate);
        } else {
          return anArray;
        }
      }
    };
  },
  // ~~~haskell
  // before x = takewhile (!= x)
  // ~~~
  //
  before: (anArray) => {
    expect(anArray).to.an('array');
    return (x) => {
      var notEqual = (y) => {
        return x != y;
      };
      return array.takeWhile(anArray)(notEqual);
    };
  },
  //
  // ~~~haskell
  // after x = tail . dropWhile (!= x)
  // ~~~
  //
  after: (anArray) => {
    return (x) => {
      const notEqual = (y) => {
        return x != y;
      };
      return array.tail(array.dropWhile(anArray)(notEqual));
    };
  },

  // zip
  zip: (listX) => {
    expect(listX).to.an('array');
    return (listY) => {
      expect(listX).to.an('array');
      if(array.isEmpty(listX)){
        return [];
      }
      if(array.isEmpty(listY)){
        return [];
      }
      var x = array.head(listX);
      var xs = array.tail(listX);
      var y = array.head(listY);
      var ys = array.tail(listY);
      return array.cons([x,y], array.zip(xs)(ys));
    };
  },
  // ## Array#reduce
  reduce: (anArray) => {
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        // const uncurriedGlue = (item, rest) => {
        //   return glue(item)(rest);
        // };
        // return anArray.reduce(uncurriedGlue, accumulator);
        if(array.isEmpty(anArray)) {
          return accumulator;
        } else {
          var item = array.head(anArray);
          var rest = array.tail(anArray);
          return glue(item)(array.reduce(rest)(accumulator)(glue));
        }
      };
    };
  },
  foldr: (anArray) => {
    return (accumulator) => {
      return (glue) => {
        return array.reduce(anArray)(accumulator)(glue);
      };
    };
  },
  // Array##foldr1
  // foldr1 _ [x] = x
  // foldr1 f x:xs =  f x (foldr1 f xs)
  foldr1: (anArray) => {
    expect(anArray).to.a('array');
    expect(anArray).to.not.be.empty();
    return (glue) => {
      expect(glue).to.a('function');
      const head = array.head(anArray);

      if(array.length(anArray) === 1) {
        return head;
      } else {
        const tail = array.tail(anArray);
        return glue(head)(array.foldr1(tail)(glue));
      }
    };
  },
  // Array#foldl
  // ~~~haskell
  // foldl :: (a → b → a) → a → [b ] → a
  // foldl _ v [ ] = v
  // foldl f v (x : xs) = foldl f (f v x) xs
  // ~~~
  foldl: (anArray) => {
    return (accumulator) => {
      return (transform) => {
        expect(transform).to.a('function');

        if(array.isEmpty(anArray)){
          return accumulator;
        } else {
          const head = array.head(anArray),
            tail = array.tail(anArray);
          return array.foldl(tail)(transform(accumulator)(head))(transform);
          // return array.foldl(tail)(transform(head)(accumulator))(transform);
        }
      };
    };
  },
  // ## Array#foldl1
  // ~~~haskell
  // foldl1 :: (a -> a -> a) -> [a] -> a
  // foldl1 f (x:xs) = foldl f x xs
  // ~~~
  foldl1: (anArray) => {
    expect(anArray).to.not.be.empty();
    return (transform) => {
      expect(transform).to.a('function');
      const head = array.head(anArray),
        tail = array.tail(anArray);
      return array.foldl(tail)(head)(transform);

      // if(array.length(anArray) === 1) {
      //   return head;
      // } else {
      //   const tail = array.tail(anArray);
      //   return array.foldl(tail)(head)(transform);
      // }
    };
  },
  // last:: [T] => T
  // last [x] = x
  // last _:xs = last xs
  //
  // laste = foldr1 (\_ a -> a)
  last: (anArray) => {
    // __ = require('./kansuu.js');
    expect(anArray).to.an('array');
    expect(anArray).to.not.be.empty();
    
    return array.foldl1(anArray)(item => {
      return (accumulator) => {
        return accumulator;
      };
    });
    // return __.compose(head,reverse)(array);
  },
  // map :: array => Fun => List
  map: (anArray) => {
    expect(anArray).to.an('array');
    return (transform) => {
      return anArray.map(transform);
   };
    // return (transform) => {
    //   return array.reduce(anArray)([])(item => {
    //     return (accumulator) => {
    //       return array.cons(transform(item),accumulator);
    //     };
    //   });
    // };
  },
  flatten: (anArrayOfArray) => {
    if(array.isEmpty(anArrayOfArray) === true) {
      return [];
    } else {
      return array.concat(array.head(anArrayOfArray), array.flatten(array.tail(anArrayOfArray)));
    }
    // empty: (_) => {
    //   return self.monad.list.empty();
    // },
    // cons: (head,tail) => {
    //   return self.monad.list.concat.call(self,
    //     head)(self.monad.list.flatten.call(self,tail));
    // }
  },

  flatMap : (anArray) => {
    expect(anArray).to.an('array');
    return (transform) => {
      expect(transform).to.a('function');
      return array.flatten(array.map(anArray)(transform));
    };
  },
  filter: (anArray) => {
    expect(anArray).to.an('array');
    return (predicate) => {
      expect(predicate).to.a('function');
      if(array.isEmpty(anArray)){
        return [];
      } else {
        var x = array.head(anArray);
        var xs = array.tail(anArray);
        if(predicate(x)) {
          return array.cons(x, array.filter(xs)(predicate));
        } else {
          return array.filter(xs)(predicate);
        }
      }
    };
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
  span: (predicate) => {
    expect(predicate).to.a('function');
    return (list) => {
      expect(list).to.an('array');
      if(array.isEmpty(list) === true){
        return [[],[]];
        // return Pair.mkPair([])([]);
      } else {
        var x = array.head(list);
        var xs = array.tail(list);
        var rest = array.span(predicate)(xs);
        if(predicate(x) === true ){
          return [array.cons(x,rest[0]),rest[1]];
          // return Pair.mkPair(
          //   cons(head,Pair.left(rest))
          // )(
          //   Pair.right(rest)
          // );
        } else {
          return [[],list];
          // return Pair.mkPair([])(list);
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
  breaks: (predicate) => {
    expect(predicate).to.a('function');
    var not = (x) => {
      return ! x;
    };
    return array.span(__.compose(not,predicate));
    // return self.span.bind(self)(self.not(predicate));
    // return function(listLike){
    //   return self.span.bind(self)(self.not(predicate))(listLike);
    //   //return self.span.bind(self)(self.compose.bind(self)(not)(predicate))(listLike);
    // };
  }

};

module.exports = array;

