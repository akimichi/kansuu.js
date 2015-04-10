"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');

describe("'stream' module", function() {
  describe("exists", function() {
	
  });
  describe("mkStream", function() {
	var intStream = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
    // var intStream = __.stream.mkStream.bind(__)(0)(function (n){
    //   return n + 1;
    // });
    it("can make a stream", function(next) {
      // var stream = __.stream.mkStream.bind(__)(0)(function (n){
      //   return n + 1;
      // });
      expect(
        intStream.value()
      ).to.eql(0);
      expect(
        intStream.next().value()
      ).to.eql(1);
      expect(
        intStream.next().next().value()
      ).to.eql(2);
      expect(
        intStream.next().next().next().value()
      ).to.eql(3);
      next();
    });
    it("can be checked by 'censor'", function(next) {
      expect(
        __.stream.censor(intStream)
      ).to.eql(intStream);
      next();
    });
    it("'isEmpty'", function(next) {
	  var empty = __.stream.empty;
      expect(
        __.stream.isEmpty(empty)
      ).to.eql(
		true
	  );
      expect(
        __.stream.isEmpty(intStream)
      ).to.eql(
		false
	  );
      next();
    });
    it("integer example", function(next) {
      // ints = 0,1,2,3,4,...
	  var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      // var ints = __.stream.mkStream.bind(__)(0)(function (n){
      //   return n + 1;
      // });
      expect(
        ints.next().next().value()
      ).to.eql(2);
      // double = 1,2,4,8,...
	  var doubles = __.stream.mkStream.bind(__)([1,2,4,8,16]);
      // var doubles = __.stream.mkStream.bind(__)(1)(function (n){
      //   return 2*n;
      // });
      expect(
        doubles.next().next().value()
      ).to.eql(4);
      next();
    });
    it("stream#repeat", function(next) {
	  var ones = __.stream.repeat.bind(__)(1);
      expect(
        ones.value()
      ).to.eql(
		1
	  );
      expect(
        ones.next().next().value()
      ).to.eql(
		1
	  );
      expect(
        ones.next().next().next().value()
      ).to.eql(
		1
	  );
      next();
    });
    it("stream#exists", function(next) {
	  var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      expect(
        __.stream.exists.bind(__)(ints)(function(n){
		  return n === 3;
		})
      ).to.eql(
		true
	  );
	  var evens = __.stream.mkStream.bind(__)([0,2,4]);
      expect(
        __.stream.exists.bind(__)(evens)(function(n){
		  return (n % 2) === 1;
		})
      ).to.eql(
		false
	  );
      next();
    });
    it("stream#zip", function(next) {
	  var evens = __.stream.mkStream.bind(__)([0,2,4]);
	  var odds = __.stream.mkStream.bind(__)([1,3,5]);
	  var zipped = __.stream.zip.bind(__)(evens)(odds);
      expect(
        zipped.value()
      ).to.eql(
		__.pair.mkPair.bind(__)(0)(1)
	  );
      expect(
        zipped.next().value()
      ).to.eql(
		__.pair.mkPair.bind(__)(2)(3)
	  );
      next();
    });
    it("stream#isEqual", function(next) {
	  var evens = __.stream.mkStream.bind(__)([0,2,4]);
	  var odds = __.stream.mkStream.bind(__)([1,3,5]);
	  var zipped = __.stream.zip.bind(__)(evens)(odds);
      expect(function(){
		var stream1 = __.stream.mkStream.bind(__)([1,2,3]);
		var stream2 = __.stream.mkStream.bind(__)([1,2,3]);
		return __.stream.isEqual.bind(__)(stream1)(stream2);
      }()).to.eql(
		true
	  );
      next();
    });
    // it("stream#merge", function(next) {
	//   var evens = __.stream.mkStream.bind(__)([0,2,4]);
	//   var odds = __.stream.mkStream.bind(__)([1,3,5]);
	//   var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
    //   expect(
    //     __.stream.merge.bind(__)(evens)(odds)
    //   ).to.eql(
	// 	ints
	//   );
    //   next();
    // });
	/*
    it("stream#cons", function(next) {
      // var ones = function(){
	  // 	var self = this;
	  // 	return __.stream.cons.bind(__)(base.thunk(0))(base.thunk.bind(__)(self.ones));
	  // };
	  var fromEnum = {
		one: function(from){
		  var self = this;
		  return  __.stream.cons.bind(__)(base.thunk(from))(base.thunk.bind(__)(self.one(from)));
		}
	  };
      expect(
        ones().value()
      ).to.eql(
        0
      );
      expect(
        ones().next().value()
      ).to.eql(
        0
      );
      next();
    });
    it("random float example", function(next) {
      var generate = function(seed){
        var seedrandom = require('seedrandom');
        var rng = seedrandom(seed);
		var stream = __.stream.cons.bind(__)(base.thunk(rng()))(base.thunk.bind(__)(stream));
        // var stream = __.stream.mkStream.bind(__)(rng())(function (n){
        //   return rng();
        // });
        return stream;
      };
      var randoms = generate('init');
      expect(
        randoms.value()
      ).to.eql(0.035281094681737984);
      expect(
        randoms.next().value()
      ).to.eql(
        0.7063175514107337
      );
      next();
    });
    it("stream#take(n)", function(next) {
      var ints = __.stream.cons.bind(__)(base.thunk(0))(function (n){
        return n + 1;
      });
      var listUpto3 = __.stream.take.bind(__)(ints)(3);
      expect(
        listUpto3.head
      ).to.eql(
        0
      );
      expect(
        listUpto3.tail.head
      ).to.eql(
        1
      );
      expect(
        __.list.length.bind(__)(listUpto3)
      ).to.eql(
        3
      );
      next();
    });
	 */
  });
  // it("integer example", function(next) {
  //   // ints = 0,1,2,3,4,...
  //   var ints = __.stream.next.bind(__)(0)(function (n){
  //    return n + 1;
  //   });
  //   expect(
  //    __.stream.head.bind(__)(__.stream.tail.bind(__)(__.stream.tail.bind(__)(ints)))
  //   ).to.eql(2);
  //   // double = 1,2,4,8,...
  //   var doubles = __.stream.next.bind(__)(1)(function (n){
  //    return 2*n;
  //   });
  //   expect(
  //    __.stream.head.bind(__)(__.stream.tail.bind(__)(__.stream.tail.bind(__)(doubles)))
  //   ).to.eql(4);
  //   next();
  // });
  // it("random float example", function(next) {
  //   var generate = function(seed){
  //    var seedrandom = require('seedrandom');
  //    var rng = seedrandom(seed);
  //    var stream = __.stream.next.bind(__)(rng())(function (n){
  //      return rng();
  //    });
  //    return stream;
  //   };
  //   var randoms = generate('init');
  //   expect(
  //    __.stream.head.bind(__)(randoms)
  //   ).to.eql(0.035281094681737984);
  //   expect(
  //    __.stream.head.bind(__)(__.stream.tail.bind(__)(randoms))
  //   ).to.eql(
  //    0.7063175514107337
  //   );
  //   next();
  // });
  // it("take(stream)(n)", function(next) {
  //   var ints = __.stream.next.bind(__)(0)(function (n){
  //    return n + 1;
  //   });
  //   expect(
  //    __.stream.take.bind(__)(ints)(3)
  //   ).to.eql([0,1,2]);
  //   next();
  // });
});
