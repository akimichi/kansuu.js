"use strict";

var expect = require('expect.js');

module.exports = {
  nothing: function(_){
	return void(0); /* same as undefined */
  }(),
  fail: function(){
	throw new Error("should not be called");
  },
  thunk: function(x){
	return function(){
	  return x;
	};
  },
  id: function(any){
    return any;
  },
  succ: function(n){
    expect(n).to.a('number');
    return n + 1;
  },
};


