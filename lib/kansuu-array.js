"use strict";

const expect = require('expect.js');
var __ = require('./kansuu.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');


// 'arrays' module
// ==============

const array = {
  empty: [],
  isEmpty: (array) => {
    expect(array).to.an('array');
    return (array.length === 0);
  },
  // cons:: (T)([T]) => [T]
  cons : (any,array) => {
    expect(array).to.an('array');
    return [any].concat(array);
  },

  // snoc: (any) => {
  //   return function(array){
  //     expect(array).to.an('array');
  //     return array.concat([any]);
  //   };
  // },
  head : (array) => {
    expect(array).to.an('array');
    return array[0];
  },
  concat: (array1, array2) => {
    return array1.concat(array2);
  },
  // const append = __.curry(concat); 
  tail: (anArray) => {
    expect(anArray).to.an('array');
    // expect(anArray.length).to.be.greaterThan(0);
    return anArray.slice(1, anArray.length);
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
    return anArray.reduce(((accumulator, item) => {
      return [item].concat(accumulator);
    }), []);
  },
  // init = reverse . tail . reverse
  init: (anArray) => {
    expect(anArray).to.an('array');
    expect(anArray).to.not.be.empty();
    return __.compose(array.reverse,__.compose(array.tail,array.reverse))(anArray);
  },
  // snoc: function(value, array){
  //   return array.concat([value]);
  // },

  length: (array) => {
    return array.length;
  },

  // last:: [T] => T
  last: (anArrray) => {
    __ = require('./kansuu.js');
    expect(anArrray).to.an('array');
    expect(anArrray).to.not.be.empty();
    return array.foldl1(anArrray)(item => {
      return (accumulator) => {
        return item;
      };
    });
    // return __.compose(head,reverse)(array);
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
  // ## Array#join
  // join :: [[a]] -> [a]
  // join = foldr append empty
  join: (anArray) => {
    __ = require('./kansuu.js');
    return array.reduce(anArray)([])(__.curry(array.concat));
  },
  // ## Array#reduce
  reduce: (anArray) => {
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        const uncurriedGlue = (item, rest) => {
          return glue(item)(rest);
        };
        return anArray.reduce(uncurriedGlue, accumulator);
        // if(array.isEmpty(anArray)) {
        //   return accumulator;
        // } else {
        //   var item = array.head(anArray);
        //   var rest = array.tail(anArray);
        //   return glue(item)(array.reduce(rest)(accumulator)(glue));
        // }
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
  foldr1: (anArray) => {
    return (glue) => {
      return array.foldr(array.tail(anArray))(array.head(anArray))(glue);
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
          return array.foldl(array.tail(anArray))(transform(array.head(anArray))(accumulator))(transform);
        }
      };
    };
  },
  // ## Array#foldl1
  // ~~~haskell
  // foldl1 :: (a -> a -> a) -> [a] -> a
  // foldl1 f (x:xs) = foldl f x xs
  // ~~~
  foldl1: (anArrray) => {
    expect(anArrray).to.not.be.empty();
    return (transform) => {
      expect(transform).to.a('function');
      return array.foldl(array.tail(anArrray))(array.head(anArrray))(transform);
    };
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
      return flatten(map(anArray)(transform));
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
  // arrays: {
  //   snoc: (any) => {
  //     return function(array){
  //       expect(array).to.an('array');
  //       return array.concat([any]);
  //     };
  //   },
  //   get: (index) => {
  //     var self = this;
  //     expect(index).to.be.a('number');
  //     return (ary) => {
  //       expect(ary).to.an('array');
  //       return ary[index];
  //     };
  //   },
  //   isNotEmpty: (ary) => {
  //     var self = this;
  //     expect(ary).to.an('array');
  //     return self.not.call(self,self.arrays.isEmpty(ary));
  //   },
  // },

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

