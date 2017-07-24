"use strict";

const expect = require('expect.js');
const __ = require('./kansuu.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');


// // 'arrays' module
// // ==============
const empty = [];
const isEmpty = (array) => {
  expect(array).to.an('array');
  return (array.length === 0);
};

const cons = (any,array) => {
  expect(array).to.an('array');
  return [any].concat(array);
};

const head = (array) => {
  expect(array).to.an('array');
  return array[0];
};

const concat = (array1, array2) => {
  return array1.concat(array2);
};

const tail = (array) => {
  expect(array).to.an('array');
  expect(array.length).to.be.greaterThan(0);
  return array.slice(1,array.length);
};

// take:: ([T])(n) => [T]
const take = (array) => {
  expect(array).to.an('array');
  return (n) => {
    expect(n).to.be.a('number');
    expect(n).to.be.greaterThan(-1);
    if (n === 0)
      return [];
    else {
      if(isEmpty(array) === true) {
        return empty;
      } else {
        return cons(head(array), take(tail(array))(n-1));
      }
    }
  };
};

// drop
const drop = (array) => {
  expect(array).to.an('array');
  return (n) => {
    expect(n).to.be.a('number');
    expect(n).to.be.greaterThan(-1);
    if (n === 0)
      return array;
    else {
      if(isEmpty(array) === true)
        return [];
      else {
        return drop(tail(array))(n-1);
      }
    }
  };
};
// reverse :: [a] -> [a] Source
// reverse xs returns the elements of xs in reverse order. xs must be finite.
const reverse = (array) => {
  expect(array).to.an('array');
  return array.reduce(((accumulator, item) => {
    return [item].concat(accumulator);
  }), []);
};
// init = reverse . tail . reverse
const init = (array) => {
  expect(array).to.an('array');
  expect(array).to.not.be.empty();
  return __.compose(reverse,__.compose(tail,reverse))(array);
};
// snoc: function(value, array){
//   return array.concat([value]);
// },

const length = (array) => {
  return array.length;
};

// last:: [T] => T
const last = (array) => {
  expect(array).to.an('array');
  expect(array).to.not.be.empty();
  return __.compose(head,reverse)(array);
  // return __.compose(head)(reverse)(array);
};
  
// Split an array at the nth element:
// ~~~haskell
// splitAt :: Int → [a ] → ([a ], [a ])
// splitAt n xs = (take n xs, drop n xs)
// ~~~
const splitAt = (array) => {
  expect(array).to.an('array');
  return (n) => {
    expect(n).to.a('number');
    return [take(array)(n), drop(array)(n)];
  };
};

// takeWhile :: (Fun,[T]) => [T]
const takeWhile = (array) => {
  expect(array).to.an('array');
  return (predicate) => {
    expect(predicate).to.a('function');
    if(isEmpty(array) === true) {
      return [];
    } else {
      if(predicate(head(array)) === true) {
        return cons(head(array), takeWhile(tail(array))(predicate));
      } else {
        return [];
      }
    }
  };
};
// dropWhile
// dropWhile :: (T=>Bool,[T]) => [T]
const dropWhile = (array) => {
  expect(array).to.an('array');
  return (predicate) => {
    expect(predicate).to.a('function');
    if(isEmpty(array) === true){
      return [];
    } else {
      if(predicate(head(array)) === true ){
        return dropWhile(tail(array))(predicate);
      } else {
        return array;
      }
    }
  };
};
// ~~~haskell
// before x = takewhile (!= x)
// ~~~
//
const before = (array) => {
  expect(array).to.an('array');
  return (x) => {
    var notEqual = (y) => {
      return x != y;
    };
    return takeWhile(array)(notEqual);
  };
};
//
// ~~~haskell
// after x = tail . dropWhile (!= x)
// ~~~
//
const after = (array) => {
  return (x) => {
    const notEqual = (y) => {
      return x != y;
    };
    return tail(dropWhile(array)(notEqual));
  };
};

// zip
const zip = (listX) => {
  expect(listX).to.an('array');
  return (listY) => {
    expect(listX).to.an('array');
    if(isEmpty(listX)){
      return [];
    }
    if(isEmpty(listY)){
      return [];
    }
    var x = head(listX);
    var xs = tail(listX);
    var y = head(listY);
    var ys = tail(listY);
    return cons([x,y],zip(xs)(ys));
  };
};
// reduce
/* #@range_begin(reduce) */
const reduce = (array) => {
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');
      if(isEmpty(array)) {
        return accumulator;
      } else {
        var item = head(array);
        var rest = tail(array);
        return glue(item)(reduce(rest)(accumulator)(glue));
      }
    };
  };
};

// map :: array => Fun => List
/* #@range_begin(map) */
const map = (array) => {
  expect(array).to.an('array');
  return (transform) => {
    return reduce(array)([])(item => {
      return (accumulator) => {
        return cons(transform(item),accumulator);
      };
    });
  };
};

const filter = (array) => {
  expect(array).to.an('array');
  return (predicate) => {
    expect(predicate).to.a('function');
    if(isEmpty(array)){
      return [];
    } else {
      var x = head(array);
      var xs = tail(array);
      if(predicate(x)) {
        return cons(x,filter(xs)(predicate));
      } else {
        return filter(xs)(predicate);
      }
    }
  };
};
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
const span = (predicate) => {
  expect(predicate).to.a('function');
  return (list) => {
    expect(list).to.an('array');
    if(isEmpty(list) === true){
      return [[],[]];
      // return Pair.mkPair([])([]);
    } else {
      var x = head(list);
      var xs = tail(list);
      var rest = span(predicate)(xs);
      if(predicate(x) === true ){
        return [cons(x,rest[0]),rest[1]];
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
};
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
const breaks = (predicate) => {
  expect(predicate).to.a('function');
  var not = (x) => {
    return ! x;
  };
  return span(__.compose(not,predicate));
  // return self.span.bind(self)(self.not(predicate));
  // return function(listLike){
  //   return self.span.bind(self)(self.not(predicate))(listLike);
  //   //return self.span.bind(self)(self.compose.bind(self)(not)(predicate))(listLike);
  // };
};

module.exports = {
  empty: empty,
  cons: cons,
  isEmpty: isEmpty,
  head: head,
  tail: tail,
  concat: concat,
  take: take,
  drop: drop,
  reverse: reverse,
  init: init,
  length: length,
  last: last,
  splitAt: splitAt,
  takeWhile: takeWhile,
  dropWhile: dropWhile,
  before: before,
  after: after,
  zip: zip,
  map: map,
  filter: filter,
  span: span,
  breaks: breaks,

};

