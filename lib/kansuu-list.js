"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');


const match = (data, pattern) => {
  return data(pattern);
};

const empty = (_) => {
  return (pattern) => {
    return pattern.empty();
  };
};

const cons = (head, tail) => {
  return (pattern) => {
    return pattern.cons(head, tail);
  };
};

// ## list#snoc
// snoc :: T => List => List
const snoc = (any) => {
  return (alist) => {
    return concat(alist)(mkList([any]));
  };
};

const head = (alist) => {
  return match(alist, {
    empty: (_) => {
      return undefined;
    },
    cons: (head, tail) => {
      return head;
    }
  });
};

const tail = (alist) => {
  return match(alist, {
    empty: (_) => {
      return undefined;
    },
    cons: (head, tail) => {
      return tail;
    }
  });
};
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
const map = (alist) => {
  return (transform) => {
    expect(transform).to.a('function');
    return foldr(alist)(empty())(item => {
      return (accumulator) => {
        return cons(transform(item), accumulator);
      }
    });
  };
};
// ## list#join
// join :: List[List[T]] => List[T]
//
// ~~~haskell
// join :: List (List a) -> List a
// join Nil = Nil
// join (Cons xs xss) =  concat xs (join xss)
// ~~~
const join = (alist) => {
  return match(alist, {
    empty: (_) => {
      return empty();
    },
    cons: (head, tail) => {
      return concat(head)(join(tail));
    }
  });
};

// ## list#flatMap
//
// ~~~haskell
// flatMap :: List[T] => (T => List[S]) => List[S]
// instance Monad [] where
//   return x = [x]
//   xs >>= f = join (map f xs)
// ~~~
const flatMap = (alist) => {
  return (transform) => {
    expect(transform).to.a('function');
    return join(map(alist)(transform));
    //return self.list.join.bind(self)(self.list.map.bind(self)(list)(transform));
  };
};

// ## list#filter
//
// ~~~haskell
// filter p []  = []
// filter p (x:xs)  = if p x then x:filter p xs
//                    else filter p xs
// ~~~
const filter = (alist) => {
  return (predicate) => {
    expect(predicate).to.a('function');
    return match(alist, {
      empty: (_) => {
        return empty();
      },
      cons: (head, tail) => {
        if(predicate(head) === true) {
          return cons(head, filter(tail)(predicate));
        } else {
          return filter(tail)(predicate);
        }
      }
    });
    // var reversed =  reduce(alist)(empty())((item) => {
    //   return (accumulator) => {
    //     if(self.truthy(predicate(item))) {
    //       return self.list.snoc.bind(self)(item)(accumulator);
    //     } else {
    //       return accumulator;
    //     }
    //   };
    // });
    // return self.list.reverse.bind(self)(reversed);
  };
};
// ## list#concat
//
// ~~~haskell
// concat :: List => List => List
// concat :: List a -> List a -> List a
// concat Nil ys = ys
// concat (Cons x xs) ys = Cons x (cat xs ys)
// ~~~
const concat = (xs) => {
  return (ys) => {
    return match(xs, {
      empty: (_) => {
        return ys;
      },
      cons: (head, tail) => {
        return cons(head, concat(tail)(ys));
      }
    });
  };
};

// ## list#length
const length = (alist) => {
  return match(alist, {
    empty: (_) => {
      return 0;
    },
    cons: (head, tail) => {
      return reduce(alist)(0)(item => {
        return (accumulator) => {
          return 1 + accumulator;
        };
      });
    }
  });
};
// ## list#last
// last:: List[T] => T
// ~~~haskell
// last [x] = x
// last (_:xs) = last xs
// ~~~
const last = (alist) => {
  expect(length(alist)).above(0);
  if(length(alist) === 1) {
    return head(alist);
  } else {
    return last(tail(alist));
  }
};
// list#at
const at = (alist) => {
  return (index) => {
    expect(index).to.a('number');
    expect(index).to.be.greaterThan(-1);
    if (index === 0) {
      return head(alist);
    } else {
      const nextList = tail(alist);
      return at(nextList)(index-1);
    }
  };
};
// ## list#mkList
const mkList = (array) => {
  expect(array).to.an('array');
  //expect(array.length).to.above(0);
  return fromArray(array);
};

const fromArray = (array) => {
  expect(array).to.an('array');
  const head = array[0];
  if(array.length === 1){
    return cons(head, empty());
  } else {
    const tail = array.slice(1,array.length);
    return cons(head, fromArray(tail));
  }
};

