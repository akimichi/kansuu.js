"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const __ = require('../lib/kansuu.js');

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


// ## 'either' monad
// ~~~haskell
// data  Either a b  =  Left a | Right b
// instance Functor (Either a) where
//   fmap f (Right x) = Right (f x)
//   fmap f (Left x) = Left x
//
// instance Monad (Either a b) where
//   return x = Right x
//   Right x >>= f = f x
//   Left x >>= Left x
// ~~~
const either = {
  unit: (value) => {
    return Pair.cons(null,value);
  },
  left: (value) => {
    return Pair.cons(value,null);
  },
  right: (value) => {
    return Pair.cons(null,value);
  },
  // either#flatMap
  flatMap: (instance) => {
    return (transform) => {
      expect(transform).to.a('function');
      if(either.right(instance)){
        return transform(either.right(instance));
      } else {
        return instance;
      }
    };
  }
};
  // either: {
  //   left: (value) => {
  //     var self = this;
  //     return self.pair.mkPair.bind(self)(value)(null);
  //   },
  //   right: (value) => {
  //     var self = this;
  //     return self.pair.mkPair.bind(self)(null)(value);
  //   },
  //   // either#map
  //   map: function(instance){
  //     var self = this;
  //     self.monad.either.censor(instance);
  //     return function(transform){
  //       expect(transform).to.a('function');
  //       if(self.existy(instance.right)){
  //         return self.monad.either.right.bind(self)(transform(instance.right));
  //       } else {
  //         return self.monad.either.left.bind(self)(transform(instance.left));
  //       }
  //     };
  //   },
  //   },
  //   bindM: (instance) => {
  //     var self = this;
  //     self.monad.either.censor.call(self,instance);
  //     return (transform) => {
  //       expect(transform).to.a('function');
  //       return self.monad.either.flatMap.call(self,instance)(transform);
  //     };
  //   }
  // }, /* end of 'either' monad */
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
  // ## list monad
  // ~~~haskell
  // instance Monad [] where
  //   return x = [x]
  //   xs >>= f = concat (map f xs)
  //   fail _   = []
  // ~~~
    // list:{
    //   empty: (_) => {
    //     return (pattern) => {
    //       expect(pattern).to.an('object');
    //       return pattern.empty(_);
    //     };
    //   },
    //   cons: (head,tail) => {
    //     return (pattern) => {
    //       expect(pattern).to.an('object');
    //       return pattern.cons(head,tail);
    //     };
    //   },
    //   // ### monad.list#unit
    //   unit: (value) => {
    //     var self = this;
    //     return self.monad.list.cons.call(self,
    //         value, self.monad.list.empty());
    //   },
    //   // ## monad.list#concat
    //   concat: (xs) => {
    //     var self = this;
    //     return (ys) => {
    //       return self.algebraic.match.call(self,xs,{
    //         empty: (_) => {
    //           return ys.bind(self);
    //         },
    //         cons: (head,tail) => {
    //           return self.monad.list.cons.call(self,
    //               head,self.monad.list.concat.call(self, tail)(ys));
    //         }
    //       });
    //     };
    //   },
    //   // ### monad.list#flatten
    //   // ~~~haskell
    //   // flatten :: [[a]] -> [a]
    //   // flatten =  foldr (++) []
    //   // ~~~
    //   flatten: (instanceMM) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,instanceMM,{
    //       empty: (_) => {
    //         return self.monad.list.empty();
    //       },
    //       cons: (head,tail) => {
    //         return self.monad.list.concat.call(self,
    //             head)(self.monad.list.flatten.call(self,tail));
    //       }
    //     });
    //   },
    //   // ### monad.list.map
    //   map: (instanceM) => {
    //     var self = this;
    //     return (transform) => {
    //       return self.algebraic.match.call(self,instanceM,{
    //         empty: (_) => {
    //           return self.monad.list.empty();
    //         },
    //         cons: (head,tail) => {
    //           return self.monad.list.cons.call(self,
    //               transform.call(self,head),self.monad.list.map.call(self,
    //                 tail)(transform));
    //         }
    //       });
    //     };
    //   },
    //   // ### monad.list#flatMap
    //   flatMap: (instanceM) => {
    //     var self = this;
    //     return (transform) => { // FUNC[T->STREAM[T]]
    //       return self.monad.list.flatten.call(self,
    //           self.monad.list.map.call(self,
    //             instanceM)(transform));
    //     };
    //   },
    //   // ### monad.list#fromArray
    //   fromArray: (array) => {
    //     var self = this;
    //     expect(array).to.an('array');
    //     return array.reduce((accumulator, item) => {
    //       return self.monad.list.concat.call(self,
    //           accumulator)(self.monad.list.unit.call(self, item));
    //     }, self.monad.list.empty());
    //   },
    //   // ### monad.list#toArray
    //   toArray: (instanceM) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,instanceM,{
    //       empty: (_) => {
    //         return [];
    //       },
    //       cons: (head,tail) => {
    //         return [head].concat(self.monad.list.toArray.call(self, tail));
    //       }
    //     });
    //   },
    //   // ### monad.list#foldr
    //   foldr: (instanceM) => {
    //     var self = this;
    //     return (accumulator) => {
    //       return (glue) => {
    //         expect(glue).to.a('function');
    //         return self.algebraic.match.call(self,instanceM,{
    //           empty: (_) => {
    //             return accumulator;
    //           },
    //           cons: (head,tail) => {
    //             return glue(head)(self.monad.list.foldr.call(self,
    //                   tail)(accumulator)(glue));
    //           }
    //         });
    //       };
    //     };
    //   },
    //   // ### monad.list#forEach
    //   forEach: (instanceM) => {
    //     var self = this;
    //     return (callback) => {
    //       return self.algebraic.match.call(self,instanceM,{
    //         empty: (_) => {
    //           return undefined;
    //         },
    //         cons: (head,tail) => {
    //           callback(head);
    //           return self.monad.list.forEach.call(self, tail)(callback);
    //         }
    //       });
    //     };
    //   },
    //   // ### monad.list#head
    //   head: (alist) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,alist,{
    //       empty: (_) => {
    //         return self.monad.maybeMonad.nothing(); 
    //       },
    //       cons: (head,tail) => {
    //         return self.monad.maybeMonad.unit.call(self,head);
    //       }
    //     });
    //   },
    //   // ### monad.list#tail
    //   tail: (alist) => {
    //     var self = this;
    //     return self.algebraic.match.call(self,alist,{
    //       empty: (_) => {
    //         return self.monad.maybeMonad.nothing(); 
    //       },
    //       cons: (head,tail) => {
    //         return self.monad.maybeMonad.unit.call(self,tail);
    //       }
    //     });
    //   },
    //   // ### monad.list#at
    //   at: (alist) => {
    //     var self = this;
    //     return (index) => {
    //       expect(index).to.a('number');
    //       expect(index).to.be.greaterThan(-1);
    //       if (index === 0) {
    //         return self.monad.list.head.call(self,alist);
    //       } else {
    //         return self.algebraic.match.call(self,self.monad.list.tail.call(self,alist),{
    //           nothing: (_) => {
    //             return self.monad.maybeMonad.nothing();
    //           },
    //           just: (tail) => {
    //             return self.monad.list.at.call(self,tail)(index - 1);
    //           }
    //         });
    //       }
    //     };
    //   },
    //   generate: (alist) => {
    //     var self = this;
    //     var theList = alist;
    //     return (_) => {
    //       return self.algebraic.match.call(self,theList,{
    //         empty: (_) => {
    //           return self.monad.maybeMonad.nothing(); 
    //         },
    //         cons: (head,tail) => {
    //           theList = tail;
    //           return self.monad.maybeMonad.unit.call(self,head);
    //         }
    //       });
    //     };
    //   }
    // },
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
  either: either,

};
