"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const string = require('./kansuu-string.js');

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

    return match(astream, {
      empty: (_) => {
        return empty();
      },
      cons: (head, tail) => {
        if (n === 0) {
          return empty(); 
        } else {
          return cons(head, take(tail)(n-1));
          // var nextStream = stream.next();
          // return self.list.cons.bind(self)(stream.value())(self.stream.take.bind(self)(nextStream)(n-1));
        }
      }
    });
  };
};
//
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
    // // ### stream#at
    // // stream.at :: Stream[A] => Int => A
    // at: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   return (n) => {
    //     expect(n).to.a('number');
    //     expect(n).to.be.greaterThan(-1);
    //     if (n === 0) {
    //       return stream.value();
    //     } else {
    //       var nextStream = stream.next();
    //       return self.stream.at.call(self,
    //           nextStream)(n-1);
    //     }
    //   };
    // },

    // // ### stream#unfold
    // // stream.unfold :: A => (A => maybe[pair[B,A]]) => Stream[B]
    // // ~~~scala
    // // def unfold[A, B](start: B)(f: B => Option[Pair[A,B]]): Stream[A] = f(start) match {
    // //    case Some((elem, next)) => elem #:: unfold(next)(f)
    // //    case None => empty
    // // }
    // // ~~~
    // unfold: (start) => {
    //   var self = this;
    //   return (fun) => { //  (A => maybe[pair[B,A]])
    //     expect(fun).to.a('function');
    //     var maybe = fun(start);
    //     self.monad.maybe.censor(maybe);
    //     if(self.existy(maybe.just)){
    //       var elem = ((_) => {
    //         return maybe.just.left;
    //       });
    //       var next = ((_) => {
    //         return self.stream.unfold.bind(self)(maybe.just.right)(fun);
    //       });
    //       var stream = self.stream.cons.bind(self)(elem)(next);
    //       return stream;
    //     } else {
    //       return self.stream.empty;
    //     }
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
    // // ### stream#map
    // map: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   return (transform) => {
    //     return self.stream.reduce.bind(self)(stream)(self.stream.empty)((item) => {
    //       return (accumulator) => {
    //         var value = (_) => {
    //           return transform(item);
    //         };
    //         var tail = (_) => {
    //           return accumulator;
    //         };
    //         return self.stream.cons.bind(self)(value)(tail);
    //       };
    //     });
    //   };
    // },
    // // ## stream#flatten
    // flatten: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   if(self.stream.isEmpty.call(self,stream)){
    //     return self.stream.empty;
    //   } else {
    //     return self.stream.append.call(self,stream.value())(self.stream.flatten.call(self,stream.next()));
    //   }

    // },
    // // ### stream#flatMap
    // // ~~~haskell
    // // flatMap xs f = flatten (map f xs)
    // //~~~
    // flatMap: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   return (transform) => {
    //     return self.stream.flatten.call(self,
    //         self.stream.map.call(self,
    //           stream)(transform));
    //   };
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
    // // ### stream#merge
    // //
    // // ~~~haskell
    // // merge :: [T] => [T] => [T]
    // // merge (x:xs) (y:ys) | x < y  = x:merge xs (y:ys)
    // //                     | x == y  = x:merge xs ys
    // //                     | x > y  = y:merge (x:xs) ys
    // //~~~
    // merge: (stream1) => {
    //   var self = this;
    //   self.stream.censor(stream1);
    //   return function(stream2){
    //     self.stream.censor(stream2);
    //     var x = stream1.value;
    //     var xs = stream1.next;
    //     var y = stream2.value;
    //     var ys = stream2.next;
    //     if(x() < y()) {
    //       return self.stream.cons.bind(self)(x)(function(){
    //         return self.stream.merge.bind(self)(xs())(stream2);
    //       });
    //     } else {
    //       if(x() === y()) {
    //         return self.stream.cons.bind(self)(x)(function(){
    //           return self.stream.merge.bind(self)(xs())(ys());
    //         });
    //       } else {
    //         return self.stream.cons.bind(self)(y)(function(){
    //           return self.stream.merge.bind(self)(stream1)(ys());
    //         });

    //       }
    //     };
    //   };
    // },
    // // ### stream#filter
    // // ~~~haskell
    // // filter :: (a -> Bool) -> [a] -> [a]
    // // filter p []                 = []
    // // filter p (x:xs) | p x       = x : filter p xs
    // //                 | otherwise = filter p xs
    // // ~~~
    // filter: (stream) => {
    //   var self = this;
    //   self.stream.censor(stream);
    //   return function(predicate){
    //     expect(predicate).to.a('function');
    //     if(self.stream.isEmpty.bind(self)(stream)){
    //       return stream;
    //     } else {
    //       var value = stream.value;
    //       var next = stream.next;
    //       if(self.truthy(predicate(value()))){
    //         var tail = function(){
    //           return self.stream.filter.bind(self)(next())(predicate);
    //         };
    //         return self.stream.cons.bind(self)(value)(tail);
    //       } else {
    //         return self.stream.filter.bind(self)(next())(predicate);
    //       }
    //     }
    //   };
    // },


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
};

