"use strict";

var qc = require("quickcheck");
var ks = require("../lib/kensho.js");
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');


// describe("'kansuu.js' package", function() {
//   var propertyEven = function propertyEven(x) { 
// 	return x % 2 === 0; 
//   };
//   describe("'forAll'", function() {
// 	it("forAll(ints)(> 0)", function(next) {
// 	  var stream = ks.ints(0);
// 	  var list = __.stream.take.bind(__)(stream)(10);
// 	  expect(
// 		ks.forAll(list)(__.math.isMoreThan(0))
// 	  ).to.eql(false);
// 	  next();
// 	});
// 	// it("forAll(ints)(> 0)", function(next) {
// 	//   expect(
// 	// 	ks.forAll(ks.ints(0))(__.math.isMoreThan(0))
// 	//   ).to.not.ok();
// 	//   next();
// 	// });
//   });
// });
// describe("'quickcheck' library", function() {
//   describe("'forAll'", function() {
// 	it("forAll(ints)(> 0)", function(next) {
// 	  var stream = ks.ints(0);
// 	  var list = __.stream.take.bind(__)(stream)(10);
//   	  expect(
// 		qc.forAll(__.math.isMoreThan(0), list)
//   	  ).to.not.eql(true);
// 	  next();
// 	});
//   });
// });
	// describe("'list' module", function() {
  	//   var array = qc.arbArray(function generator(){
  	// 	return Math.floor(Math.random() * 10);
  	//   });
  	// it("reverse . reverse == id", function(next) {
  	//   var equation = function(list){
  	// 	return list === __.compose.bind(__)(__.reverse)(__.reverse)(list);
  	//   };
  	//   expect(
  	// 	qc.forAll(equation, array)
  	//   ).to.not.eql(true);
  	//   next();
  	// });
