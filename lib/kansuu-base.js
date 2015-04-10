"use strict";

var expect = require('expect.js');

module.exports = {
  nothing: ((_) => {
	return void(0); /* same as undefined */
  })(),
  fail: () => {
	throw new Error("should not be called");
  },
  thunk: (x) => {
	return function(){
	  return x;
	};
  },
  id: (any) => {
    return any;
  },
  succ: (n) => {
    expect(n).to.a('number');
    return n + 1;
  },
};


