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
    return cons(head, empty);
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

const toArray = (alist) => {
  return foldr(alist)([])((item) => {
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

  
};

