"use strict";

const util = require('util'),
  expect = require('expect.js'),
  fs = require('fs');

const  Pair = require('./kansuu-pair.js'),
  Array = require('./kansuu-array.js'),
  string = require('./kansuu-string.js');
var __ = require('../lib/kansuu.js');

// ## monad module
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
const Identity = {
  // ## identity#unit
  unit: (value) => {
    return value;
  },
  flatMap: (instance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return transform(instance);
    };
  }
};

// ## 'maybe' monad
// ~~~haskell
//   return a = Just a
//
// (>>) :: Maybe a -> (a -> Maybe b) -> Maybe b
// Nothing >> _ = Nothing
// Just v  >> f = f v
// ~~~
const Maybe = {
  match: (exp, pattern) => {
     return exp(pattern);
  },
  // maybe#unit
  unit: (value) => {
    if(value){
      return Maybe.just(value);
    } else {
      return Maybe.nothing(undefined);
    }
  },
  just: (value) => {
    return (pattern) => {
      return pattern.just(value);
    };
  },
  nothing: (_) => {
    return (pattern) => {
      return pattern.nothing(_);
    };
  },
  get: (instance) => {
    return Maybe.getOrElse(instance)(null);
  },
  // getOrElse :: T => T
  getOrElse: (instance) => {
    return (alternate) => {
      return Maybe.match(instance,{
        just: (value) => {
          return value;
        },
        nothing: (_) => {
          return alternate;
        }
      });
    }
  },
  // isEqual: (maybeA) => {
  //   var self = this;
  //    return (maybeB) => {
  //      return self.monad.maybeMonad.flatMap.call(self,maybeA)((a) => {
  //        return self.monad.maybeMonad.flatMap.call(maybeB)((b) => {
  //          return self.monad.maybeMonad.unit(a === b);
  //        });
  //      });
  //    };
  // },
  isEqual: (maybeA,maybeB) => {
    return Maybe.match(maybeA,{
      just: (valueA) => {
        return Maybe.match(maybeB,{
          just: (valueB) => {
            return (valueA === valueB);
          },
          nothing: (_) => {
            return false;
          }
        });
      },
      nothing: (_) => {
        return Maybe.match(maybeB,{
          just: (value) => {
            return false;
          },
          nothing: (_) => {
            return true;
          }
        });
      }
    });
  },
  // maybe#map
  // map :: maybe[T] => fun[T => U] => maybe[U]
  map: (maybeInstance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return Maybe.match(maybeInstance,{
        just: (value) => {
          return Maybe.unit(transform(value));
        },
        nothing: (_) => {
          return Maybe.nothing();
        }
      });
    };
  },
  // maybeMonad#flatMap
  // ## maybe monad
  // ~~~haskell
  //   return a = Just a
  //
  //   bind :: Maybe a -> (a -> Maybe b) -> Maybe b
  //   Nothing 'bind' _ = Nothing
  //   Just a  'bind' f = f a
  // ~~~
  flatMap: (maybeInstance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return Maybe.match(maybeInstance,{
        just: (value) => {
          return transform(value);
        },
        nothing: (_) => {
          return Maybe.nothing();
        }
      });
    };
  },
  //  maybe#lift
  lift: (transform) => {
    expect(transform).to.a('function');
    return (maybeInstance) => {
      return Maybe.map(maybeInstance)(transform);
    };
  },
  // ### monad.list#flatten
  // ~~~haskell
  // flatten :: [[a]] -> [a]
  // flatten =  foldr (++) []
  // ~~~
  flatten: (instanceMM) => {
    return Maybe.flatMap(instanceMM)((instanceM) => {
      return instanceM
    });
  },
  // maybe#ap
  ap: (justFunction) => {
    return (instance) => {
      return Maybe.flatMap(justFunction)(func => {
        return Maybe.flatMap(instance)(x => {
          return Maybe.unit(func(x));
        });
      });
    };
  },
};

