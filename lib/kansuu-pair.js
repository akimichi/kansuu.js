"use strict";

const expect = require('expect.js');


// pair module
// ==============
const match = (data, pattern) => {
  return data(pattern);
};
// pair.cons
const cons = (left, right) => {
  return (pattern) => {
    return pattern.cons(left, right);
  };
};


const empty = (_) => {
  return (pattern) => {
    return pattern.empty();
  }
};

const isEmpty = (pair) => {
  return match(pair,{
    empty: (_) => {
      return true;
    }, 
    cons: (left, right) => {
      return false;
    }
  });
};

const mkPair = (left) => {
  return (right) => {
    return cons(left,right);
  };
};

const left = (apair) => {
  return match(apair, {
    cons: (left, right) => {
      return left;
    }
  });
};
const right = (apair) => {
  return match(apair, {
    cons: (left, right) => {
      return right;
    }
  });
};

const swap = (apair) => {
  return cons(right(apair),left(apair));
};

const toArray = (apair) => {
  return match(apair, {
    empty: (_) => {
      return [];
    },
    cons: (left, right) => {
      return [left, right];
    }
  });
};

module.exports = {
  match: match,
  cons: cons,
  empty: empty,
  mkPair: mkPair,
  left: left,
  right: right,
  swap: swap,
  toArray: toArray,
  isEmpty: isEmpty
};

