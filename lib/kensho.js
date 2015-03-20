"use strict";

/*
  property-based test library
*/

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');

// module.exports = {
//   ints: function(init){
// 	__.stream.next.bind(__)(init)(function (n){
// 	  return n + 1;
// 	});
//   },
//   forAll: function (stream) {
// 	return function(predicate){
// 	  var generators = Array.prototype.slice.call(arguments, 1),
// 		  fn = function (f) { return f(); },
// 		  i,
// 		  values;
// 	  __.reduce(stream)(true)(function(item){
// 	  	return function(accumulator){
// 	  	};
// 	  };
// 	  for (i = 0; i < 100; i++) {
// 		values = generators.map(fn);
// 		if (!property.apply(null, values)) {
// 		  return values;
// 		}
// 	  }
// 	  return true;
// 	}
// };
