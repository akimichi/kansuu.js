"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var math = require('../lib/kansuu-math.js');


describe("'stream' module", function() {
  var isEqual = __.stream.isEqual.bind(__);
  var empty = __.stream.empty;
  var mkStream = __.stream.mkStream.bind(__);
  var toArray = __.list.toArray.bind(__);

  it("stream#cons", (next) => {
    var one = 1;
    var two = () => {
      return {
        type : 'stream',
        value : 2,
        next : __.stream.empty
      };
      // return 2;
    };
    var stream = __.stream.cons.call(__,one)(two);
    expect(
      __.stream.head.call(__,stream)
    ).to.eql(
      1
    );
    expect(
      __.compose.call(__,__.stream.head)(__.stream.tail)(stream)
    ).to.eql(
      2
    );
    // expect(
    //   __.stream.tail.call(__,stream)
    // ).to.eql(
    //   2
    // );
    next();
  });
  it("'isEmpty'", function(next) {
    var one = 1;
    var two = () => {
      return {
        type : 'stream',
        value : 2,
        next : __.stream.empty
      };
    };
    var stream = __.stream.cons.call(__,one)(two);
    expect(
      __.stream.isEmpty.call(__,empty)
    ).to.eql(
      true
    );
    expect(
      __.stream.isEmpty.call(__,stream)
    ).to.eql(
      false
    );
    next();
  });
  it("stream#isEqual", function(next) {
    this.timeout(5000);
    var one = 1;
    var two = () => {
      return {
        type : 'stream',
        value : 2,
        next : __.stream.empty
      };
    };
    var stream = __.stream.cons.call(__,one)(two);

    expect(function(){
      var actual = __.stream.tail.call(__,stream);
      var expected = two;
      return isEqual(actual)(two);
    }()).to.eql(
      true
    );
    expect(function(){
      var stream1 = mkStream([1,2,3]);
      var stream2 = mkStream([1,2,3]);
      return isEqual(stream1)(stream2);
    }()).to.eql(
      true
    );
    expect(function(){
      var stream1 = mkStream([3,1,2]);
      var stream2 = mkStream([1,2,3]);
      return isEqual(stream1)(stream2);
    }()).to.eql(
      false
    );
    expect(function(){
      var stream1 = mkStream([1,2,3]);
      var stream2 = mkStream([1,2,3,4,5]);
      return isEqual(stream1)(stream2);
    }()).to.not.ok();
    expect(function(){
      var stream1 = mkStream([1,2,3,4,5]);
      var stream2 = mkStream([1,2,3]);
      return isEqual(stream1)(stream2);
    }()).to.not.ok();
    next();
  });
  describe("mkStream", function() {
    var intStream = __.stream.mkStream.call(__,[0,1,2,3,4,5]);
    it("can make a stream", function(next) {
      expect(
        __.stream.head.call(__,intStream)
      ).to.eql(0);
      expect(
        __.compose.call(__,__.stream.head)(__.stream.tail)(intStream)
      ).to.eql(1);
      expect(
        __.compose.call(__,__.stream.head)(__.compose.call(__,__.stream.tail)(__.stream.tail))(intStream)
      ).to.eql(2);
      next();
    });
  });
  it("stream#censor", function(next) {
    var intStream = __.stream.mkStream.call(__,[0,1,2,3,4,5]);
    expect(
      __.stream.censor.call(__,intStream)
    ).to.eql(intStream);
    next();
  });
  // it("take(stream)(n)", function(next) {
  //    var ints = __.stream.next.bind(__)(0)(function (n){
  //      return n + 1;
  //    });
  //    expect(
  //      __.stream.take.bind(__)(ints)(3)
  //    ).to.eql([0,1,2]);
  //    next();
  // });
  it("stream#append", function(next) {
    var evens = mkStream([0,2,4]);
    var odds = mkStream([1,3,5]);
    var ints = mkStream([0,2,4,1,3,5]);
    expect(
      isEqual(__.stream.append.call(__,evens)(odds))(ints)
    ).to.ok();
    next();
  });
  it("stream#take(stream)(n)", function(next) {
    var intStream = mkStream([0,1,2,3,4,5]);
    expect(((_)=> {
      var taken = __.stream.take.call(__,intStream)(1);
      return __.list.isEqual.call(__,taken)(__.list.mkList.bind(__)([0]));
    })()).to.ok();
    expect(((_)=> {
      var taken = __.stream.take.call(__,intStream)(2);
      return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([0,1]));
    })()).to.ok();
    expect(((_)=> {
      var taken = __.stream.take.call(__,intStream)(3);
      return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([0,1,2]));
    })()).to.ok();
    next();
  });
  it("stream#zip", function(next) {
    var evens = __.stream.mkStream.bind(__)([0,2,4]);
    var odds = __.stream.mkStream.bind(__)([1,3,5]);
    var zipped = __.stream.zip.bind(__)(evens)(odds);
    expect(
      __.stream.head.call(__,zipped)
    ).to.eql(
      __.pair.mkPair.bind(__)(0)(1)
    );
    expect(
      __.compose.call(__,__.stream.head)(__.stream.tail)(zipped)
    ).to.eql(
      __.pair.mkPair.bind(__)(2)(3)
    );
    next();
  });
  it("stream#at", (next) => {
    var intStream = __.stream.mkStream.call(__,[0,1,2,3,4,5]);
    expect(
      __.stream.at.call(__,intStream)(0)
    ).to.eql(
      0
    );
    expect(
      __.stream.at.call(__,intStream)(2)
    ).to.eql(
      2
    );
    // expect(
    //   __.stream.at.call(__,
    //                     __.stream.iterate.call(__,
    //                                            math.multiply(2))(1))(9)
    // ).to.eql(
    //   512
    // );
    next();
  });
  describe("stream#unfold", function() {
    it("stream 10, 12, 14, 16...", function(next) {
      var stream = __.stream.unfold.call(__,5)((n) => {
        if(n < 10) {
          return __.monad.maybe.unit.call(__,__.pair.cons.call(__,n*2)(n+1));
        } else {
          return __.monad.maybe.nothing;
        }
      });
      expect(
        __.stream.head.call(__,stream)
      ).to.eql(
        10
      );
      expect(((_)=> {
        var taken = __.stream.take.call(__,stream)(1);
        return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([10]));
      })()).to.ok();
      expect(((_)=> {
        var taken = __.stream.take.call(__,stream)(3);
        return __.list.isEqual.bind(__)(taken)(__.list.mkList.bind(__)([10,12,14]));
      })()).to.ok();
      next();
    });
    // it("prime stream", function(next) {
    //    var stream = __.stream.unfold.bind(__)(2)((n) => {
    //      if(math.isPrime(n)) {
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
  it("stream#constant", function(next) {
    var ones = __.stream.constant.call(__,1);
    expect(
      __.stream.head.call(__,ones)
    ).to.eql(
      1
    );
    expect(
      __.compose.call(__,__.stream.head)(__.stream.tail)(ones)
      //ones.next().next().value()
    ).to.eql(
      1
    );
    expect(
      __.compose.call(__,__.stream.head)(__.compose.call(__,__.stream.tail)(__.stream.tail))(ones)
    ).to.eql(
      1
    );
    next();
  });
  // Input: take 10 (iterate (2*) 1)
  // Output: [1,2,4,8,16,32,64,128,256,512]
  it("'stream#iterate'", (next) => {
    this.timeout(5000);
    expect(
      toArray(
        __.stream.take.call(__,
                            __.stream.iterate.call(__,
                                                   math.multiply(2))(1))(10)
      )
    ).to.eql(
      [1,2,4,8,16,32,64,128,256,512]
    )
    // expect(((_)=> {
    //   var answer = __.stream.take.call(__,
    //                                    __.stream.iterate.call(__,
    //                                                           math.multiply(2))(1))(10);
    //   return __.list.isEqual.call(__,
    //                               answer)(__.list.mkList.call(__,
    //                                                           [1,2,4,8,16,32,64,128,256,512]));
    // })()).to.ok();
    next();
  });
  it("stream#repeat", function(next) {
    var ones = __.stream.repeat.call(__,1);
    expect(
      __.stream.head.call(__,ones)
    ).to.eql(
      1
    );

    expect(
      __.compose.call(__,__.stream.head)(__.stream.tail)(ones)
    ).to.eql(
      1
    );
    next();
  });
  it("stream#map", (next) => {
    var ints = __.stream.mkStream.bind(__)([0,1,2,3]);
    var double = (n) => {
      return n * 2;
    };
    expect(
      isEqual(__.stream.map.call(__,ints)(double))(__.stream.mkStream.bind(__)([0,2,4,6]))
    ).to.ok();
    next();
  });
  it("stream#flatten", (next) => {
    var innerStream = mkStream([0,1]);
    // var head = () => {
    //   return innerStream;
    // };
    // var tail = () => {
    //   return empty;
    // };
    // var stream = __.stream.cons.bind(__)(head)(tail);
    var stream = __.stream.cons.call(__,innerStream)(empty);
    expect(
      isEqual(__.stream.flatten.call(__,stream))(innerStream)
    ).to.ok();
    next();
  });
  // it("integer example", function(next) {
  //   // ints = 0,1,2,3,4,...
  //   var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
  //   // var ints = __.stream.mkStream.bind(__)(0)(function (n){
  //   //   return n + 1;
  //   // });
  //   expect(
  //     ints.next().next().value()
  //   ).to.eql(2);
  //   // double = 1,2,4,8,...
  //   var doubles = __.stream.mkStream.bind(__)([1,2,4,8,16]);
  //   // var doubles = __.stream.mkStream.bind(__)(1)(function (n){
  //   //   return 2*n;
  //   // });
  //   expect(
  //     doubles.next().next().value()
  //   ).to.eql(4);
  //   next();
  // });
  // // it("stream#cycle", function(next) {
  // //   // cycle(1 to 3) take 2
  // //   var list =__.list.mkList.call(__,[1,2,3]);
  // //   //var list =__.stream.mkStream.call(__,[1,2,3]);
  // //   var cycle = __.stream.cycle.call(__,list);
  // //   console.log(cycle);
  // //   var taken = __.stream.take.call(__,cycle)(10);
  // //   expect(((_) => {
  // //     return __.list.isEqual.call(__,taken)(__.list.mkList.call(__,[10,12,14]));
  // //   })()).to.ok();
  // //   next();
  // // });
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
  // it("stream#exists", function(next) {
  //   var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
  //   expect(
  //     __.stream.exists.bind(__)(ints)(n => {
  //       return n === 3;
  //     })
  //   ).to.eql(
  //     true
  //   );
  //   var evens = __.stream.mkStream.bind(__)([0,2,4]);
  //   expect(
  //     __.stream.exists.bind(__)(evens)(n => {
  //       return (n % 2) === 1;
  //     })
  //   ).to.eql(
  //     false
  //   );
  //   next();
  // });
  // it("stream#merge", function(next) {
  //   var evens = __.stream.mkStream.bind(__)([0,2,4]);
  //   var odds = __.stream.mkStream.bind(__)([1,3,5]);
  //   var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
  //   expect(
  //     isEqual(__.stream.merge.bind(__)(evens)(odds))(ints)
  //   ).to.ok();
  //   next();
  // });
  // it("stream#filter", (next) => {
  //   var ints = __.stream.mkStream.bind(__)([0,1,2,3,4,5]);
  //   var evens = __.stream.mkStream.bind(__)([0,2,4]);
  //   var isEven = (n) => {
  //     return n % 2 === 0;
  //   };
  //   expect(
  //     isEqual(__.stream.filter.bind(__)(ints)(isEven))(evens)
  //   ).to.ok();
  //   next();
  // });
  // it("stream#flatMap", (next) => {
  //   var stream1 = mkStream([0,1]);
  //   var stream2 = mkStream([0,2]);
  //   var double = (n) => {
  //     return n * 2;
  //   };
  //   expect(
  //     isEqual(__.stream.flatMap.call(__,stream1)(function(n) {
  //       return mkStream([n * 2]);
  //     }))(stream2)).to.ok();
  //   next();
  // });
  // /*
  //  it("stream#cons", function(next) {
  //  // var ones = function(){
  //  //    var self = this;
  //  //    return __.stream.cons.bind(__)(base.thunk(0))(base.thunk.bind(__)(self.ones));
  //  // };
  //  var fromEnum = {
  //  one: function(from){
  //  var self = this;
  //  return  __.stream.cons.bind(__)(base.thunk(from))(base.thunk.bind(__)(self.one(from)));
  //  }
  //  };
  //  expect(
  //  ones().value()
  //  ).to.eql(
  //  0
  //  );
  //  expect(
  //  ones().next().value()
  //  ).to.eql(
  //  0
  //  );
  //  next();
  //  });
  //  it("random float example", function(next) {
  //  var generate = function(seed){
  //  var seedrandom = require('seedrandom');
  //  var rng = seedrandom(seed);
  //  var stream = __.stream.cons.bind(__)(base.thunk(rng()))(base.thunk.bind(__)(stream));
  //  // var stream = __.stream.mkStream.bind(__)(rng())(function (n){
  //  //   return rng();
  //  // });
  //  return stream;
  //  };
  //  var randoms = generate('init');
  //  expect(
  //  randoms.value()
  //  ).to.eql(0.035281094681737984);
  //  expect(
  //  randoms.next().value()
  //  ).to.eql(
  //  0.7063175514107337
  //  );
  //  next();
  //  });
  //  */
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
