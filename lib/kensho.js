"use strict";

/*
  property-based test library
*/

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');

module.exports = {
  ints: function(init){
	expect(init).to.a('number');
	return __.stream.mkStream.bind(__)(init)(function (n){
	  return n + 1;
	});
  },
  forAll: function (list) {
	expect(list).to.an('array');
	return function(predicate){
	  expect(predicate).to.a('function');
	  return __.reduce.bind(__)(list)(true)(function(item){
	  	return function(accumulator){
		  return predicate(item) && accumulator;
	  	};
	  });
	};
  }
  // forAll: function (stream) {
  // 	return function(predicate){
  // 	  var list = __.stream.take.bind(__)(stream)(10);
  // 	  return __.reduce.bind(__)(list)(true)(function(item){
  // 	  	return function(accumulator){
  // 		  return (predicate(item) && accumulator);
  // 	  	};
  // 	  });
  // 	};
  // }
};
