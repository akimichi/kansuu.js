"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const List = require('./kansuu-list.js');


// 'string' module
// ==============
// const mkString = (string) => {
//     return {
//       type : 'string',
//       head : self.string.head(string),
//       tail : self.thunk(self.string.tail(string))
//     };
//   },
const head = (astring) => {
  expect(astring).to.a('string');
  // expect(self.isNonEmpty(astring)).to.be.ok();
  return astring[0];
};

const tail = (astring) => {
  expect(astring).to.a('string');
  // expect(self.isNonEmpty(string)).to.be.ok();
  return astring.substring(1);
};

const isEmpty = (astring) => {
  expect(astring).to.a('string');
  if(astring.length === 0) {
    return true;
  } else {
    return false;
  }
};

const toArray = (astring) => {
  expect(astring).to.a('string');
  return List.toArray(toList(astring));
  // var glue = (item) => {
  //   return (rest) => {
  //     return [item].concat(rest);
  //   };
  // };
  // return List.toArray(List.fromString(astring));
  // return List.reduce(astring)([])(glue);
};
const toList = (astring) => {
  const List = require('./kansuu-list.js');
  // expect(astring).to.a('string');

  if(isEmpty(astring) === true) {
    return List.empty();
  } else {
    return List.cons(head(astring), toList(tail(astring))); 
  }
  // var glue = (item) => {
  //   return (rest) => {
  //     return [item].concat(rest);
  //   };
  // };
  // return List.toArray(List.fromString(astring));
  // return List.reduce(astring)([])(glue);
};


module.exports = {
  head: head,
  tail: tail,
  isEmpty: isEmpty,
  toArray: toArray,
  toList: toList
};
