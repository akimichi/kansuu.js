"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');
const Maybe = require('./kansuu-monad.js').maybe;
const List = require('./kansuu-monad.js').list;

// 'stream' module
// ==============
//
//  c.f. https://gist.github.com/kana/5344530
//

const match = (data, pattern) => {
  return data(pattern);
};

// stream#empty
const empty = (_) => {
  return (pattern) => {
    return pattern.empty();
  };
};
// stream#cons
const cons = (head,tail) => {
  expect(tail).to.a('function');

  return (pattern) => {
    return pattern.cons(head, tail);
  };
};

const mkStream = (array) => {
  expect(array).to.an('array');
  if(array.length === 0){
    return empty();
  } else {
    return cons(array[0],(_) => {
      const tail = array.slice(1,array.length);
      return mkStream(tail);
    });
  }
};

const head = (astream) => {
  return match(astream, {
    empty: (_) => {
      return undefined;
    },
    cons: (head, tail) => {
      return head;
    }
  });
};

const tail = (astream) => {
  return match(astream, {
    empty: (_) => {
      return undefined;
    },
    cons: (x, xs) => {
      expect(xs).to.a('function');
      return match(xs, {
        empty: (_) => {
          return undefined;
        },
        cons: (head, tail) => {
          return cons(head,tail);
        }
      });
    }
  });
};

const isEmpty = (astream) => {
  return match(astream, {
    empty: (_) => {
      return true;
    },
    cons: (head, tail) => {
      return false;
    }
  });
};

// ### stream#take
// stream.take :: Stream[A] => Int => List[A]
const take = (astream) => {
  return (n) => {
    expect(n).to.a('number');
    expect(n).to.be.greaterThan(-1);

    if(n === 0) {
        return List.empty();
    } else {
      return match(astream, {
        empty: (_) => {
          return List.empty();
        },
        cons: (head, tail) => {
          if (n === 1) { 
            return List.unit(head);
          } else {
            return List.cons(head, take(tail())(n-1));
          }
        }
      });
    }
  };
};
// ### stream#reduce
const reduce = (astream) => {
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');

      return match(astream, {
        empty: (_) => {
          return accumulator;
        },
        cons: (head, tail) => {
          return glue(head)(reduce(tail())(accumulator)(glue));
        }
      });
    };
  };
};

// ### stream#exists
const exists = (astream) => {
  return (predicate) => {
    return reduce(astream)(false)((item) =>{
      return (accumulator) => {
        return accumulator || predicate(item);
      };
    });
  };
};
// ### stream#isEqual
/* #@range_begin(stream_isEqual) */
const isEqual = (stream1,stream2) => {
  const compare = (streamX, streamY) => {
    return match(streamX, {
      empty: (_) => {
        return match(streamY, {
          empty: (_) => {
            return true;
          },
          cons: (x, xs) => {
            return false;
          }
        });
      },
      cons: (x, xs) => {
        return match(streamY, {
          empty: (_) => {
            return false;
          },
          cons: (y, ys) => {
            if(x === y) {
              return compare(xs(),ys());
            } else {
              return false;
            }
          }
        });
      }
    });
  };
  return compare(stream1,stream2);
};
// ### stream#append
const append = (stream1,stream2) => {
  return match(stream1, {
    empty: (_) => {
      return stream2;
    },
    cons: (x, xs) => {
      return match(stream2, {
        empty: (_) => {
          return stream1;
        },
        cons: (y, ys) => {
          return cons(x, (_) => {
            return append(xs(),stream2);
          });
        }
      });
    }
  });
};

//     if(self.stream.isEmpty.call(self,stream1)) {
//       return stream2;
//     }
//     if(self.stream.isEmpty.call(self,stream2)) {
//       return stream1;
//     }
//     var x = () => {
//       return stream1.value();
//     };
//     var xs = () => {
//       return stream1.next();
//     };
//     return self.stream.cons.call(self,
//         x)(() => {
//       return self.stream.append.call(self,
//           xs())(stream2)});
  
