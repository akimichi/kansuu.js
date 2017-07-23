"use strict";

const expect = require('expect.js');


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

const  head = (alist) => {
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
const fromString = (string) => {
  expect(string).to.a('string');
  return mkList(string.toArray(string));
};

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
  return foldl(alist)(empty())(cons);
  // if(self.list.isEmpty.bind(self)(list)){
  //   return list;
  // } else {
  //   return self.list.snoc.bind(self)(list.head)(self.list.reverse.bind(self)(list.tail));
  // }
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

const toArray = (alist) => {
  return foldr(alist)([])(item => {
    return (accumulator) => {
      return [item].concat(accumulator); 
    };
  });
};

module.exports = {
  match: match,
  empty: empty,
  cons: cons,
  head: head,
  tail: tail,
  mkList: mkList,
  fromArray: fromArray,
  fromString: fromString,
  append: append,
  toArray: toArray,
  foldr: foldr,
  foldl: foldl,
  reduce: reduce,
  take: take,
  length: length,
  last: last,
  reverse: reverse,
  at: at,  
  concat: concat,
  
};

