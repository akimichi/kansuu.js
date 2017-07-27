"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const __ = require('../lib/kansuu.js');
const string = require('./kansuu-string.js');

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
const identity = {
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
//   bind :: Maybe a -> (a -> Maybe b) -> Maybe b
//   Nothing 'bind' _ = Nothing
//   Just a  'bind' f = f a
// ~~~
const maybe = {
  match: (exp, pattern) => {
     return exp(pattern);
  },
  just: (value) => {
    return (pattern) => {
      return pattern.just(value);
      // return pattern.just(value);
    };
  },
  nothing: (_) => {
    return (pattern) => {
      return pattern.nothing(_);
    };
  },
  get: (instance) => {
    return maybe.getOrElse(instance)(null);
  },
  getOrElse: (instance) => {
    return (alternate) => {
      return __.match(instance,{
        just: (value) => {
          return value;
        },
        nothing: (_) => {
          return alternate;
        }
      });
    }
  },
  // maybeMonad#unit
  unit: (value) => {
    if(value){
      return maybe.just(value);
    } else {
      return maybe.nothing(undefined);
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
    return __.match(maybeA,{
      just: (valueA) => {
        return __.match(maybeB,{
          just: (valueB) => {
            return (valueA === valueB);
          },
          nothing: (_) => {
            return false;
          }
        });
      },
      nothing: (_) => {
        return __.match(maybeB,{
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
  map: (maybeInstance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return maybe.match(maybeInstance,{
        just: (value) => {
          return maybe.unit(transform(value));
        },
        nothing: (_) => {
          return maybe.nothing();
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
      return __.match(maybeInstance,{
        just: (value) => {
          return transform(value);
        },
        nothing: (_) => {
          return maybe.nothing();
        }
      });
    };
  },
  //  maybe#lift
  lift: (transform) => {
    expect(transform).to.a('function');
    return (maybeInstance) => {
      return maybe.map(maybeInstance)(transform);
    };
  },
  flatten: (instanceMM) => {
    return maybe.flatMap(instanceMM)((instanceM) => {
      return instanceM
    });
  },
  // maybe#ap
  ap: (justFunction) => {
    return (instance) => {
      return maybe.flatMap(justFunction)(func => {
        return maybe.flatMap(instance)(x => {
          return maybe.unit(func(x));
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
    // var array = self.list.take.bind(self)(list)(length-1);
    // return self.list.mkList.bind(self)(array);
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
  // ### monad.list#fromArray
  fromArray: (array) => {
    expect(array).to.an('array');
    const head = array[0];
    if(array.length === 1){
      return List.cons(head, List.empty());
    } else {
      const tail = array.slice(1,array.length);
      return List.cons(head, List.fromArray(tail));
    }
  },
  // list#fromString
  fromString: (astring) => {
    expect(astring).to.a('string');
    return string.toList(astring);
    // return List.fromArray(string.toArray(astring));
  },
  // ## list#mkList
  mkList: (array) => {
    expect(array).to.an('array');
    //expect(array.length).to.above(0);
    return List.fromArray(array);
  },

  // ## list#snoc
  // snoc :: T => List => List
  snoc: (any) => {
    return (alist) => {
      return concat(alist)(List.mkList([any]));
    };
  },

  // ### monad.list#unit
  unit: (value) => {
    return List.cons(value, List.empty());
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
  // ### monad.list#flatten
  // ~~~haskell
  // flatten :: [[a]] -> [a]
  // flatten =  foldr (++) []
  // ~~~
  // flatten: (instanceMM) => {
  //   var self = this;
  //   return self.algebraic.match.call(self,instanceMM,{
  //     empty: (_) => {
  //       return self.monad.list.empty();
  //     },
  //     cons: (head,tail) => {
  //       return self.monad.list.concat.call(self,
  //         head)(self.monad.list.flatten.call(self,tail));
  //     }
  //   });
  // },
  // ### monad.list.map
  // map :: List => fun => List
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
      //return self.list.join.bind(self)(self.list.map.bind(self)(list)(transform));
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
  },
  // ### monad.list#toArray
  toArray: (alist) => {
    return List.foldr(alist)([])(item => {
      return (accumulator) => {
        return [item].concat(accumulator); 
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
  generate: (alist) => {
    var self = this;
    var theList = alist;
    return (_) => {
      return self.algebraic.match.call(self,theList,{
        empty: (_) => {
          return self.monad.maybeMonad.nothing(); 
        },
        cons: (head,tail) => {
          theList = tail;
          return self.monad.maybeMonad.unit.call(self,head);
        }
      });
    };
  }
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
  // ~~~haskell
  // pairs :: [a ] → [(a, a)]
  // pairs xs = zip xs (tail xs)
  // ~~~
  // pairs: function(list){
  //   var self = this;
  //   self.list.censor(list);
  //   return self.list.zip.bind(self)(list)(list.tail);
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
};

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
  // ## maybe monad
  // ~~~haskell
  // (>>) :: Maybe a -> (a -> Maybe b) -> Maybe b
  // Nothing >> _ = Nothing
  // Just v  >> f = f v
  // ~~~
  // maybe: {
  //   unit: (value) => {
  //     if(value){
  //       return maybe.just(value);
  //     } else {
  //       return maybe.nothing(undefined);
  //     }
  //   },
  //   // getOrElse :: T => T
  //   // getOrElse: function(maybe){
  //   //   var self = this;
  //   //    self.monad.maybe.censor(maybe);
  //   //    self.monad.maybe.flatMap(maybe)(function(item){
  //   //    }
  //   // }
  //   // orElse :: maybe[T] => maybe[T]
  //   // filter :: fun[T => Bool] => maybe[T]
  //   //
  //   // maybe#map
  //   // map :: maybe[T] => fun[T => U] => maybe[U]
  //   map: function(maybe){
  //     var self = this;
  //     self.monad.maybe.censor(maybe);
  //     return function(transform){
  //       expect(transform).to.a('function');
  //       if(self.existy(maybe.just)){
  //         return self.monad.maybe.unit.bind(self)(transform(maybe.just));
  //       } else {
  //         return self.monad.maybe.nothing;
  //       }
  //     };
  //   },
  //   // maybe#flatMap
  //   flatMap: (instance) => {
  //     var self = this;
  //     self.monad.maybe.censor(instance);
  //     return function(transform){
  //       expect(transform).to.a('function');
  //       if(self.existy(instance.just)){
  //         return self.monad.maybe.censor.call(self,
  //             transform.call(self,
  //               instance.just));
  //       } else {
  //         return self.monad.maybe.nothing;
  //       }
  //     };
  //   },
  //   // ## maybe#getOrElse
  //   getOrElse:(instance) => {
  //     var self = this;
  //     self.monad.maybe.censor(instance);
  //     return (alternative) => {
  //       if(self.existy(instance.just)){
  //         return instance.just;
  //       } else {
  //         return alternative;
  //       }
  //     };
  //   },
  // }, /* end of 'maybe' monad */
  // ## 'random' monad
  // random: {
  //   // ~~~scala
  //   // def unit[A](a:A) : Rand[A] =
  //   //   rng => (a, rng)
  //   // ~~~
  //   unit: (value) => {
  //     var self = this;
  //     return (rng) => {
  //       return self.pair.cons.bind(self)(value)(rng);
  //     };
  //   },
  //   // ~~~scala
  //   // def map[A,B](s:Rand[A])(f: A=>B) : Rand[B] =
  //   //   rng => {
  //   //     val (a, rng2) = s(rng)
  //   //     (f(a), rng2)
  //   // ~~~
  //   // def map[B](f: A => B): State[S, B] =
  //   //   flatMap(a => unit(f(a)))
  //   map: (s) => {
  //     var self = this;
  //     return (fun) => {
  //       return (rng) => {
  //         var pair = s(rng);
  //         var a = pair.left;
  //         var rng2 = pair.right;
  //         return self.pair.cons.bind(self)(fun(a))(rng2);
  //       };
  //     };
  //   },
  //   // ~~~scala
  //   // def map2[A,B,C](ra: Rand[A], rb: Rand[B])(f: (A, B) => C): Rand[C] =
  //   //   rng => {
  //   //     val (a, r1) = ra(rng)
  //   //     val (b, r2) = rb(r1)
  //   //     (f(a, b), r2)
  //   //   }
  //   // ~~~
  //   //
  //   // ~~~scala
  //   // def flatMap[A,B](f: Rand[A])(g: A => Rand[B]): Rand[B] =
  //   //   rng => {
  //   //     val (a, r1) = f(rng)
  //   //     g(a)(r1) // We pass the new state along
  //   //   }
  //   // ~~~

  //   flatMap: function(rand){
  //     expect(rand).to.a('function');
  //     var self = this;
  //     return function(transform){
  //       expect(transform).to.a('function');
  //       return function(rng){
  //         var pair = rand(rng);
  //         return transform(pair.left)(pair.right);
  //       };
  //     };
  //   },
  //   // random.int
  //   //
  //   // def int(rng:RNG): (Int,RNG)
  //   int: (rng) => {
  //     var self = this;
  //     var newRandomValue = rng();
  //     var rng2 = Random.engines.mt19937();
  //     var newRng = rng2.seed(newRandomValue);
  //     return self.monad.random.unit.bind(self)(newRandomValue)(newRng);
  //   },
  //   // random.ints
  //   //
  //   // ~~~scala
  //   // def ints(count: Int)(rng: RNG): (List[Int], RNG) =
  //   //   if (count == 0)
  //   //     (List(), rng)
  //   //   else {
  //   //     val (x, r1)  = rng.nextInt
  //   //     val (xs, r2) = ints(count - 1)(r1)
  //   //     (x :: xs, r2)
  //   //   }
  //   // ~~~
  //   ints: (count) => {
  //     expect(count).to.a('number');
  //     var self = this;
  //     return (rng) => {
  //       if(count === 0) {
  //         return self.pair.cons.bind(self)(self.list.empty)(rng);
  //       } else {
  //         var nextRandom = self.monad.random.int.bind(self)(rng);
  //         var restRandom = self.monad.random.ints.bind(self)(count -1)(nextRandom.right);
  //         return self.pair.cons.bind(self)(self.list.cons.bind(self)(nextRandom.left)(restRandom.left))(restRandom.right);
  //       }
  //       /* stream: Stream[Pair[Int,Rng]]*/
  //       // var stream = __.stream.unfold.bind(__)(rng)((rng) => {
  //       //    var randomValue = rng();
  //       //    return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(randomValue)(rng));
  //       // });
  //       // __.stream.take.bind(__)(count)
  //     };
  //   },
  //   double: (rng) => {
  //   },
  //   boolean: (rng) => {
  //     var self = this;
  //     return self.monad.random.unit.bind(self)(self.monad.random.int(rng) % 2)(rng);
  //   }
  // },/* end of 'random' monad */

    // ## 'stream' monad
    //  c.f. https://patternsinfp.wordpress.com/2010/12/31/stream-monad/
    // stream:{
    //   empty: (_) => {
    //     return (pattern) => {
    //       expect(pattern).to.an('object');
    //       return pattern.empty(_);
    //     };
    //   },
    //   cons: (head,tailThunk) => {
    //     expect(tailThunk).to.a('function');
    //     return (pattern) => {
    //       expect(pattern).to.an('object');
    //       return pattern.cons(head,tailThunk);
    //     };
    //   },
    //   // head:: STREAM -> MAYBE[STREAM]
    //   head: (lazyList) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,lazyList,{
    //       empty: (_) => {
    //         return self.monad.maybeMonad.nothing();
    //       },
    //       cons: (value, tailThunk) => {
    //         return self.monad.maybeMonad.just(value);
    //       }
    //     });
    //   },
    //   // tail:: STREAM -> MAYBE[STREAM]
    //   tail: (lazyList) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,lazyList,{
    //       empty: (_) => {
    //         return self.monad.maybeMonad.nothing();
    //       },
    //       cons: (head, tailThunk) => {
    //         return self.monad.maybeMonad.just(tailThunk());
    //       }
    //     });
    //   },
    //   isEmpty: (lazyList) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,lazyList,{
    //       empty: (_) => {
    //         return true;
    //       },
    //       cons: (head1,tailThunk1) => {
    //         return false;
    //       }
    //     });
    //   },
    //   // ### monad.stream#toArray
    //   toArray: (lazyList) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,lazyList,{
    //       empty: (_) => {
    //         return [];
    //       },
    //       cons: (head,tailThunk) => {
    //         return self.algebraic.match.call(self,tailThunk(),{
    //           empty: (_) => {
    //             return [head];
    //           },
    //           cons: (head_,tailThunk_) => {
    //             return [head].concat(self.monad.stream.toArray.call(self,tailThunk()));
    //           }
    //         });
    //         // return [head].concat(self.monad.stream.toArray.call(self,tailThunk()));
    //         // if(self.monad.stream.isEmpty.call(self,tailThunk())){
    //         //   return [head];
    //         // } else {
    //         //   return [head].concat(self.monad.stream.toArray.call(self,tailThunk()));
    //         // }
    //       }
    //     });
    //   },
    //   // ### stream#fromList
    //   fromList: (list_) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,list_,{
    //       empty: (_) => {
    //         return self.monad.stream.empty();
    //       },
    //       cons: (head,tail) => {
    //         return self.algebraic.match.call(self,tail,{
    //           empty: (_) => {
    //             return self.monad.stream.unit.call(self, head);
    //           },
    //           cons: (_head,_tail) => {
    //             return self.monad.stream.cons.call(self,head, (_) => {
    //               return self.monad.stream.fromList.call(self, tail);
    //             });
    //           }
    //         });
    //       }
    //     });
    //   },
    //   // ### stream#unit
    //   // unit:: ANY -> STREAM
    //   unit: (value) => {
    //     var self = this;
    //     if(self.existy(value)){
    //       return self.monad.stream.cons(value, (_) => {
    //         return self.monad.stream.empty();
    //       });
    //     } else {
    //       return self.monad.stream.empty();
    //     }
    //   },
    //   // ### stream#map
    //   map: (lazyList) => {
    //     var self = this;
    //     return (transform) => {
    //       return self.algebraic.match.call(self,lazyList,{
    //         empty: (_) => {
    //           return self.monad.stream.empty();
    //         },
    //         cons: (head,tailThunk) => {
    //           return self.monad.stream.cons.call(self,
    //               transform.call(self,head),(_) => {
    //                 return self.monad.stream.map.call(self,
    //                     tailThunk())(transform.bind(self))});
    //         }
    //       });
    //       // return self.stream.reduce.call(self,
    //       // 								 stream)(self.stream.monad.empty())((item) => {
    //       // 	return (accumulator) => {
    //       //     var value = transform(item);
    //       //     var tailThunk = (_) => {
    //       // 		return accumulator;
    //       //     };
    //       //     return self.monad.stream.cons.call(self,
    //       // 										 value, tailThunk);
    //       // 	};
    //       // });
    //     };
    //   },
    //   // ## stream#append
    //   append: (stream1, stream2) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,stream1,{
    //       empty: (_) => {
    //         return stream2;
    //       },
    //       cons: (head1,tailThunk1) => {
    //         return self.algebraic.match.call(self,stream2,{
    //           empty: (_) => {
    //             return stream1;
    //           },
    //           cons: (head2,tailThunk2) => {
    //             return self.monad.stream.cons.call(self,
    //                 head1,() => {
    //                   return self.monad.stream.append.call(self,
    //                       tailThunk1(),stream2)});
    //           }
    //         });
    //       }
    //     });
    //   },
    //   // ## monad.stream#concat
    //   concat: (xs) => {
    //     var self = this;
    //     return (ysThunk) => {
    //       return self.algebraic.match.call(self,xs,{
    //         empty: (_) => {
    //           return ysThunk();
    //         },
    //         cons: (head,tailThunk) => {
    //           return self.monad.stream.cons.call(self,
    //               head,(_) => {
    //                 return self.monad.stream.concat.call(self,
    //                     tailThunk())(ysThunk);
    //               });
    //         }
    //       });
    //     };
    //   },
    //   // ## stream#flatten
    //   // flatten :: STREAM[STREAM[T]] => STREAM[T]
    //   //
    //   // ~~~haskell
    //   // flatten :: List (List a) -> List a
    //   // flatten Nil = Nil
    //   // flatten (Cons xs xss) =  concat xs (flatten xss)
    //   // ~~~
    //   flatten: (lazyList) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,lazyList,{
    //       empty: (_) => {
    //         return self.monad.stream.empty();
    //       },
    //       cons: (head,tailThunk) => {
    //         return self.monad.stream.concat.call(self,
    //             head)((_) => {
    //           return self.monad.stream.flatten.call(self,
    //               tailThunk());
    //         });
    //       }
    //     });
    //   },
    //   // ### monad.stream#flatMap
    //   // ~~~haskell
    //   // flatMap xs f = flatten (map f xs)
    //   //~~~
    //   // flatMap:: STREAM[STREAM[T]] -> FUNC[T->STREAM[T]] -> STREAM[T]
    //   flatMap: (lazyList) => {
    //     var self = this;
    //     return (transform) => { // FUNC[T->STREAM[T]]
    //       return self.monad.stream.flatten.call(self,
    //           self.monad.stream.map.call(self,lazyList)(transform));
    //       // return self.monad.stream.flatten.call(self,
    //       // 										self.monad.stream.map.call(self,
    //       // 																   lazyList)(transform.bind(self)));
    //     };
    //   },
    //   // ### monad.stream#constant
    //   constant:(any) => {
    //     var self = this;
    //     return self.monad.stream.cons.call(self,
    //         any, (_) => {
    //           return self.monad.stream.constant.call(self, any);
    //         });
    //   },
    //   // ### monad.stream#take
    //   // take:: STREAM -> NUMBER -> STREAM
    //   take: (lazyList) => {
    //     var self = this;
    //     return (number) => {
    //       expect(number).to.a('number');
    //       expect(number).to.be.greaterThan(-1);
    //       return self.algebraic.match.call(self,lazyList,{
    //         empty: (_) => {
    //           return self.monad.stream.empty();
    //         },
    //         cons: (head,tailThunk) => {
    //           if(number === 0) {
    //             return self.monad.stream.empty();
    //           } else {
    //             return self.monad.stream.cons.call(self,
    //                 head,(_) => {
    //                   return self.monad.stream.take.call(self,
    //                       tailThunk())(number -1);
    //                 });
    //           }
    //         }
    //       });
    //     };
    //   },
    //   // ### monad.stream#cycle
    //   // def cycle[T](a:Iterable[T]) = Stream.constant(a).flatMap(v=>v)
    //   cycle: (lazyList) => {
    //     var self = this;
    //     return self.monad.stream.flatMap.call(self,
    //         self.monad.stream.constant.call(self,
    //           lazyList))((item) => {
    //       return item;
    //     });
    //   },
    //   // ## monad.stream#filter
    //   // filter:: STREAM[T] -> FUNC[T -> BOOL] -> STREAM[T]
    //   filter: (lazyList) => {
    //     var self = this;
    //     return (predicate) => {
    //       expect(predicate).to.a('function');
    //       return self.algebraic.match.call(self,lazyList,{
    //         empty: (_) => {
    //           return lazyList;
    //         },
    //         cons: (head,tailThunk) => {
    //           if(self.truthy(predicate(head))){
    //             return self.monad.stream.cons.call(self,
    //                 head,(_) => {
    //                   return self.monad.stream.filter.call(self,tailThunk())(predicate)
    //                 });
    //           } else {
    //             return self.monad.stream.filter.call(self,tailThunk())(predicate);
    //           }
    //         }
    //       });
    //     };
    //   },
    //   // ### monad.stream#foldr
    //   foldr: (instanceM) => {
    //     var self = this;
    //     return (accumulator) => {
    //       return (glue) => {
    //         expect(glue).to.a('function');
    //         return self.algebraic.match.call(self,instanceM,{
    //           empty: (_) => {
    //             return accumulator;
    //           },
    //           cons: (head,tailThunk) => {
    //             return glue(head)(self.monad.stream.foldr.call(self,
    //                   tailThunk())(accumulator)(glue));
    //           }
    //         });
    //       };
    //     };
    //   },
    //   at: (index,lazyList) => {
    //     if(index === 0){
    //       return this.head(lazyList);
    //     } else {
    //       return this.at(index -1, this.tail(lazyList));
    //     }
    //   }
    // }, // end of 'stream' monad
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
    // ## 'IO' monad module
    // IO: {
    //   unit: (sideeffect) => {
    //     var self = this;
    //     return {
    //       run: sideeffect
    //     };
    //   },
    //   empty: () => {
    //     var self = this;
    //     return self.monad.IO.unit(() => {
    //       // do nothing
    //     });
    //   },
    //   join: (io1, io2) => {
    //     return self.monad.IO.unit(() => {
    //       io1.run();
    //       io2.run();
    //     });
    //   },
    //   // map :: IO[A] => FUN[A => B] => IO[B]
    //   map: (io) => {
    //     var self = this;
    //     return (transform) => { // transform :: A => B
    //       return self.monad.IO.unit(() => {
    //         return transform(io.run());
    //       });
    //     };
    //   },
    //   // flatMap :: IO[A] => FUN[A => IO[B]] => IO[B]
    //   flatMap: (io) => {
    //     var self = this;
    //     return (transform) => {
    //       return self.monad.IO.unit(() => {
    //         return transform(io.run()).run();
    //       });
    //     };
    //   },
    //   // readFile:: STRING -> IO[STRING]
    //   readFile: (path) => {
    //     var self = this;
    //     return self.monad.IO.unit(() => {
    //       return fs.readFileSync(path, 'utf8');
    //     });
    //   },
    //   // writeFile:: STRING -> IO()
    //   writeFile: (path, content) => {
    //     var self = this;
    //     return self.monad.IO.unit(() => {
    //       fs.writeFileSync(path, content);
    //     });
    //   },
    //   // print:: STRING -> IO()
    //   print: (message) => {
    //     var self = this;
    //     return self.monad.IO.unit(() => {
    //       console.log(message);
    //       return message;
    //     });
    //   }
    // },
    // ## 'IO' monad module
    //
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
    //
    // IO: {
    //   unit: (a) => {
    //     return (world) => {
    //       return {
    //         value: a,
    //         world: world
    //       };
    //     };
    //   },
    //   // flatMap::  IO a -> (a -> IO b) -> IO b
    //   flatMap: (instanceM) => {
    //     var self = this;
    //     return (transform) => { // s => IO
    //       return (world) => {
    //         expect(transform).to.a('function');
    //         var newWorld = instanceM(world);
    //         return transform(value)
    //       };
    //     };
    //   },
    //   // map : IO[A](fn: A -> B): IO[B]
    //   // map: ,
    //   // function bind (io1, f) {
    //   //   return function (world) {
    //   //     var tuple = io1(world);
    //   //     var newWorld = tuple[0];
    //   //     var value = tuple[1];
    //   //     var io2 = f(value);
    //   //     return io2(newWorld);
    //   //   };
    //   // }
    //   // putStr :: String -> IO ()
    // },
    // ## 'state' monad module
    // c.f. https://wiki.haskell.org/State_Monad
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
  }
module.exports = {
  identity: identity,
  maybe: maybe,
  list: List,
};