// ### stream#merge
//
// ~~~haskell
// merge :: [T] => [T] => [T]
// merge (x:xs) (y:ys) | x < y  = x:merge xs (y:ys)
//                     | x == y  = x:merge xs ys
//                     | x > y  = y:merge (x:xs) ys
//~~~
const merge = (stream1,stream2) => {
  return match(stream1, {
    empty: (_) => {
      return stream2;
    },
    cons: (x, xs) => {
      return match(stream2, {
        empty: (_) => {
          return stream1;
        },
        cons: (y, ys) => {
          if(x < y) {
            return cons(x,() => {
              return merge(xs(),stream2);
            });
          } else {
            if(x === y) {
              return cons(x,() => {
                return merge(xs(),ys());
              });
            } else {
              return cons(y, () => {
                return merge(stream1,ys());
              });
            }
          }
        }
      });
    }
  });
};
// ### stream#filter
// ~~~haskell
// filter :: (a -> Bool) -> [a] -> [a]
// filter p []                 = []
// filter p (x:xs) | p x       = x : filter p xs
//                 | otherwise = filter p xs
// ~~~
const filter = (astream) => {
  return (predicate) => {
    expect(predicate).to.a('function');

    return match(astream, {
      empty: (_) => {
        return astream;
      },
      cons: (x, xs) => {
        if(predicate(x) === true) {
          return cons(x, (_) => {
            return filter(xs())(predicate);
          });
        } else {
          return filter(xs())(predicate);
        }
      }
    });
  };
};
// ### stream#map
const map = (astream) => {
  return (transform) => {
    return reduce(astream)(empty())(item => {
      return (accumulator) => {
        return cons(transform(item), (_) => {
          return accumulator;
        });
      };
    });
  };
};
// ## stream#flatten
const flatten = (astream) => {
  return match(astream, {
    empty: (_) => {
      return empty();
    },
    cons: (x, xs) => {
      return append(x, flatten(xs()));
    }
  });
};
// ### stream#flatMap
// ~~~haskell
// flatMap xs f = flatten (map f xs)
//~~~
const flatMap = (astream) => {
  return (transform) => {
    return flatten(map(astream)(transform));
  };
};

// ### stream#at
// stream.at :: Stream[A] => Int => A
const at = (astream) => {
  return (n) => {
    expect(n).to.a('number');
    expect(n).to.be.greaterThan(-1);
    return match(astream, {
      empty: (_) => {
        throw new Error;
        // return empty();
      },
      cons: (x, xs) => {
        if (n === 0) {
          return x;
        } else {
          return at(xs())(n-1);
        }
      }
    });
  };
};

