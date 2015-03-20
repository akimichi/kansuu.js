"use strict";

var qc = require("quickcheck");
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');


describe("'kansuu.js' package", function() {
  var propertyEven = function propertyEven(x) { 
	return x % 2 === 0; 
  };
  var arbEven = function arbEven() {
	var b = qc.arbByte();
	if (b % 2 === 0) { return b; }
	else { return (b + 1) % 256; }
  };
  var validInteger = function validInteger(s) {
	var i = parseInt(s, 10);
	return typeof i === "number" && !isNaN(i);
  };
  var arbDigits = function arbDigits(_) {
	var d = "",
	    fn = function () { return String.fromCharCode(48 + Math.floor(Math.random() * 10)); };
	while (d.length < 1) { d = qc.arbArray(fn); }
	return d;
  };
  var arbInterval = function arbInterval() {
	var a = Math.floor(Math.random() * 10);
	var b = Math.floor(Math.random() * 10);
	if (a < b) {
	  return __.pair.mkPair(a)(b); 
	} else { 
	  return __.pair.mkPair(b)(a); 
	}
  };
  describe("'list' module", function() {
	var array = qc.arbArray(function generator(){
	  return Math.floor(Math.random() * 10);
	});
	// it("reverse . reverse == id", function(next) {
	//   var equation = function(list){
	// 	return list === __.compose.bind(__)(__.reverse)(__.reverse)(list);
	//   };
	//   expect(
	// 	qc.forAll(equation, array)
	//   ).to.not.eql(true);
	//   next();
	// });
  });
});
