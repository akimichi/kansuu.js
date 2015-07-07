"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');

describe("'stream' module", function() {
  describe("exists", function() {

  });
  describe("mkStream", function() {
    var intStream = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
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
    it("stream#take(n)", function(next) {
      var intStream = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      expect(((_)=> {
        var taken = __.stream.take.bind(__)(intStream)(1);
        return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([0]));
      })()).to.ok();
      expect(((_)=> {
        var taken = __.stream.take.bind(__)(intStream)(2);
        return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([0,1]));
      })()).to.ok();
      next();
    });
    describe("stream#unfold", function() {
      it("stream 10, 12, 14, 16...", function(next) {
        var stream = __.stream.unfold.bind(__)(5)((n) => {
          if(n < 10) {
            return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n*2)(n+1));
          } else {
            return __.monad.maybe.nothing;
          }
        });
        __.stream.censor(stream);
        expect(
          stream.value()
        ).to.eql(
          10
        );
        expect(((_)=> {
          var taken = __.stream.take.bind(__)(stream)(3);
          return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([10,12,14]));
        })()).to.ok();
        next();
      });
      // it("prime stream", function(next) {
      //    var stream = __.stream.unfold.bind(__)(2)((n) => {
      //      if(__.math.isPrime(n)) {
      //        return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n)(n+1));
      //      } else {
      //        return __.monad.maybe.nothing;
      //      }
      //    });
      //    __.stream.censor(stream);
      //    expect(((_)=> {
      //      var list = __.stream.take.bind(__)(stream)(10);
      //      return __.list.toArray.bind(__)(list);
      //    })()).to.eql(
      //      [2,3]
      //    );
      //    next();
      // });
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
    it("stream#constant", function(next) {
      var ones = __.stream.constant.bind(__)(1);
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
    it("stream#from", function(next) {
      var ints = __.stream.from.bind(__)(0);
      expect(
        ints.value()
      ).to.eql(
        0
      );
      expect(
        ints.next().value()
      ).to.eql(
        1
      );
      expect(
        ints.next().next().value()
      ).to.eql(
        2
      );
      next();
    });
    it("stream#exists", function(next) {
      var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      expect(
        __.stream.exists.bind(__)(ints)(n => {
          return n === 3;
        })
      ).to.eql(
        true
      );
      var evens = __.stream.mkStream.bind(__)([0,2,4]);
      expect(
        __.stream.exists.bind(__)(evens)(n => {
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
      expect(function(){
        var stream1 = __.stream.mkStream.bind(__)([3,1,2]);
        var stream2 = __.stream.mkStream.bind(__)([1,2,3]);
        return __.stream.isEqual.bind(__)(stream1)(stream2);
      }()).to.eql(
        false
      );
      expect(function(){
        var stream1 = __.stream.mkStream.bind(__)([1,2,3]);
        var stream2 = __.stream.mkStream.bind(__)([1,2,3,4,5]);
        return __.stream.isEqual.bind(__)(stream1)(stream2);
      }()).to.ok();
      expect(function(){
        var stream1 = __.stream.mkStream.bind(__)([1,2,3,4,5]);
        var stream2 = __.stream.mkStream.bind(__)([1,2,3]);
        return __.stream.isEqual.bind(__)(stream1)(stream2);
      }()).to.ok();
      next();
    });
    it("stream#merge", function(next) {
      var evens = __.stream.mkStream.bind(__)([0,2,4]);
      var odds = __.stream.mkStream.bind(__)([1,3,5]);
      var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      expect(
        __.stream.isEqual.bind(__)(__.stream.merge.bind(__)(evens)(odds))(ints)
      ).to.ok();
      next();
    });
    it("stream#filter", (next) => {
      var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      var evens = __.stream.mkStream.bind(__)([0,2,4]);
      var isEven = (n) => {
          return n % 2 === 0;
      };
      expect(
        __.stream.isEqual.bind(__)(__.stream.filter.bind(__)(ints)(isEven))(evens)
      ).to.ok();
      next();
    });
    it("stream#map", (next) => {
      var ints = __.stream.mkStream.bind(__)([0,1,2,3]);
      var double = (n) => {
        return n * 2;
      };
      expect(
        __.stream.isEqual.bind(__)(__.stream.map.bind(__)(ints)(double))(__.stream.mkStream.bind(__)([0,2,4,6]))
      ).to.ok();
      next();
    });
    it("stream#at", (next) => {
      expect(
        __.stream.at.call(__,
                          __.stream.iterate.call(__,
                                                 __.math.multiply(2))(1))(9)
      ).to.eql(
        512
      );
      next();
    });
    it("'stream#iterate'", (next) => {
      // Input: take 10 (iterate (2*) 1)
      // Output: [1,2,4,8,16,32,64,128,256,512]
      // expect(
      //   __.take.call(__,
      //                __.iterate.call(__,
      //                                __.math.multiply(2))(1))(10)
      // ).to.eql(
      //   [ [ 0, 1 ], [ 2, 3 ] ]
      // );
      expect(((_)=> {
        var answer = __.stream.take.call(__,
                                         __.stream.iterate.call(__,
                                                                __.math.multiply(2))(1))(10);
        return __.list.isEqual.call(__,
                                    answer)(__.list.mkList.call(__,
                                                                [1,2,4,8,16,32,64,128,256,512]));
      })()).to.ok();
      next();
    });
    /*
    it("stream#cons", function(next) {
      // var ones = function(){
      //    var self = this;
      //    return __.stream.cons.bind(__)(base.thunk(0))(base.thunk.bind(__)(self.ones));
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
