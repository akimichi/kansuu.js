"use strict";

var qc = require("quickcheck");
var expect = require('expect.js');
var __ = require('../index.js');


describe("quickcheck", function() {
  var propertyEven = function propertyEven(x) { 
	return x % 2 === 0; 
  }
  var arbEven = function arbEven() {
	var b = qc.arbByte();
	if (b % 2 === 0) { return b; }
	else { return (b + 1) % 256; }
  }
  var validInteger = function validInteger(s) {
	var i = parseInt(s, 10);
	return typeof i === "number" && !isNaN(i);
  }
  var arbDigits = function arbDigits() {
	var d = "",
	    fn = function () { return String.fromCharCode(48 + Math.floor(Math.random() * 10)); };
	while (d.length < 1) { d = qc.arbArray(fn); }
	return d;
  }
  describe("forAll", function() {
	it("random numbers should not all be even", function() {
	  expect(
		qc.forAll(propertyEven, qc.arbByte)
	  ).to.not.eql(true);
	});
	it("random even numbers should all be even", function() {
	  expect(
		qc.forAll(propertyEven, arbEven)
	  ).to.eql(true);
	});
	it("random strings should not all be valid numbers", function() {
	  expect(
		qc.forAll(validInteger, qc.arbString)
	  ).to.not.eql(true);
	});
	it("random digits should all be valid numbers", function() {
	  expect(
		qc.forAll(validInteger, arbDigits)
	  ).to.eql(true);
	});
	// describe("range", function(){
	//   it("random digits should all be valid numbers", function() {
	// 	expect(function(min, max) {
	// 	  return min < max;
	// 	}).forAll(qc.range())
	// 	// expect(
	// 	//   qc.forAll(validInteger, arbDigits)
	// 	// ).to.eql(true);
	//   });
	// });
  });
});
