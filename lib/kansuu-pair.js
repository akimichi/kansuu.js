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

module.exports = {
  match: match,
  cons: cons,
  mkPair: mkPair,
  left: left,
  right: right,
  swap: swap
};