// list#fromString
const fromString = (astring) => {
  expect(astring).to.a('string');
  return string.toList(astring);
  // return fromArray(string.toArray(astring));
};
// // list#fromString
// const fromString = (astring) => {
//   expect(string).to.a('string');
//   return mkList(string.toArray(astring));
// };

/* append:: LIST[T] -> LIST[T] -> LIST[T] */
const append = (xs) => {
  return (ys) => {
    return match(xs, {
      empty: (_) => {
        return ys;
      },
      cons: (head, tail) => {
        return cons(head, append(tail)(ys)); 
      }
    });
  };
};
/* foldr:: LIST[T] -> T -> FUN[T -> LIST] -> T */
const foldr = (alist) => {
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');
      return match(alist,{
        empty: (_) => {
          return accumulator;
        },
        cons: (head, tail) => {
          return glue(head)(foldr(tail)(accumulator)(glue));
        }
      });
    };
  };
};

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
const foldl = (alist) => {
  //expect(self.list.isEmpty(list)).to.not.be(true);
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');
      return match(alist, {
        empty: (_) => {
          return accumulator;
        },
        cons: (head, tail) => {
          return foldl(tail)(glue(head)(accumulator))(glue);
        }
      });
    };
  };
};

// list#reverse
// ~~~haskell
// reverse :: List => List
// reverse = foldl cons, []
// ~~~
const reverse = (alist) => {
  return foldl(alist)(empty())(item => {
    return (tail) => {
      return cons(item,tail);
    };
  });
  // return foldl(alist)(empty())(cons);
};

// list#reduce
const reduce = (alist) => {
  // expect(length(alist)).to.not.equal(0);
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');
      const item = head(alist);
      const rest = tail(alist);
      return match(rest, {
        empty: (_) => {
          return glue(item)(accumulator);
        },
        cons: (head, tail) => {
          return glue(item)(reduce(rest)(accumulator)(glue));
        }
      });
    };
  };
};