// ### stream#unfold
// stream.unfold :: A => (A => maybe[pair[B,A]]) => Stream[B]
// ~~~scala
// def unfold[A, B](start: B)(f: B => Option[Pair[A,B]]): Stream[A] = f(start) match {
//    case Some((elem, next)) => elem #:: unfold(next)(f)
//    case None => empty
// }
// ~~~
const unfold = (start) => {
  return (fun) => { //  (A => maybe[pair[B,A]])
    expect(fun).to.a('function');
    var maybe = fun(start);
    return Maybe.match(maybe, {
      just: (value) => {
        const elem = Pair.left(value);
        return cons(elem, (_) => {
          return unfold(Pair.right(value))(fun);
        });
        //return cons(elem,next);
      },
      nothing: (_) => {
        return empty();
      }
    });
  };
};
    // // ### stream#valueOption
    // valueOption: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   if(self.stream.isEmpty(stream)){
    //     return base.nothing;
    //   } else {
    //     return self.monad.maybe.unit.bind(self)(stream.value());
    //   }
    // },
    // // ### stream#zip
    // // stream.zip :: Stream[T] => Stream[U] => Stream[Pair[T,U]]
    // //
    // // c.f. "Thinking Functionally with Haskell",p.73
    // //
    // // ~~~haskell
    // // zip (x:xs) (y:ys) = (x,y) : zip xs ys
    // // zip _ _           = []
    // // ~~~
    // zip: (stream1) => {
    //   var self = this;
    //   self.stream.censor(stream1);
    //   return (stream2) => {
    //     self.stream.censor(stream2);
    //     if(self.stream.isEmpty.bind(self)(stream1)){
    //       return self.stream.empty;
    //     }
    //     if(self.stream.isEmpty.bind(self)(stream2)){
    //       return self.stream.empty;
    //     }
    //     var x = stream1.value;
    //     var xs = stream1.next;
    //     var y = stream2.value;
    //     var ys = stream2.next;
    //     var head = () => {
    //       return self.pair.mkPair.bind(self)(x())(y());
    //     };
    //     return self.stream.cons.bind(self)(head)(function(){
    //       return self.stream.zip.bind(self)(xs())(ys());
    //     });
    //   };
    // },
    // // ### stream#iterate
    // /*
    //    'iterate' @f x@ returns an infinite list of repeated applicationsof @f@ to @x@:
    //    -- > iterate f x == [x, f x, f (f x), ...]

    //    ~~~haskell
    //    iterate :: (a -> a) -> a -> [a]
    //    iterate f x =  x : iterate f (f x)
    //    ~~~
    //    */
    // iterate: (func) => {
    //   var self = this;
    //   expect(func).to.a('function');
    //   return (arg) => {
    //     var head = () => {
    //       return arg;
    //     };
    //     var tail = () => {
    //       return self.stream.iterate.call(self,
    //           func)(func.call(self,
    //               arg));
    //     };
    //     return self.stream.cons.call(self,
    //         head)(tail);
    //   };
    // },

    // // ### stream#constant
    // constant:(any) => {
    //   var self = this;
    //   return self.stream.unfold.bind(self)(any)((x) => {
    //     return self.monad.maybe.unit.bind(self)(self.pair.cons.bind(self)(x)(x));
    //   });
    // },
    // // ### stream#cycle
    // // def cycle[T](a:Iterable[T]) = Stream.const(a).flatMap(v=>v)
    // cycle: (list) => {
    //   var self = this;
    //   return self.stream.flatMap.call(self,self.stream.constant.call(self,list))((n) => {
    //     return n;
    //   });
    // },
    // // ### stream#from
    // from:(n) => {
    //   expect(n).to.a('number');
    //   var self = this;
    //   return self.stream.unfold.bind(self)(n)((x) => {
    //     return self.monad.maybe.unit.bind(self)(self.pair.cons.bind(self)(x)(x+1));
    //   });
    // },
    // // ### stream#repeat
    // // repeat :: T => Stream[T]
    // repeat: (any) => {
    //   var self = this;
    //   return self.stream.unfold.bind(self)(any)((n) => {
    //     return self.monad.maybe.unit.bind(self)(self.pair.cons.bind(self)(n)(n));
    //   });
    // },

    // // ### stream#scan
    // //
    // //  'scan' yields a stream of successive reduced values from:
    // //
    // // -- > scan f z [x1, x2, ...] == [z, z `f` x1, (z `f` x1) `f` x2, ...]
    // // scan :: (a -> b -> a) -> a -> Stream b -> Stream a
    // // scan f z ~(Cons x xs) =  z <:> scan f (f z x) xs
    // //
    // // (stream-scan + 0 (stream-from 1))
    // // ⇒ (stream 0 1 3 6 10 15 …)
    // // (stream-scan * 1 (stream-from 1))
    // // ⇒ (stream 1 1 2 6 24 120 …)
    // scan: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   return (accumulator) => {
    //     return (glue) => {
    //       expect(glue).to.a('function');
    //       var head = stream.value();
    //       if(self.stream.isEmpty.call(self,stream)) {
    //         return accumulator;
    //         //return glue(item)(accumulator);
    //       } else {
    //         var next = stream.next();

    //         //return glue(head)(self.stream.scan.call(self,next)(accumulator)(glue));
    //       }
    //     };
    //   };
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
module.exports = {
  match: match,
  empty: empty,
  cons: cons,
  head: head,
  tail: tail,
  isEmpty: isEmpty,
  mkStream: mkStream,
  take: take,
  exists: exists,
  isEqual: isEqual,
  append: append,
  merge: merge,
  filter: filter,
  map: map,
  flatten: flatten,
  flatMap: flatMap,
  at: at,
  unfold: unfold
};