// ## list monad
// ~~~haskell
// instance Monad [] where
//   return x = [x]
//   xs >>= f = concat (map f xs)
//   fail _   = []
// ~~~
const List = {
  match: (data, pattern) => {
    return data(pattern);
  },
  empty: (_) => {
    return (pattern) => {
      expect(pattern).to.an('object');
      return pattern.empty(_);
    };
  },
  // ### monad.list#unit
  unit: (value) => {
    return List.cons(value, List.empty());
  },
  cons: (head,tail) => {
    return (pattern) => {
      expect(pattern).to.an('object');
      return pattern.cons(head,tail);
    };
  },
  // ### monad.list#head
  head:  (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return undefined;
      },
      cons: (head, tail) => {
        return head;
      }
    });
  },
  // ### monad.list#tail
  tail: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return undefined;
      },
      cons: (head, tail) => {
        return tail;
      }
    });
  },
  // ### monad.list#isEmpty
  isEmpty: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return true;
      },
      cons: (head, tail) => {
        return false;
      }
    });
  },
  // ## list#elem
  // elem' :: Eq a => a -> [a] -> Bool
  // elem' x [] = False
  // elem' x (y:ys) | x == y = True
  //                | otherwise = elem' x ys
  elem: (alist) => {
    return (x) => {
      return List.match(alist, {
        empty: (_) => {
          return false;
        },
        cons: (head, tail) => {
          if(head === x) {
            return true;
          } else {
            return List.elem(tail)(x);
          }
        }
      });
    };
  },
  // ## list#append
  // append:: LIST[T] -> LIST[T] -> LIST[T] 
  //
  // ~~~haskell
  // append [] ys = ys
  // append (x:xs) ys = x:(xs `append` ys)
  //
  // append xs ys = foldr cons xs ys
  // ~~~
  append: (xs) => {
    return (ys) => {
      return List.match(xs, {
        empty: (_) => {
          return ys;
        },
        cons: (head, tail) => {
          return List.cons(head, List.append(tail)(ys)); 
        }
      });
    };
  },
  // list#reduce
  reduce: (alist) => {
    // expect(length(alist)).to.not.equal(0);
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        const item = List.head(alist);
        const rest = List.tail(alist);
        return List.match(rest, {
          empty: (_) => {
            return glue(item)(accumulator);
          },
          cons: (head, tail) => {
            return glue(item)(List.reduce(rest)(accumulator)(glue));
          }
        });
      };
    };
  },
  // ## list#take
  // take :: List => List
  take: (alist) => {
    return (n) => {
      expect(n).to.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0) {
        return List.empty();
      } else {
        return List.cons(List.head(alist), List.take(List.tail(alist))(n-1));
      }
    };
  },
  // ## list#drop
  // drop :: List => List
  drop: (alist) => {
    return (n) => {
      expect(n).to.be.a('number');
      expect(n).to.be.greaterThan(-1);
      if (n === 0)
        return alist;
      else {
        return List.match(alist, {
          empty: (_) => {
            return List.empty();
          },
          cons: (head, tail) => {
            return List.drop(tail)(n-1);
          }
        });
      }
    };
  },
  // ## list#splitAt
  // Split a list at the nth element:
  // ~~~haskell
  // splitAt :: Int → [a ] → ([a ], [a ])
  // splitAt n xs = (take n xs, drop n xs)
  // ~~~
  splitAt: (alist) => {
    return (n) => {
      expect(n).to.a('number');
      var former = List.take(alist)(n);
      var latter = List.cons(List.drop(alist)(n), List.empty());
      return List.cons(former,latter);
    };
  },
  // ## list#init
  // init :: List => List
  init: (alist) => {
    return List.take(alist)(List.length(alist)-1);
  },
  // ## list#length
  length: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return 0;
      },
      cons: (head, tail) => {
        return List.reduce(alist)(0)(item => {
          return (accumulator) => {
            return 1 + accumulator;
          };
        });
      }
    });
  },
  // ## list#last
  // last:: List[T] => T
  // ~~~haskell
  // last [x] = x
  // last (_:xs) = last xs
  // ~~~
  last: (alist) => {
    expect(List.length(alist)).above(0);
    if(List.length(alist) === 1) {
      return List.head(alist);
    } else {
      return List.last(List.tail(alist));
    }
  },
  // list#at
  at: (alist) => {
    return (index) => {
      expect(index).to.a('number');
      expect(index).to.be.greaterThan(-1);
      if (index === 0) {
        return List.head(alist);
      } else {
        const nextList = List.tail(alist);
        return List.at(nextList)(index-1);
      }
    };
  },
  // ### monad.list#fromVector
  fromVector: (array) => {
    expect(array).to.an('array');
    const head = array[0];
    if(array.length === 1){
      return List.cons(head, List.empty());
    } else {
      const tail = array.slice(1,array.length);
      return List.cons(head, List.fromVector(tail));
    }
  },
  // list#fromString
  fromString: (astring) => {
    expect(astring).to.a('string');
    const Str = require('./kansuu-string.js');

    if(Str.isEmpty(astring) === true) {
      return List.empty();
    } else {
      return List.cons(Str.head(astring), List.fromString(Str.tail(astring))); 
    }
  },
  // ## list#mkList
  mkList: (array) => {
    expect(array).to.an('array');
    //expect(array.length).to.above(0);
    return List.fromVector(array);
  },

  // ## list#snoc
  // snoc :: T => List => List
  snoc: (any) => {
    return (alist) => {
      return concat(alist)(List.mkList([any]));
    };
  },
  // ## list#concat
  //
  // ~~~haskell
  // concat :: List => List => List
  // concat :: List a -> List a -> List a
  // concat Nil ys = ys
  // concat (Cons x xs) ys = Cons x (cat xs ys)
  // ~~~
  concat: (xs) => {
    return (ys) => {
      return List.match(xs, {
        empty: (_) => {
          return ys;
        },
        cons: (head, tail) => {
          return List.cons(head, List.concat(tail)(ys));
        }
      });
    };
  },
  // ### monad.list.map
  // map :: List => fun => List
  //
  // ~~~haskell
  //  map f = foldr (cons . f) Nil
  // ~~~
  map:  (alist) => {
    return (transform) => {
      expect(transform).to.a('function');
      return List.foldr(alist)(List.empty())(item => {
        return (accumulator) => {
          return List.cons(transform(item), accumulator);
        }
      });
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
  join: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return List.empty();
      },
      cons: (head, tail) => {
        return List.concat(head)(List.join(tail));
      }
    });
  },
  // ### monad.list#flatMap
  //
  // ~~~haskell
  // flatMap :: List[T] => (T => List[S]) => List[S]
  // instance Monad [] where
  //   return x = [x]
  //   xs >>= f = join (map f xs)
  // ~~~
  flatMap: (alist) => {
    return (transform) => {
      expect(transform).to.a('function');
      return List.join(List.map(alist)(transform));
    };
  },
  // ## list#filter
  //
  // ~~~haskell
  // filter p []  = []
  // filter p (x:xs)  = if p x then x:filter p xs
  //                    else filter p xs
  // ~~~
  filter: (alist) => {
    return (predicate) => {
      expect(predicate).to.a('function');
      return List.match(alist, {
        empty: (_) => {
          return List.empty();
        },
        cons: (head, tail) => {
          if(predicate(head) === true) {
            return List.cons(head, List.filter(tail)(predicate));
          } else {
            return List.filter(tail)(predicate);
          }
        }
      });
    };
  },
  // ### monad.list#toVector
  toArray: (alist) => {
    return List.foldr(alist)([])(item => {
      return (accumulator) => {
        return [item].concat(accumulator); 
        // return [List.toVector(item)].concat(accumulator); 
      };
    });
  },
  // ### monad.list#toString
  toString: (alist) => {
    return List.foldr(alist)("")(character => {
      return (accumulator) => {
        return character + accumulator; 
      };
    });
  },
  // ### monad.list#foldr
  // ## list#foldr
  // if the list is empty, the result is the initial value z; else
  // apply f to the first element and the result of folding the rest
  //
  // foldr (⊕) v [x0, x1, ..., xn] = x0 ⊕ (x1 ⊕ (...(xn ⊕ v)...))
  //
  // ~~~haskell
  // foldr f z []     = z
  // foldr f z (x:xs) = f x (foldr f z xs)
  // ~~~
  /* foldr:: LIST[T] -> T -> FUN[T -> LIST] -> T */
  foldr: (alist) => {
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        return List.match(alist,{
          empty: (_) => {
            return accumulator;
          },
          cons: (head, tail) => {
            return glue(head)(List.foldr(tail)(accumulator)(glue));
          }
        });
      };
    };
  },
  // ## list#foldr1
  //
  // ~~~haskell
  // foldr1 :: (a → a → a) → [a ] → a
  // foldr1 f [x ] = x
  // foldr1 f (x : xs) = f x (foldr1 f xs)
  // foldr1 [] = error "PreludeList.foldr1: empty list"
  // ~~~
  foldr1: (alist) => {
    expect(List.isEmpty(alist)).to.not.be(true);

    return (glue) => {
      expect(glue).to.a('function');
      return List.match(alist,{
        cons: (head, tail) => {
          if(List.isEmpty(tail)) {
            return head;
          } else {
            return glue(head)(List.foldr1(tail)(glue));
          }
        }
      });
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
  foldl: (alist) => {
    //expect(self.list.isEmpty(list)).to.not.be(true);
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        return List.match(alist, {
          empty: (_) => {
            return accumulator;
          },
          cons: (head, tail) => {
            return List.foldl(tail)(glue(head)(accumulator))(glue);
          }
        });
      };
    };
  },
  // list#reverse
  // ~~~haskell
  // reverse :: List => List
  // reverse = foldl cons, []
  // ~~~
  reverse: (alist) => {
    return List.foldl(alist)(List.empty())(item => {
      return (tail) => {
        return List.cons(item,tail);
      };
    });
    // return foldl(alist)(empty())(cons);
  },
  // ### monad.list#forEach
  // forEach: (instanceM) => {
  //   var self = this;
  //   return (callback) => {
  //     return self.algebraic.match.call(self,instanceM,{
  //       empty: (_) => {
  //         return undefined;
  //       },
  //       cons: (head,tail) => {
  //         callback(head);
  //         return self.monad.list.forEach.call(self, tail)(callback);
  //       }
  //     });
  //   };
  // },
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
  zip: (list1) => {
    return (list2) => {
      return List.match(list1, {
        empty: (_) => {
          return List.empty(); 
        },
        cons: (x, xs) => {
          return List.match(list2, {
            empty: (_) => {
              return List.empty(); 
            },
            cons: (y, ys) => {
              const head = Pair.cons(x,y);
              const tail = List.zip(xs)(ys);
              return List.cons(head,tail);
            }
          });
        }
      });
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
  zipWith: (fun) => {
    expect(fun).to.a('function');
    return (list1) => {
      return (list2) => {
        return List.match(list1, {
          empty: (_) => {
            return List.empty(); 
          },
          cons: (x, xs) => {
            return List.match(list2, {
              empty: (_) => {
                return List.empty(); 
              },
              cons: (y, ys) => {
                return List.cons(fun(x)(y), List.zipWith(fun)(xs)(ys));
              }
            });
          }
        });
      };
    };
  },
  // ~~~haskell
  // pairs :: [a ] → [(a, a)]
  // pairs xs = zip xs (tail xs)
  // ~~~
  pairs: (xs) => {
    return List.zip(xs)(List.tail(xs));
    // return self.list.zip.bind(self)(list)(list.tail);
  },
  // list#sum
  sum: (alist) => {
    return List.reduce(alist)(0)((currentValue) => {
      return (accumulator) => {
        return currentValue + accumulator;
      };
    });
  },
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
    return (listY) => {
      return List.match(listX, {
        empty: (_) => {
          return listY;
        },
        cons: (x, xs) => {
          return List.match(listY, {
            empty: (_) => {
              return listX;
            },
            cons: (y, ys) => {
              if(x <= y){
                return List.cons(x, List.merge(xs)(listY));
              } else {
                return List.cons(y, List.merge(listX)(ys));
              }

            }
          });
        }
      });

    };
  },
  // ## list#halve
  // c.f. "Thinking Functionally with Haskell",p.76
  //
  // ~~~haskell
  // halve xs = (take n xs, drop n xs)
  //            where n = length xs `div` 2
  // ~~~
  halve: (alist) => {
    var n = List.length(alist) / 2;
    var left = List.take(alist)(n);
    var right = List.drop(alist)(n);
    return Pair.cons(left,right);
  },
  // sort :: List => List
  // c.f. "Thinking Functionally with Haskell",p.76
  //
  // ~~~haskell
  // sort [] = []
  // sort [x] = [x]
  // sort xs = merge (sort ys) (sort zs)
  //            where (ys, zs) = halve xs
  // ~~~
  sort: (alist) => {
    switch (List.length(alist)) {
      case 0:
        return alist;
        break;
      case 1:
        return alist;
        break;
      default:
        const half = List.halve(alist);
        return List.merge(List.sort(Pair.left(half)))(List.sort(Pair.right(half)));
        break;
    }
  },
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
  unfold: (until) => {    // Determines when to stop unfolding.
    return (mapper) => { // Maps each seed value to the corresponding list element.
      return (next) => { // Maps each seed value to next seed value.
        return (seed) => {
          if(until(seed)) {
            return List.empty();
          } else {
            return List.cons(seed, List.unfold(until)(mapper)(next)(next(seed)));
          }
        };
      };
    };
  },
  // ## list#isEqual
  isEqual: (list1,list2) => {
    if(List.length(list1) === List.length(list2)){
      var zipped = List.zip(list1)(list2);
      return List.reduce(zipped)(true)((pair) => {
        return (accumulator) => {
          return accumulator && (Pair.left(pair) === Pair.right(pair));
        };
      });
    } else {
      return false;
    }
  },
  // ## list#and
  // and :: List => Bool
  and: (alist) => {
    return List.reduce(alist)(true)(item => {
      return (accumulator) => {
        return item && accumulator;
      };
    });
  },
  // generate: (alist) => {
  //   var self = this;
  //   var theList = alist;
  //   return (_) => {
  //     return self.algebraic.match.call(self,theList,{
  //       empty: (_) => {
  //         return Maybe.nothing(); 
  //       },
  //       cons: (head,tail) => {
  //         theList = tail;
  //         return Maybe.unit(head);
  //       }
  //     });
  //   };
  // },
  // ## list#listToMaybe
  // ~~~haskell
  // listToMaybe            :: [a] -> Maybe a
  // listToMaybe []         =  Nothing
  // listToMaybe (a:_)      =  Just a
  // ~~~
  // listToMaybe: (list) => {
  //   var self = this;
  //   self.list.censor(list);
  //   //console.log(list)
  //   if(self.list.isEmpty.call(self, list)) {
  //     return self.monad.maybe.nothing;
  //   } else {
  //     return self.monad.maybe.unit.call(self, list.head);
  //   }
  // },
  // ## list#shred
  // shred: (list) => {
  //   var self = this;
  //   self.list.censor(list);
  //   return (n) => {
  //     expect(n).to.a('number');
  //     if(self.list.length.call(self,list) < n) {
  //       return list;
  //     } else {
  //       var splitted = self.list.splitAt.call(self,list)(n);
  //       var former = self.list.at.call(self,splitted)(0);
  //       var latter = self.list.at.call(self,splitted)(1);
  //       return self.list.cons.call(self,former)(self.list.shred.call(self,latter)(n));
  //     }
  //   };
  // },
  // ## list#shuffle
  // ~~~haskell
  // shuffle :: [a] → [a ] → [a]
  // shuffle [] ys = ys
  // shuffle xs ys = x : shuffle ys xs
  // ~~~
  // shuffle: (listA) => {
  //   var self = this;
  //   self.list.censor(listA);
  //   return (listB) => {
  //     self.list.censor(listB);
  //     if(self.list.isEmpty.call(self,listA)) {
  //       return listB;
  //     } else {
  //       var x = listA.head;
  //       var xs = self.list.tail.call(self,listA);
  //       return self.list.cons.call(self,x)(self.list.shuffle.call(self,listB)(xs));
  //     }
  //   };
  // },
  // ## list#intersperse
  // intersperse :: a -> [a] -> [a] Source
  //
  // The intersperse function takes an element and a list and `intersperses' that element between the elements of the list. For example,
  //
  // intersperse ',' "abcde" == "a,b,c,d,e"
  // intercalate :: [a] -> [[a]] -> [a] Source
  // intercalate xs xss is equivalent to (concat (intersperse xs xss)). It inserts the list xs in between the lists in xss and concatenates the result.
  // transpose :: [[a]] -> [[a]] Source
  // The transpose function transposes the rows and columns of its argument. For example,
  // transpose [[1,2,3],[4,5,6]] == [[1,4],[2,5],[3,6]]   // tail:: [T] => [T]
  // subsequences :: [a] -> [[a]] Source
  //
  // The subsequences function returns the list of all subsequences of the argument.
  // subsequences "abc" == ["","a","b","ab","c","ac","bc","abc"]
  // permutations :: [a] -> [[a]] Source
  //
  // The permutations function returns the list of all permutations of the argument.
  // permutations "abc" == ["abc","bac","cba","bca","cab","acb"]

  // list.repeat
  // -- repeat x is an infinite list, with x the value of every element.
  // ~~~haskell
  // repeat           :: a -> [a]
  // repeat x         =  xs where xs = x:xs
  // ~~~
  //
  // // or :: List[Bool] => Bool
  // or: function(list){
  //   var self = this;
  //   self.list.censor(list);
  //   return self.list.reduce.bind(self)(list)(false)(function(item){
  //     return function(accumulator){
  //       return self.truthy(item) || accumulator;
  //     };
  //   });
  // },
  // all: function(list){
  //   var self = this;
  //   self.list.censor(list);
  //   return function(predicate){
  //     expect(predicate).to.a('function');
  //     return self.compose.bind(self)(self.list.and.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
  //   };
  // },
  // any: function(list){
  //   var self = this;
  //   self.list.censor(list);
  //   return function(predicate){
  //     expect(predicate).to.a('function');
  //     return self.compose.bind(self)(self.list.or.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
  //   };
  // },
  // c.f. "Thinking Functionally with Haskell",p.774
  // ~~~haskell
  // position           :: (Eq a) => a -> [a] -> Int
  // position x         =  head ([j | (j,y) <- zip [0..] xs, y==x] ++ [-1])
  // ~~~
}; // end of List module


