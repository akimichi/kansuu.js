"use strict";

const expect = require('expect.js'),
  math = require('../lib/kansuu-math.js'),
  List = require('../lib/kansuu-monad.js').list,
  Pair = require('../lib/kansuu-pair.js'),
  Stream = require('../lib/kansuu-stream.js'),
  Maybe = require('../lib/kansuu-monad.js').maybe;


describe("'stream' module", () => {
  describe("mkStream", () => {
    var intStream = Stream.mkStream([0,1,2,3,4,5]);
    it("can make a stream", (next) => {
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
    it("stream#take", (next) => {
      const intStream = Stream.mkStream([0,1,2,3,4,5]);
      const takenOne = Stream.take(intStream)(1);

      expect(
        Stream.head(takenOne)
      ).to.equal(
        0 
      )
      expect(
        List.toArray(Stream.take(intStream)(0))
      ).to.eql(
        []
      );
      expect(
        List.toArray(Stream.take(intStream)(1))
      ).to.eql(
        [0]
      );
      expect(
        List.toArray(Stream.take(intStream)(2))
      ).to.eql(
        [0,1]
      );
      expect(((_)=> {
        var taken = Stream.take(intStream)(2);
        return List.isEqual(taken, List.mkList([0,1]));
      })()).to.ok();
      next();
    });
    describe("stream#unfold", () =>  {
      it("stream 10, 12, 14, 16...", (next) =>  {
        var stream = Stream.unfold(5)(n => {
          if(n < 10) {
            return Maybe.unit(Pair.cons(n*2, n+1));
          } else {
            return Maybe.nothing();
          }
        });
        expect(
          Stream.head(stream)
        ).to.eql(
          10
        );
        // expect(((_)=> {
        //   var taken = __.stream.take.bind(__)(stream)(3);
        //   return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([10,12,14]));
        // })()).to.ok();
        next();
      });
      it("prime stream", (next) => {
        const primes = Stream.cons(2, (_) => {
          const stream = Stream.unfold(3)(n => {
            return Maybe.just(Pair.cons(n, n+1));
          });
          return Stream.filter(stream)(math.isPrime); 
        });
        expect(
          List.toArray(Stream.take(primes)(20))
        ).to.eql(
          [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71]
        );
        next();
      });
    });
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
    it("stream#merge", (next) => {
      var evens = Stream.mkStream([0,2,4]);
      var odds = Stream.mkStream([1,3,5]);
      var ints = Stream.mkStream([0,1,2,3,4,5]);
      expect(
        Stream.isEqual(Stream.merge(evens,odds),ints)
      ).to.ok();
      next();
    });
    it("stream#filter", (next) => {
      var ints = Stream.mkStream([0,1,2,3,4,5]);
      var evens = Stream.mkStream([0,2,4]);
      var isEven = (n) => {
          return n % 2 === 0;
      };
      expect(
        Stream.isEqual(Stream.filter(ints)(isEven),evens)
      ).to.ok();
      next();
    });
    it("stream#map", (next) => {
      var ints = Stream.mkStream([0,1,2,3]);
      var double = (n) => {
        return n * 2;
      };
      expect(
        Stream.isEqual(Stream.map(ints)(double),
          Stream.mkStream([0,2,4,6]))
      ).to.ok();
      next();
    });
    it("stream#flatten", (next) => {
      var innerStream = Stream.mkStream([0,1]);
      var nestedStream = Stream.cons(innerStream, (_) => {
        return Stream.empty();
      });
      expect(
        Stream.isEqual(Stream.flatten(nestedStream),innerStream)
      ).to.ok();
      next();
    });
    it("stream#flatMap", (next) => {
      var stream1 = Stream.mkStream([0,1]);
      var stream2 = Stream.mkStream([0,2]);
      var double = (n) => {
        return n * 2;
      };
      expect(
        Stream.isEqual(Stream.flatMap(stream1)(n =>  {
          return Stream.mkStream([n * 2]);
        }), stream2)).to.ok();
      next();
    });
    // it("stream#at", (next) => {
    //   expect(
    //     Stream.at(Stream.iterate(math.multiply(2))(1))(9)
    //   ).to.eql(
    //     512
    //   );
    //   next();
    // });

    // // Input: take 10 (iterate (2*) 1)
    // // Output: [1,2,4,8,16,32,64,128,256,512]
    // it("'stream#iterate'", (next) => {
    //   this.timeout(5000);
    //   expect(((_)=> {
    //     var answer = __.stream.take.call(__,
    //                                      __.stream.iterate.call(__,
    //                                                             math.multiply(2))(1))(10);
    //     return __.list.isEqual.call(__,
    //                                 answer)(__.list.mkList.call(__,
    //                                                             [1,2,4,8,16,32,64,128,256,512]));
    //   })()).to.ok();
    //   next();
    // });
    /*
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
});
