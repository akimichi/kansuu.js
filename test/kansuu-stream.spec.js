"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'stream' module", function() {
  describe("mkStream", function() {
	var stream = __.stream.mkStream.bind(__)(0)(function (n){
	  return n + 1;
	});
	it("can make a stream", function(next) {
	  // var stream = __.stream.mkStream.bind(__)(0)(function (n){
	  //   return n + 1;
	  // });
	  expect(
		stream.value
	  ).to.eql(0);
	  expect(
		stream.next().value
	  ).to.eql(1);
	  expect(
		stream.next().next().value
	  ).to.eql(2);
	  expect(
		stream.next().next().next().value
	  ).to.eql(3);
	  next();
	});
	it("can be checked by 'censor'", function(next) {
	  expect(
		__.stream.censor(stream)
	  ).to.eql(stream);
	  next();
	});
	it("integer example", function(next) {
	  // ints = 0,1,2,3,4,...
	  var ints = __.stream.mkStream.bind(__)(0)(function (n){
		return n + 1;
	  });
	  expect(
		ints.next().next().value
	  ).to.eql(2);
	  // double = 1,2,4,8,...
	  var doubles = __.stream.mkStream.bind(__)(1)(function (n){
		return 2*n;
	  });
	  expect(
		doubles.next().next().value
	  ).to.eql(4);
	  next();
	});
	it("random float example", function(next) {
	  var generate = function(seed){
		var seedrandom = require('seedrandom');
		var rng = seedrandom(seed);
		var stream = __.stream.mkStream.bind(__)(rng())(function (n){
		  return rng();
		});
		return stream;
	  };
	  var randoms = generate('init');
	  expect(
		randoms.value
	  ).to.eql(0.035281094681737984);
	  expect(
		randoms.next().value
	  ).to.eql(
		0.7063175514107337
	  );
	  next();
	});
	it("stream.take(n)", function(next) {
	  var ints = __.stream.mkStream.bind(__)(0)(function (n){
		return n + 1;
	  });
	  expect(
		ints.take(3)
	  ).to.eql([0,1,2]);
	  next();
	});
  });
  // it("integer example", function(next) {
  //   // ints = 0,1,2,3,4,...
  //   var ints = __.stream.next.bind(__)(0)(function (n){
  // 	return n + 1;
  //   });
  //   expect(
  // 	__.stream.head.bind(__)(__.stream.tail.bind(__)(__.stream.tail.bind(__)(ints)))
  //   ).to.eql(2);
  //   // double = 1,2,4,8,...
  //   var doubles = __.stream.next.bind(__)(1)(function (n){
  // 	return 2*n;
  //   });
  //   expect(
  // 	__.stream.head.bind(__)(__.stream.tail.bind(__)(__.stream.tail.bind(__)(doubles)))
  //   ).to.eql(4);
  //   next();
  // });
  // it("random float example", function(next) {
  //   var generate = function(seed){
  // 	var seedrandom = require('seedrandom');
  // 	var rng = seedrandom(seed);
  // 	var stream = __.stream.next.bind(__)(rng())(function (n){
  // 	  return rng();
  // 	});
  // 	return stream;
  //   };
  //   var randoms = generate('init');
  //   expect(
  // 	__.stream.head.bind(__)(randoms)
  //   ).to.eql(0.035281094681737984);
  //   expect(
  // 	__.stream.head.bind(__)(__.stream.tail.bind(__)(randoms))
  //   ).to.eql(
  // 	0.7063175514107337
  //   );
  //   next();
  // });
  // it("take(stream)(n)", function(next) {
  //   var ints = __.stream.next.bind(__)(0)(function (n){
  // 	return n + 1;
  //   });
  //   expect(
  // 	__.stream.take.bind(__)(ints)(3)
  //   ).to.eql([0,1,2]);
  //   next();
  // });
});