// ## 'Parser' monad module
// c.f. "Monadic Parser Combinator", Grahuam Hutton
//
const Parser = {
  // このメソッドは、文字列が文字のリストとして表現されるHaskellには不要だが、JavaScriptに必要となる。
  cons: (x,xs) => {
    __ = require('../lib/kansuu.js');
    var result = undefined;

    switch(__.typeOf(xs)) {
      case "string":
        result =  x + xs;
        break;
      case "array":
        result =  Array.cons(x, xs);
        break;
    }
    return result;
  },
  // parse :: Parser a -> String -> [(a,String)]
  // parse parser input = parser(input)
  parse: (parser) => {
    return (input) => {
      return parser(input);
    };
  },
  // unit :: a -> Parser a
  // unit v = \inp -> [(v, inp)] 
  unit: (v) => {
    return (input) => {
      return [{value: v, remaining: input}];
      // return List.unit(Pair.cons(v,input));
    };
  }, 
  // zero :: Parser a
  // zero: \inp -> []
  zero: (input) => {
    return [];
    // return List.empty();
  },
  // <*> :: Parser (a -> b) -> Parser a -> Parser b
  // pg <*> px = P (\input -> case parse pg input of
  //                          [] -> []
  //                          [(g,out)] -> parse (fmap g px) out)
  apply: (pg) => {
    return (px) => {
      return (input) => {
        const parseResult = Parser.parse(pg)(input);
        if(Array.isEmpty(parseResult)) {
            return [];
        } else {
          const g = parseResult.value,
            out = parseResult.remaining;
          return Parser.parse(fmap(g)(px))(out);
        }
        // return __.match(Parser.parse(pg)(input),{
        //   empty: () => {
        //     return List.empty();
        //   },
        //   cons: (pair,_) => {
        //     return Pair.match(pair,{
        //       cons: (g, out) => {
        //         return Parser.parse(fmap(g)(px))(out);
        //       }
        //     });
        //   }
        // });
      };
    };
  },
  // ## Parser#flatMap
  // ~~~haskell
  // flatMap :: Parser a -> (a -> Parser b) -> Parser b
  // flatMap p f = \inp -> flatten [f v inp' | (v, inp') <- p inp]
  // ~~~
  flatMap: (parser) => {
    return (f) => {
      return (input) => {
        return Array.join(Array.map(Parser.parse(parser)(input))(parseResult => {
          const v = parseResult.value, 
            out = parseResult.remaining;
          return f(v)(out);
        }));
        // return List.join(List.map(Parser.parse(parser)(input))(pair => {
        //   return Pair.match(pair,{
        //     cons: (v, remainingInput) => {
        //       return f(v)(remainingInput);
        //     }
        //   });
        // })); 
        // return List.match(Parser.parse(parser)(input),{
        //   empty: () => {
        //     return List.empty();
        //   },
        //   cons: (pair,_) => {
        //     return Pair.match(pair,{
        //       cons: (v, out) => {
        //         return Parser.parse(f(v))(out);
        //       },
        //       empty: () => {
        //         return List.empty();
        //         // return Parser.zero;
        //       }
        //     });
        //   }
        // });
      };
    };
  },
  // fmap :: (a -> b) -> Parser a -> Parser b
  fmap: (f) => {
    return (parserA) => {
      return (input) => {
        const parseResult = Parser.parse(parserA)(input);
        if(Array.isEmpty(parseResult)) {
            return [];
        } else {
          const v = Array.head(parseResult).value,
            out = Array.head(parseResult).remaining;
          return [{value: f(v), remaining: out}];
        }
        // return List.match(Parser.parse(parserA)(input),{
        //   empty: () => {
        //     return List.empty();
        //   },
        //   cons: (pair,_) => {
        //     return Pair.match(pair,{
        //       cons: (v, out) => {
        //         return List.cons(Pair.cons(f(v), out),
        //           List.empty());
        //       }
        //     });
        //   }
        // });
      };
    };
  },
  // ## Parser#item
  // ~~~haskell
  // item :: Parser Char
  // item = \inp -> case inp of
  //                     []     -> []
  //                     (x:xs) -> [(x,xs)]
  // ~~~
  item: (input) => {
    expect(input).to.a('string');

    if(string.isEmpty(input)) {
      return [];
    } else {
      return [{value: string.head(input), remaining: string.tail(input)}];
    }
    // return List.match(input,{
    //   empty: (_) => {
    //     return List.empty();
    //   },
    //   cons: (head, tail) => {
    //     return List.unit(Pair.cons(head, tail));
    //     // return List.cons(
    //     //   Pair.cons(head, tail),List.empty()
    //     // ); 
    //   }
    // });
  },
  // Parser#sap
  // ~~~haskell
  // sat :: (Char -> Bool) -> Parser Char
  // sat p = flatMap item \x ->
  //            if p(x) then unit(x)
  //            else zero
  // ~~~
  sat: (predicate) => {
    return Parser.flatMap(Parser.item)(x => {
      if(predicate(x) === true) {
        return Parser.unit(x);
      } else {
        return Parser.zero;
      }
    });
    // return Parser.flatMap(Parser.item)(x => {
    //   if(predicate(x) === true) {
    //     return Parser.unit(x);
    //   } else {
    //     return Parser.zero;
    //   }
    // });
  },
  // ## Parser#char
  // ~~~haskell
  // char :: Char -> Parser Char
  // char x = sat (\y -> x == y)
  // ~~~
  char: (x) => { 
    return Parser.sat(y => {
      return x === y;
    });
  },
  // ## Parser#append / plus
  // ~~~haskell
  // plus :: Parser a -> Parser a -> Parser a
  // plus p q = \inp -> (p inp ++ q inp)
  // ~~~
  append: (p) => {
    return (q) => {
      return (input) => {
        const parseResult = Array.concat(Parser.parse(p)(input), Parser.parse(q)(input));
        if(Array.isEmpty(parseResult)) {
          return [];
        } else {
          return [Array.head(parseResult)];
        }
        // return List.match(List.append(Parser.parse(p)(input))(Parser.parse(q)(input)),{
        //   empty: (_) => {
        //     return List.empty(); 
        //   },
        //   cons: (x, xs) => {
        //     // NOTE: deterministic behavior
        //     return List.unit(x); 
        //   }
        // });
        // return List.append(Parser.parse(p)(input))(Parser.parse(q)(input));
      };
    };
  },
  // alt :: Parser a -> Parser a -> Parser b
  alt: (parserA,parserB) => {
    return (input) => {
      const parseResult = Parser.parse(parserA)(input);
      if(Array.isEmpty(parseResult)) {
        return Parser.parse(parserB)(input);;
      } else {
        return  [Array.head(parseResult)];
      }

      // return List.match(Parser.parse(parserA)(input),{
      //   cons: (pair,_) => {
      //     return List.unit(pair); 
      //     // return Pair.match(pair,{
      //     //   cons: (v, out) => {
      //     //     return List.cons(Pair.cons(v,out), List.empty());
      //     //   }
      //     // });
      //   },
      //   empty: () => {
      //     return Parser.parse(parserB)(input);
      //   }
      // });
    };
  },
  // ## Parser#many
  // many :: Parser a -> Parser [a]
  // many p = [x:xs | x <- p, xs <- many p] ++ [[]]
  //
  //
  many: (p) => {
    return Parser.append(
      Parser.flatMap(p)(x => {
        return Parser.flatMap(Parser.many(p))(xs => {
          return Parser.unit(Parser.cons(x,xs));
        });
      })
    )(
      Parser.unit([])
    );
    // return Parser.alt(
    //   Parser.some(p),
    //   Parser.unit([])
    // );
    // return Array.concat(Parser.flatMap(p)(x => {
    //   return Parser.flatMap(Parser.many(p))(xs => {
    //     return Parser.unit(Array.cons(x,xs));
    //   })
    // }),[[]]);
  },
  // ## Parser#many1
  // many1 :: Parser a -> Parser [a]
  // many1 p = [x:xs | x <- p, xs <- many p]
  many1: (p) => {
    return Parser.flatMap(p)(x => {
      return Parser.flatMap(Parser.many(p))(xs => {
        return Parser.unit(Parser.cons(x,xs));
      });
    }); 
  },
  // some :: f a -> f [a]
  some: (parser) => {
    return Parser.flatMap(parser)(a => {
      return Parser.flatMap(Parser.many(parser))(b => {
        return Parser.unit(Parser.cons(a,b));
      });
    }); 
  },
  // Parser#lower
  // ~~~haskell
  // lower :: Parser String 
  // lower= sat (\x -> 'a' <= x && x <= 'z')
  // ~~~
  lower: () => { 
    const isLower = (x) => {
      if(x.match(/^[a-z]/)){
        return true;
      } else {
        return false;
      } 
    };
    return Parser.sat(isLower);
  },
  // ## Parser#upper
  // ~~~haskell
  // upper :: Parser String 
  // upper= sat (\x -> 'A' <= x && x <= 'Z')
  // ~~~
  upper: () => { 
    var isUpper = (x) => {
      if(x.match(/^[A-Z]/)){
        return true;
      } else {
        return false;
      } 
    };
    return Parser.sat(isUpper);
  },
  // ## Parser#letter
  // ~~~haskell
  // letter :: Parser Char
  // letter = append lower upper
  // ~~~
  letter: () => { 
    return Parser.append(Parser.lower())(Parser.upper());
  },
  // ## Parser#digit
  // ~~~haskell
  // digit :: Parser String 
  // digit = sat (\x -> '0' <= x && x <= '9')
  // ~~~
  digit: () => { 
    const isDigit = (x) => {
      if(x.match(/^[0-9]/)) {
        return true;
      } else {
        return false;
      } 
    };
    return Parser.sat(isDigit);
  },
  // ## Parser#alphanum
  //
  // Parses a letter or digit (a character between '0' and '9'). Returns the parsed character.
  //
  // ~~~haskell
  // alphanum :: Parser Char
  // alphanum = append letter digit
  // ~~~
  alphanum: () => { 
    return Parser.append(Parser.letter())(Parser.digit());
    // return Parser.alt(Parser.letter(),Parser.digit());
    // var isAlphaNum = (x) => {
    //   if(x.match(/^[a-zA-Z0-9]/)) {
    //     return true;
    //   } else {
    //     return false;
    //   } 
    // };
    // return Parser.sat(isAlphaNum);
  },
  // Parser#chars / string
  // chars :: List[Char] -> Parser String 
  //
  // string :: String -> Parser String
  // string "" = result ""
  // string (x:xs) = char x ‘bind‘ \_ ->
  //                  string xs ‘bind‘ \_ ->
  //                    unit (x:xs)
  chars: (str) => { 
    if(string.isEmpty(str)) {
        return Parser.unit([]);
    } else {
      const x = string.head(str),
        xs = string.tail(str);
      return Parser.flatMap(Parser.char(x))(_ => {
        return Parser.flatMap(Parser.chars(xs))(_ => {
          return Parser.unit(string.cons(x,xs));
        });
      });
    }
    // return List.match(strAsString,{
    //   empty: () => {
    //     return Parser.unit(List.empty());
    //   },
    //   cons: (x,xs) => {
    //     return Parser.flatMap(Parser.char(x))(_ => {
    //       return Parser.flatMap(Parser.chars(xs))(_ => {
    //         return Parser.unit(List.cons(x,xs));
    //       });
    //     });
    //   }
    // }); 
  },
  // ## Parser#word
  // word :: Parser String
  // word = append neWord unit("")
  //        where
  //          neWord = bind letter \x ->
  //                     bind word \xs ->
  //                       unit(x:xs)
  word: () => {
    const neWord = () => {
      return Parser.flatMap(Parser.letter())(x => {
        return Parser.flatMap(Parser.word())(xs => {
          return Parser.unit(Parser.cons(x,xs));
        });
      });
    };
    return Parser.append(neWord())(Parser.unit(""));
  },
  // ## Parser#ident
  // ~~~haskell
  // ident :: Parser String
  // ident = [x:xs | x <- lower, xs <- many alphanum]
  // ~~~
  ident: () => {
    return Parser.flatMap(Parser.lower())(x => {
      return Parser.flatMap(Parser.many(Parser.alphanum()))(xs => {
        return Parser.unit(string.cons(x,
          Array.join(xs))); // NOTE: manyの返値は配列だから、joinでxsを連結する必要がある。
      });
    });
  },
  // ## Parser#nat
  // ~~~haskell
  // nat :: Parser Int
  // nat = [eval xs | xs <- many1 digit]
  //       where
  //          eval xs = foldl1 op [ord x - ord ’0’ | x <- xs]
  //          m ‘op‘ n = 10*m + n
  // ~~~
  nat: () => {
    const _op = () => {
      return Parser.unit(
        (m) => {
          return (n) => {
            return 10 * m + n
          };
        });
    };
    const _digit = () => {
      return Parser.flatMap(Parser.digit())(n => {
        return Parser.unit(parseInt(n,10)); 
      })
    };
    return Parser.chainl1(_digit, _op);
    // var read = (xs) => {
    //   var list2str = (xs) => {
    //     return List.foldr(xs)("")((x) => {
    //       return (accumulator) => {
    //         return x + accumulator;
    //       };
    //     });
    //   };
    //   return parseInt(list2str(xs),10);
    // };
    // return Parser.flatMap(Parser.some(Parser.digit()))(xs => {
    //   return Parser.unit(read(xs));
    // });
  },
  // ## Parser#int
  // ~~~haskell
  // int :: Parser Int
  // int = [-n | _ <- char ’-’, n <- nat] ++ nat
  // ~~~
  int: () => {
    return Parser.append(
      Parser.flatMap(Parser.char("-"))(_ => {
        return Parser.flatMap(Parser.nat())(n => {
          return Parser.unit(-n);
        });
      })
    )(
      Parser.nat()
    )
    // return Parser.alt(
    //   Parser.flatMap(Parser.char("-"))((_) => {
    //     return Parser.flatMap(Parser.nat())((n) => {
    //       return Parser.unit(-n);
    //     });
    //   })
    //   ,Parser.nat()
    // );
  },
  space: () => {
    var isSpace = (input) => {
      if(input.match(/^[ \t\n]/)) {
        return true;
      } else {
        return false;
      } 
    };
    return Parser.flatMap(
      Parser.many(Parser.sat(isSpace)))(_ => {
        return Parser.unit(undefined);
      });
  },
  // spaces :: Parser ()
  // spaces = [() | _ <- many1 (sat isSpace)]
  //             where
  //               isSpace x = (x == ' ') || (x == '\n') || (x == '\t')
  spaces: () => {
    var isSpace = (input) => {
      if(input.match(/^[ \t\n]/)) {
        return true;
      } else {
        return false;
      } 
    };
    return Parser.flatMap(Parser.many1(Parser.sat(isSpace)))(_ => {
      return Parser.unit(undefined);
    });
  },
  // Parser#comment
  // comment :: Parser ()
  // comment = [() | _ <- string "--" , _ <- many (sat (\x -> x /= ’\n’))]
  lineComment: (prefix) => {
    expect(prefix).to.a('string');
    const isNotEol = (input) => {
      if(input.match(/^[\n]/)) {
        return false;
      } else {
        return true;
      } 
    };
    return Parser.flatMap(Parser.chars(prefix))(_ => {
      return Parser.flatMap(Parser.many(Parser.sat(isNotEol)))(_ => {
        return Parser.unit(undefined);
      });
    });
  },
  // token :: Parser a -> Parser a
  token: (parser) => {
    return Parser.flatMap(Parser.space())((_) => {
      return Parser.flatMap(parser)((v) => {
        return Parser.flatMap(Parser.space())((_) => {
          return Parser.unit(v);
        });
      });
    });
  },
  // identifier :: [String] -> Parser String
  // identifier ks = token [x | x <- ident, not (elem x ks)]
  identifier: (keywords) => {
    // expect(keywords).to.a('array');
    return Parser.token(Parser.ident());
    // return Parser.token(Parser.flatMap(Parser.ident())(x => {
    //   if(Vector.elem(keywords)(List.toString(x)) === false) {
    //     return Parser.unit(x);
    //   } else {
    //     return Parser.unit(List.empty());
    //   }
    // }));
    // return Parser.token(Parser.ident());
  },
  symbol: (xs) => {
    return Parser.token(Parser.chars(xs));
  },
  natural: () => {
    return Parser.token(Parser.nat());
  },
  integer: () => {
    return Parser.token(Parser.int());
  },
  float: () => {
    var minus = Parser.char("-");
    var dot = Parser.char(".");
    return Parser.alt(
      Parser.flatMap(minus)((_) => {
        return Parser.flatMap(Parser.nat())((n) => {
          return Parser.flatMap(dot)((_) => {
            return Parser.flatMap(Parser.nat())((m) => {
              return Parser.unit(-n - m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
            });
          });
        });
      })
      ,Parser.flatMap(Parser.nat())((n) => {
        return Parser.flatMap(dot)((_) => {
          return Parser.flatMap(Parser.nat())((m) => {
            return Parser.unit(n + m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
          });
        });
      })
    );
  },
  numeric: () => {
    return Parser.token(Parser.alt(Parser.float(), Parser.int()));
    // const toExp = (value) => {
    //   return exp.num(value);
    // };
    // return fmap(toExp)(Parser.token(alt(float(), int())));
    // return Parser.flatMap(Parser.token(Parser.alt(Parser.float(), Parser.int())))(numericValue => {
    //   return Parser.unit(numericValue);
    // });
  },
  string: () => {
    const quote = Parser.char('"');
    const stringContent = () => {
      const notQuote = (x) => {
        if(x.match(/^"/)){
          return false;
        } else {
          return true;
        } 
        // if(x.match(/^[^"]+/)){
        //   return true;
        // } else {
        //   return false;
        // } 
      };
      return Parser.flatMap(Parser.many(Parser.sat(notQuote)))((xs) => {
        return Parser.unit(xs);
      });
    };
    return Parser.token(
      Parser.flatMap(quote)((_) => {
        return Parser.flatMap(stringContent())(content => {
          return Parser.flatMap(quote)((_) => {
            return Parser.unit(content);
          });
        });
      })
    );
  },
  // ##Parser#sepBy1
  // ~~~haskell
  // sepby1 :: Parser a -> Parser b -> Parser [a]
  // sepby1 p sep = [x:xs | x <- p, 
  //                        xs <- many [y | _ <- sep, y <- p]] 
  // ~~~
  sepBy1: (parser) => {
    return (sep) => {
      return Parser.flatMap(parser)(x => {
        return Parser.flatMap(Parser.many(Parser.flatMap(sep)(_ => {
            return Parser.flatMap(parser)(y => {
              return Parser.unit(y);
            });
          })))(xs => {
          return Parser.unit(Parser.cons(x,xs));
        })
      })
    };
  },
  // ## Parser#sepby
  // ~~~haskell
  // sepby :: Parser a -> Parser b -> Parser [a]
  // sepby p sep = (sepby1 p sep) ++ [[]]
  // ~~~
  sepBy: (parser) => {
    return (sep) => {
      return Parser.append(Parser.sepBy1(parser)(sep))([[]])
    };
  },
  // ## Parser#bracket
  // ~~~haskell
  // bracket :: Parser a -> Parser b -> Parser c -> Parser b
  // bracket open p close = [x | _ <- open, x <- p, _ <- close]
  // ~~~
  bracket: (open, _parser, close) => {
    return Parser.flatMap(open)(_ => {
      return Parser.flatMap(_parser())(x => {
        return Parser.flatMap(close)(_ => {
          return Parser.unit(x);
        })
      })
    })
  },
  // ## Parser#chainl1
  // ~~~haskell
  // chainl1 :: Parser a -> Parser (a -> a -> a) -> Parser a
  // chainl1 p op = [foldl (\x (f,y) -> f x y) x fys 
  //                       | x <- p, fys <- many [(f,y) | f <- op, y <- p]]
  //
  // chainl1 p op = p ‘bind‘ rest
  //                     where
  //                        rest x = (op ‘bind‘ \f ->
  //                                    p ‘bind‘ \y ->
  //                                    rest (f x y)
  //                                  ) ++ [x]
  chainl1: (_parser, _op) => {
    expect(_parser).to.a('function');
    expect(_op).to.a('function');
    const rest = (x) => {
      return Parser.append(
        Parser.flatMap(_op())(f => {
          return Parser.flatMap(_parser())(y => {
            return rest(f(x)(y));
          });
        })
      )(
        Parser.unit(x)
      );
    };
    return Parser.flatMap(_parser())(rest);
    // return Parser.flatMap(_parser())(x => { // x <- p
    //   // fys <- many [(f,y) | f <- op, y <- p]]
    //   return Parser.flatMap(Parser.many(Parser.flatMap(_op())(f => {
    //     return Parser.flatMap(_parser())(y => {
    //       return Parser.unit(Pair.cons(f,y));
    //     });
    //   })))(fys => {
    //     return Parser.unit(List.foldl(fys)(x)(fy => {
    //       return (accumulator) => {
    //         return Pair.match(fy, {
    //           cons: (f, y) => {
    //             return f(accumulator)(y);
    //           }
    //         })
    //       };
    //     }));
    //   })
    // });
  },
  // chainl :: Parser a -> Parser (a -> a -> a) -> a -> Parser a
  // chainl p op v = (p ‘chainl1‘ op) ++ [v]
  chainl: (_parser, _op, _v) => {
    return Parser.append(
      Parser.chainl1(_parser, _op)
    )(
      Parser.unit(_v())
    );
  },
  // ## Parser#chainr1
  //chainr1 :: Parser a -> Parser (a -> a -> a) -> Parser a
  // p ‘chainr1‘ op =
  //       p ‘bind‘ \x ->
  //           [f x y | f <- op, y <- p ‘chainr1‘ op] ++ [x]
  chainr1: (_parser, _op) => {
    expect(_parser).to.a('function');
    expect(_op).to.a('function');
    return Parser.flatMap(_parser())(x => {
      return Parser.append(
        Parser.flatMap(_op())(f => {
          return Parser.flatMap(Parser.chainr1(_parser,_op))(y => {
            return Parser.unit(f(x)(y));
          })
        })
      )(
        Parser.unit(x)
      );
    });
  },
  // chainr :: Parser a -> Parser (a -> a -> a) -> a -> Parser a
  // chainr p op v = (p ‘chainr1‘ op) ++ [v]  
  chainr: (_parser, _op, _v) => {
    return Parser.append(
      Parser.chainr1(_parser, _op)
    )(
      Parser.unit(_v())
    );
  },
  // force :: Parser a -> Parser a
  // force p = \inp -> let x = p inp in
  //           (fst (head x), snd (head x)) : tail x
  //
  // ## Parser#first
  // first :: Parser a -> Parser a
  // first p = \inp -> case p inp of
  //                   []     -> []
  //                   (x:xs) -> [x]
  // first: (p) => {
  //   return (input) => {
  //     return List.match(Parser.parse(p)(input),{
  //       empty: (_) => {
  //         return List.empty(); 
  //       },
  //       cons: (x, xs) => {
  //         return List.unit(x); 
  //       }
  //     });
  //   };
  // }
};

// ## 'IO' monad module
// c.f. "Thinking Functionlly with Haskell",p.243
//
// ~~~haskell
//   type IO a = World -> (a, World)
//   return :: a -> IO a
//   (>>=) :: IO a -> (a -> IO b) -> IO b
//   putChar :: Char -> IO ()
//   getChar :: IO Char
//   map : IO[A](fn: A -> B): IO[B]
//   flatMap : IO[A](fn: A -> IO[B]): IO[B]
//
//   flatMap : IO a -> (a -> IO b) -> IO b
// ~~~
const IO = {
  // unit :: A => IO[A]
  unit: (any) => {
    return () =>  {
      return any;
    }
  },
  // run :: IO[A] => A
  run: (instance) => {
    return instance();
  },
  /* done:: T => IO[T] */
  done : (any) => {
    return IO.unit(any);
  },
  // empty: () => {
  //   return IO.unit(() => {
  //     // do nothing
  //   });
  // },
  // flatMap :: IO[A] => FUN[A => IO[B]] => IO[B]
  flatMap : (instanceA) => {
    return (actionAB) => { // actionAB:: A -> IO[B]
      return (_) => {
        return IO.run(actionAB(IO.run(instanceA)));
      }
    };
  },
  // putChar :: CHAR => IO[Unit]
  putChar: (character) => {
    return (_) => {
      process.stdout.write(character);
      return null;
    };
  },
  /* 
     seq関数は、2つのIOアクションを続けて実行する
  */
  // IO.seq:: IO[T] => IO[U] => IO[U] 
  seq: (actionA) => {
    return (actionB) => {
      return IO.flatMap(actionA)(a => {
        return IO.flatMap(actionB)(b => {
          return IO.done(b);
          // return IO.done(List.cons(a,List.unit(b)));
          // return IO.done();
        });
      });
    };
  },
  putStrLn: (string) => {
    const stringAsList = List.fromString(string); 
    return IO.flatMap(IO.puts(stringAsList))((_) => {
      return IO.flatMap(IO.putc("\n"))((_) => {
        return IO.done(); 
      });
    });
  },
  seqs: (alist) => {
    return List.foldr(alist)(List.empty())(item => {
      return (accumulator) => {
        return IO.done(List.cons(item,accumulator));
      };
    });
    // return List.foldr(alist)(List.empty())(IO.done());
  },
  /* IO.putc:: CHAR => IO[CHAR] */
  putc: (character) => {
    return (_) => {
      process.stdout.write(character);
      return IO.done(character); 
      // return null;
    };
  },
  /* IO.puts:: LIST[CHAR] => IO[Unit] */
  puts: (alist) => {
    return List.match(alist, {
      empty: () => {
        return IO.done();
      },
      cons: (head, tail) => {
        return IO.seq(IO.putc(head))(IO.puts(tail));
      }
    });
  },
  /* IO.getc:: IO[CHAR] */
  getc: (_) => {
    var continuation = () => {
      var chunk = process.stdin.read();
      return chunk;
    }; 
    process.stdin.setEncoding('utf8');
    return process.stdin.on('readable', continuation);
  },
  // **IO#readFile**
  /* readFile:: STRING => IO[STRING] */
  readFile : (path) => {
    return (_) => {
      return fs.readFileSync(path, 'utf8'); 
      // return IO.unit(content)(_);
    };
  },
  // // writeFile:: STRING => STRING -> IO[Unit]
  writeFile : (path) => {
    return (content) => {
      return (_) => {
        var fs = require('fs');
        fs.writeFileSync(path,content);
        return IO.done();
      };
    };
  },
  /* print:: STRING => IO[Unit] */
  print : (message) => {
    const messageList = List.fromString(message);
    return IO.puts(messageList);
    // return (_) => {
    //   console.log(message);
    //   return IO.done();
    // };
  },
  /* println:: STRING => IO[STRING] */
  println : (message) => {
    return (_) => {
      console.log(message);
      return IO.done(message);
    };
  },
  // join: (io1, io2) => {
  //   return self.monad.IO.unit(() => {
  //     io1.run();
  //     io2.run();
  //   });
  // },
  // // map :: IO[A] => FUN[A => B] => IO[B]
  // map: (io) => {
  //   var self = this;
  //   return (transform) => { // transform :: A => B
  //     return self.monad.IO.unit(() => {
  //       return transform(io.run());
  //     });
  //   };
  // },
  // // print:: STRING -> IO()
  // print: (message) => {
  //   var self = this;
  //   return self.monad.IO.unit(() => {
  //     console.log(message);
  //     return message;
  //   });
  // }
};


// ## 'random' monad
const Random = {
    // ~~~scala
    // def unit[A](a:A) : Rand[A] =
    //   rng => (a, rng)
    // ~~~
    unit: (value) => {
      return (rng) => {
        return Pair.cons(value, rng);
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
      return (fun) => {
        return (rng) => {
          var pair = s(rng);
          var a = Pair.left(pair);
          var rng2 = Pair.right(pair);
          return Pair.cons(fun(a),rng2);
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
    flatMap: (rand) => {
      expect(rand).to.a('function');
      return (transform) => {
        expect(transform).to.a('function');
        return (rng) => {
          var pair = rand(rng);
          return transform(Pair.left(pair))(Pair.right(pair));
        };
      };
    },
    // random.int
    //
    // def int(rng:RNG): (Int,RNG)
    int: (rng) => {
      const RandomJs = require("random-js"),
        newRandomValue = rng(),
        rng2 = RandomJs.engines.mt19937(),
        newRng = rng2.seed(newRandomValue);
      return Random.unit(newRandomValue)(newRng);
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
      return (rng) => {
        if(count === 0) {
          return Pair.cons(List.empty(), rng);
        } else {
          var nextRandom = Random.int(rng);
          var restRandom = Random.ints(count -1)(Pair.right(nextRandom));
          return Pair.cons(List.cons(Pair.left(nextRandom),Pair.left(restRandom)), Pair.left(restRandom));
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
      return Random.unit(Random.int(rng) % 2)(rng);
    }
}; /* end of 'random' monad */

// ## 'writer' monad
// writer: {
//   unit: (value) =>{
//     var self = this;
//     return (buffer) => {
//       return {
//         value: value,
//         buffer: buffer
//       };
//     };
//   },
//   flatMap: (writer) => {
//     var self = this;
//     return (transform) => {
//       expect(transform).to.a('function');
//       var result = transform(writer.value);
//       return self.monad.writer.unit.call(self,
//           result.value)(self.list.concat.bind(self)(writer.buffer)(result.buffer));
//     };
//   }
// },
// ## 'state' monad module
// c.f. https://wiki.haskell.org/State_Monad
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
// ~~~haskell
// newtype State s a = State { runState :: s -> (a, s) }
// instance Monad (State s) where
// return a = State $ \s -> (a, s)
// m >>= k  = State $ \s -> let (a, s') = runState m s
//    in runState (k a) s'
// ~~~
// ~~~haskell
// type State s a = s -> (a,s)
//
// unit :: a -> State s a
// unit x s = (x,s)
// ~~~
//
// ~~~haskell
// instance Monad (State s) where
//   return x = State $ \s -> (x, s)
//   (State h) >>= f = State $ \s -> let (a, newState) = h s
//                                       (State g) = f a
//                                   in g newState
//
// unit :: a -> State s a
// unit x s = (x,s)
// ~~~
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
// state:{
// ### monad.state#unit
//
// unit :: a -> State s a
// unit x s = (x,s)
// ~~~scheme
//   (unitM (x)   (lambda (s) (values x s)))
//   (define (unit value)
//      (lambda ()
//         value)
// ~~~
// unit: (value) => {
//   var self = this;
//   return () => {
//     return value;
//   };
// },
// ### monad.state#mkState
// ~~~haskell
// mkState :: (s -> (a,s)) -> State s a
// mkState f = do {
//             s <- get;
//             let (a, s') = f s;
//             put s';
//             return a
//           }
// ~~~
// mkState: (f) => {  // f :: (s -> (a,s)) 
//   var self = this;
//   return self.monad.state.flatMap()
// },
//
//
//   map: (stateA) => {
//     var self = this;
//     return (transform /* A => B */ ) => {
//       return self.monad.state.flatMap.bind(self)(stateA)((a) => {
//         self.monad.state.unit.bind(self)(transform(a));
//       });
//     };
//   }
//   //def get[S]: State[S, S] = State(s => (s, s))
//   //def set[S](s: S): State[S, Unit] = State(_ => ((), s))
// ### monad.state#flatMap
// var bind = (operate, transform) => {
//   return (stack) => {
//     var newState = operate(stack);
//     return transform(newState.value)(newState.stack);
//   };
// };
// ~~~haskell
//   (State h) >>= f = State $ \s -> let (a, newState) = h s
//                                       (State g) = f a
//                                   in g newState
// ~~~
// ~~~scheme
//   (bindM (m f)
//       (lambda (s)
//          (receive (val s*) (m s)
//             ((f val) s*))))
//   (define (flatMap m f)
//      (lambda ()
//         (let ((value (m))
//              ((f value))))
// ~~~
// flatMap: (instance) => {
//   var self = this;
//   expect(instance).to.a('function');
//   return (action) => {
//     return () => {
//       expect(action).to.a('function');
//       var value = instance();
//       return action(value);
//     };
//   };
// },
//   flatMap: (state) => {
//     var self = this;
//     return (transform) => {
//       return (s) => {
//         var newTransition /* (a, s) */ = state.run(s);
//         return transform(newTransition.left).run(newTransition.right);
//       };
//     };
//     // return (transform /* A => State[S,B] */ ) => {
//     //   var newTransition /* Pair[A,State] */ = stateA.run(s);
//     //   return transform(newTransition.left).run(newTransition.right);
//     //   // var run = (s) => {
//     //   //   var newTransition /* Pair[A,State] */ = stateA.run(s);
//     //   //   return transform(newTransition.left).run(newTransition.right);
//     //   // };
//     //   // return run.call(self, stateA);
//     //   // return self.monad.state.unit.call(self,
//     //   //                                   run);
//     // };
//   },
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
// get: () => {
//   var self = this;
//   return () => {
//     return null;
//   };
// },
// //
// // put :: s -> State s ()
// // put x s = ((),x)
// put: (value) => {
//   var self = this;
//   return () => {
//     return  null;
//   };
// },
// run: (instance) => {
//   expect(instance).to.a('function');
//   return instance();
// }
// },
// reader monad
// 
// ~~~haskell
// newtype Reader e a = Reader { runReader :: (e -> a) }
// instance Monad (Reader e) where 
//   return a         = Reader $ \e -> a 
//   (Reader r) >>= f = Reader $ \e -> runReader (f (r e)) e 
// ~~~

//   reader: {
//     // Reader モナド中の値はある環境からある値への関数です。
//     // run: (value) => {
//     //   return (env) => {
//     //     return value;
//     //   };
//     // },
//     run: (value) => {
//         return value;
//     },
//     // Reader: (value) => {
//     //   var self = this;
//     //   return self.reader.run(value);
//     //   // return {
//     //   //   run: (env) => {
//     //   //     return value;
//     //   //   }
//     //   // };
//     // },
//     Reader: (value) => {
//       var self = this;
//       return {
//         run: (env) => {
//           return value;
//         }
//       };
//     },
//     // unit 関数は環境を無視し与えられた値を生成する Reader を作成します。
//     // unit x = Reader $ \_ -> x
//     unit: (value) => {
//       var self = this;
//       return self.reader.Reader(value);
//     },
//     //  flatMap((Reader f),g) = Reader $ \e -> run (g (f e)) e
//     //                        = Reader(\e -> run (g (f e)) e)
//     //  flatMap :: Reader f -> (f -> Reader g) -> Reader g

//     flatMap: (instanceM) => { // instanceM:: Reader f
//       var self = this;
//       return (transform) => { // f -> Reader g
//         return (env) => {
//           return transform(instanceM.run(env));
//         // instanceM.run() // :: f
//         // transform(instanceM) // :: Reader g
//         }; 
//       }; 
//     },
//     // ask :: Reader a a
//     // ask = Reader id
//     // ask: ((_) => {
//     //   var self = this;
//     //   return self.reader.Reader((any) => {
//     //     return any;
//     //   });
//     // })(null) 
//   }

module.exports = {
  identity: Identity,
  maybe: Maybe,
  list: List,
  io: IO,
  random: Random,
  parser: Parser,
};
