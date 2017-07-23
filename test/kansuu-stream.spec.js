"use strict";

const expect = require('expect.js');
const list = require('../lib/kansuu-list.js');
const Pair = require('../lib/kansuu-pair.js');
const Stream = require('../lib/kansuu-stream.js');


describe("'stream' module", () => {
  describe("mkStream", () => {
    var intStream = Stream.mkStream([0,1,2,3,4,5]);
    it("can make a stream", (next) => {
      // var stream = __.stream.mkStream.bind(__)(0)(function (n){
      //   return n + 1;
      // });
      expect(
        Stream.head(intStream)
      ).to.eql(0);
      expect(
        Stream.head(Stream.tail(Stream.tail(intStream)))
      ).to.eql(2);
      next();
    });
    it("stream#cons", (next) => {
      var two = () => {
        return Stream.cons(2, Stream.empty());
      };
      var astream = Stream.cons(1,two);
      expect(
        Stream.head(astream)
      ).to.eql(
        1
      );
      expect(
        Stream.head(Stream.tail(astream))
      ).to.eql(
        2
      );
      next();
    });
    it("'isEmpty'", (next) => {
      expect(
        Stream.isEmpty(Stream.empty())
      ).to.eql(
        true
      );
      expect(
        Stream.isEmpty(intStream)
      ).to.eql(
        false
      );
      next();
    });
    it("integer example", (next) => {
      // ints = 0,1,2,3,4,...
      var ints = Stream.mkStream([0,1,2,3,4,5]);
      expect(
        Stream.head(Stream.tail(Stream.tail(ints)))
      ).to.eql(2);
      next();
    });
    it("stream#take(n)", function(next) {
      var intStream = Stream.mkStream([0,1,2,3,4,5]);
      var takenOne = Stream.take(intStream)(1);
      expect(
        Stream.head(takenOne)
      ).to.equal(
        0 
      )
      // expect(((_)=> {
      //   var taken = __.stream.take.bind(__)(intStream)(2);
      //   return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([0,1]));
      // })()).to.ok();
      next();
    });
    // describe("stream#unfold", function() {
    //   it("stream 10, 12, 14, 16...", function(next) {
    //     var stream = __.stream.unfold.bind(__)(5)((n) => {
    //       if(n < 10) {
    //         return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n*2)(n+1));
    //       } else {
    //         return __.monad.maybe.nothing;
    //       }
    //     });
    //     __.stream.censor(stream);
    //     expect(
    //       stream.value()
    //     ).to.eql(
    //       10
    //     );
    //     expect(((_)=> {
    //       var taken = __.stream.take.bind(__)(stream)(3);
    //       return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([10,12,14]));
    //     })()).to.ok();
    //     next();
    //   });
    //   // it("prime stream", function(next) {
    //   //    var stream = __.stream.unfold.bind(__)(2)((n) => {
    //   //      if(math.isPrime(n)) {
    //   //        return __.monad.maybe.unit.bind(__)(__.pair.cons.bind(__)(n)(n+1));
    //   //      } else {
    //   //        return __.monad.maybe.nothing;
    //   //      }
    //   //    });
    //   //    __.stream.censor(stream);
    //   //    expect(((_)=> {
    //   //      var list = __.stream.take.bind(__)(stream)(10);
    //   //      return __.list.toArray.bind(__)(list);
    //   //    })()).to.eql(
    //   //      [2,3]
    //   //    );
    //   //    next();
    //   // });
    // });
    // it("stream#repeat", function(next) {
    //   var ones = __.stream.repeat.bind(__)(1);
    //   expect(
    //     ones.value()
    //   ).to.eql(
    //     1
    //   );
    //   expect(
    //     ones.next().next().value()
    //   ).to.eql(
    //     1
    //   );
    //   expect(
    //     ones.next().next().next().value()
    //   ).to.eql(
    //     1
    //   );
    //   next();
    // });
    // it("stream#constant", function(next) {
    //   var ones = __.stream.constant.bind(__)(1);
    //   expect(
    //     ones.value()
    //   ).to.eql(
    //     1
    //   );
    //   expect(
    //     ones.next().next().value()
    //   ).to.eql(
    //     1
    //   );
    //   expect(
    //     ones.next().next().next().value()
    //   ).to.eql(
    //     1
    //   );
    //   next();
    // });
    // it("stream#cycle", function(next) {
    //   // cycle(1 to 3) take 2
    //   var list =__.list.mkList.call(__,[1,2,3]);
    //   //var list =__.stream.mkStream.call(__,[1,2,3]);
    //   var cycle = __.stream.cycle.call(__,list);
    //   console.log(cycle);
    //   var taken = __.stream.take.call(__,cycle)(10);
    //   expect(((_) => {
    //     return __.list.isEqual.call(__,taken)(__.list.mkList.call(__,[10,12,14]));
    //   })()).to.ok();
    //   next();
    // });
    // it("stream#from", function(next) {
    //   var ints = __.stream.from.bind(__)(0);
    //   expect(
    //     ints.value()
    //   ).to.eql(
    //     0
    //   );
    //   expect(
    //     ints.next().value()
    //   ).to.eql(
    //     1
    //   );
    //   expect(
    //     ints.next().next().value()
    //   ).to.eql(
    //     2
    //   );
    //   next();
    // });
    it("stream#exists", function(next) {
      var ints = Stream.mkStream([0,1,2,3,4,5]);
      expect(
        Stream.exists(ints)(n => {
          return n === 3;
        })
      ).to.eql(
        true
      );
      // var evens = __.stream.mkStream.bind(__)([0,2,4]);
      // expect(
      //   __.stream.exists.bind(__)(evens)(n => {
      //     return (n % 2) === 1;
      //   })
      // ).to.eql(
      //   false
      // );
      next();
    });
    // it("stream#zip", function(next) {
    //   var evens = __.stream.mkStream.bind(__)([0,2,4]);
    //   var odds = __.stream.mkStream.bind(__)([1,3,5]);
    //   var zipped = __.stream.zip.bind(__)(evens)(odds);
    //   expect(
    //     zipped.value()
    //   ).to.eql(
    //     __.pair.mkPair.bind(__)(0)(1)
    //   );
    //   expect(
    //     zipped.next().value()
    //   ).to.eql(
    //     __.pair.mkPair.bind(__)(2)(3)
    //   );
    //   next();
    // });
    it("stream#isEqual", (next) => {
      var evens = Stream.mkStream([0,2,4]);
      var odds = Stream.mkStream([1,3,5]);
      // var zipped = __.stream.zip.bind(__)(evens)(odds);
      expect(function(){
        var stream1 = Stream.mkStream([1,2,3]);
        var stream2 = Stream.mkStream([1,2,3]);
        return Stream.isEqual(stream1,stream2);
      }()).to.eql(
        true
      );
      expect(function(){
        var stream1 = Stream.mkStream([3,1,2]);
        var stream2 = Stream.mkStream([1,2,3]);
        return Stream.isEqual(stream1,stream2);
      }()).to.eql(
        false
      );
      expect(function(){
        var stream1 = Stream.mkStream([1,2,3]);
        var stream2 = Stream.mkStream([1,2,3,4,5]);
        return Stream.isEqual(stream1,stream2);
      }()).to.not.ok();
      // expect(function(){
      //   var stream1 = __.stream.mkStream.bind(__)([1,2,3,4,5]);
      //   var stream2 = __.stream.mkStream.bind(__)([1,2,3]);
      //   return isEqual(stream1)(stream2);
      // }()).to.not.ok();
      next();
    });
    it("stream#append", (next) => {
      var evens = Stream.mkStream([0,2,4]);
      var odds = Stream.mkStream([1,3,5]);
      var ints = Stream.mkStream([0,2,4,1,3,5]);
      expect(
        Stream.isEqual(Stream.append(evens,odds),ints)
      ).to.ok();
      next();
    });
    it("stream#merge", function(next) {
      var evens = __.stream.mkStream.bind(__)([0,2,4]);
      var odds = __.stream.mkStream.bind(__)([1,3,5]);
      var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
      expect(
        isEqual(__.stream.merge.bind(__)(evens)(odds))(ints)
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
        isEqual(__.stream.filter.bind(__)(ints)(isEven))(evens)
      ).to.ok();
      next();
    });
    it("stream#map", (next) => {
      var ints = __.stream.mkStream.bind(__)([0,1,2,3]);
      var double = (n) => {
        return n * 2;
      };
      expect(
        isEqual(__.stream.map.bind(__)(ints)(double))(__.stream.mkStream.bind(__)([0,2,4,6]))
      ).to.ok();
      next();
    });
    it("stream#flatten", (next) => {
      var innerStream = mkStream.bind(__)([0,1]);
      var head = () => {
        return innerStream;
      };
      var tail = () => {
        return empty;
      };
      var stream = __.stream.cons.bind(__)(head)(tail);
      expect(
        isEqual(__.stream.flatten.call(__,stream))(innerStream)
      ).to.ok();
      next();
    });
    it("stream#flatMap", (next) => {
      var stream1 = mkStream([0,1]);
      var stream2 = mkStream([0,2]);
      var double = (n) => {
        return n * 2;
      };
      expect(
        isEqual(__.stream.flatMap.call(__,stream1)(function(n) {
          return mkStream([n * 2]);
        }))(stream2)).to.ok();
      next();
    });
    it("stream#at", (next) => {
      expect(
        __.stream.at.call(__,
                          __.stream.iterate.call(__,
                                                 math.multiply(2))(1))(9)
      ).to.eql(
        512
      );
      next();
    });

    // Input: take 10 (iterate (2*) 1)
    // Output: [1,2,4,8,16,32,64,128,256,512]
    it("'stream#iterate'", (next) => {
      this.timeout(5000);
      expect(((_)=> {
        var answer = __.stream.take.call(__,
                                         __.stream.iterate.call(__,
                                                                math.multiply(2))(1))(10);
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