// ## list#take
// take :: List => List
const take = (alist) => {
  return (n) => {
    expect(n).to.a('number');
    expect(n).to.be.greaterThan(-1);
    if (n === 0) {
      return empty();
    } else {
      return cons(head(alist),take(tail(alist))(n-1));
    }
  };
};
// ## list#drop
// drop :: List => List
const drop = (alist) => {
  return (n) => {
    expect(n).to.be.a('number');
    expect(n).to.be.greaterThan(-1);
    if (n === 0)
      return alist;
    else {
      return match(alist, {
        empty: (_) => {
          return empty();
        },
        cons: (head, tail) => {
        return drop(tail)(n-1);
        }
      });
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
};

// ## list#splitAt
// Split a list at the nth element:
// ~~~haskell
// splitAt :: Int → [a ] → ([a ], [a ])
// splitAt n xs = (take n xs, drop n xs)
// ~~~
const splitAt = (alist) => {
  return (n) => {
    expect(n).to.a('number');
    var former = take(alist)(n);
    var latter = cons(drop(alist)(n),empty());
    return cons(former,latter);
  };
};

// ## list#init
// init :: List => List
const init = (alist) => {
  return take(alist)(length(alist)-1);
  // var array = self.list.take.bind(self)(list)(length-1);
  // return self.list.mkList.bind(self)(array);
};

const toArray = (alist) => {
  return foldr(alist)([])(item => {
    return (accumulator) => {
      return [item].concat(accumulator); 
    };
  });
};

// ## list#find
// The find function takes a predicate and a list and returns the first element in the list matching the predicate, or Nothing if there is no such element.
//
// ~~~haskell
// find :: (a -> Bool) -> [a] -> Maybe a
// find                    :: (a -> Bool) -> [a] -> Maybe a
// find p                  =  listToMaybe . filter p
// ~~~
// const find = (alist) => {
//   return (predicate) => {
//     expect(predicate).to.a('function');
//     return self.compose.call(self,
//       self.list.listToMaybe.bind(self))(self.flip.call(self,self.list.filter.bind(self))(predicate))(list);
//   };
// };

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
const zip = (list1) => {
  return (list2) => {
    return match(list1, {
      empty: (_) => {
        return empty(); 
      },
      cons: (x, xs) => {
        return match(list2, {
          empty: (_) => {
            return empty(); 
          },
          cons: (y, ys) => {
            const head = Pair.cons(x,y);
            const tail = zip(xs)(ys);
            return cons(head,tail);
          }
        });
      }
    });
  };
};
// list.zipWith :: function => List[T] => List[U] => List[S]
//
// c.f. "Thinking Functionally with Haskell",p.73
//
// ~~~haskell
// zipWith (x:xs) (y:ys) = f x y : zipWith f xs ys
// zipWith _ _           = []
// ~~~
const zipWith = (fun) => {
  expect(fun).to.a('function');
  return (list1) => {
    return (list2) => {
      return match(list1, {
        empty: (_) => {
          return empty(); 
        },
        cons: (x, xs) => {
          return match(list2, {
            empty: (_) => {
              return empty(); 
            },
            cons: (y, ys) => {
              return cons(fun(x)(y),zipWith(fun)(xs)(ys));
            }
          });
        }
      });
    };
  };
};
// list#sum
const sum = (alist) => {
  return reduce(alist)(0)((currentValue) => {
    return (accumulator) => {
      return currentValue + accumulator;
    };
  });
};

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
const merge = (listX) => {
  return (listY) => {
    return match(listX, {
      empty: (_) => {
        return listY;
      },
      cons: (x, xs) => {
        return match(listY, {
          empty: (_) => {
            return listX;
          },
          cons: (y, ys) => {
            if(x <= y){
              return cons(x,merge(xs)(listY));
            } else {
              return cons(y,merge(listX)(ys));
            }

          }
        });
      }
    });

  };
};

// ## list#halve
// c.f. "Thinking Functionally with Haskell",p.76
//
// ~~~haskell
// halve xs = (take n xs, drop n xs)
//            where n = length xs `div` 2
// ~~~
const halve = (alist) => {
  var n = length(alist) / 2;
  var left = take(alist)(n);
  var right = drop(alist)(n);
  return Pair.cons(left,right);
};

// sort :: List => List
// c.f. "Thinking Functionally with Haskell",p.76
//
// ~~~haskell
// sort [] = []
// sort [x] = [x]
// sort xs = merge (sort ys) (sort zs)
//            where (ys, zs) = halve xs
// ~~~
const sort = (alist) => {
  switch (length(alist)) {
    case 0:
      return alist;
      break;
    case 1:
      return alist;
      break;
    default:
      const half = halve(alist);
      return merge(sort(Pair.left(half)))(sort(Pair.right(half)));
      break;
  }
};

// // ## list#replicate
// replicate: (n) => {
//   expect(n).to.a('number');
//   expect(n).to.be.greaterThan(-1);
//   return (any) => {
//     return self.stream.take.bind(self)(self.stream.repeat.bind(self)(any))(n);
//   };
// };

// ## list#unfold
//  unfold builds a list from a seed value.
//
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
const unfold = (until) => {    // Determines when to stop unfolding.
  return (mapper) => { // Maps each seed value to the corresponding list element.
    return (next) => { // Maps each seed value to next seed value.
      return (seed) => {
        if(until(seed)) {
          return empty();
        } else {
          return cons(seed,unfold(until)(mapper)(next)(next(seed)));
        }
      };
    };
  };
};

// // ## list#range
// const range = (start) => {
//   expect(start).to.a('number');
//   const succ = (n) => {
//     return n+1;
//   };
//   return (end) => {
//     expect(end).to.a('number');
//     return unfold(equal(end+1))(self.id)(math.succ)(start);
//   };
// }

// ## list#isEqual
const isEqual = (list1,list2) => {
  if(length(list1) === length(list2)){
    var zipped = zip(list1)(list2);
    return reduce(zipped)(true)((pair) => {
      return (accumulator) => {
        return accumulator && (Pair.left(pair) === Pair.right(pair));
      };
    });
  } else {
    return false;
  }
};

// ## list#and
// and :: List => Bool
const and = (alist) => {
  return reduce(alist)(true)(item => {
    return (accumulator) => {
      return item && accumulator;
    };
  });
};

module.exports = {
  match: match,
  empty: empty,
  cons: cons,
  snoc: snoc,
  head: head,
  tail: tail,
  map: map,
  join: join,
  flatMap: flatMap,
  filter: filter,
  mkList: mkList,
  fromArray: fromArray,
  fromString: fromString,
  append: append,
  toArray: toArray,
  foldr: foldr,
  foldl: foldl,
  reduce: reduce,
  take: take,
  drop: drop,
  zip: zip,
  zipWith: zipWith,
  splitAt: splitAt,
  init: init,
  sum: sum,
  merge: merge,
  halve: halve,
  sort: sort,
  unfold: unfold,
  length: length,
  last: last,
  reverse: reverse,
  at: at,  
  concat: concat,
  isEqual: isEqual,
  and: and
  
};

