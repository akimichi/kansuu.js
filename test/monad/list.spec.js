"use strict";

const expect = require('expect.js'),
  math = require('../../lib/kansuu.js').math,
  List = require('../../lib/kansuu-monad.js').list,
  Pair = require('../../lib/kansuu-pair.js');

describe("'List' module", () => {

  var fixtures = {
    ints: List.mkList([0,1,2,3])
  };

  describe("mkList", () => {
    it("fromString", (next) => {
      var theList = List.fromString("this is a string");
      expect(
        List.head(theList)
      ).to.eql(
        't'
      );
      // expect(
      //   theList.tail.head
      // ).to.eql(
      //   'h'
      // );
      // expect(
      //   list.fromString("これは文字列です").head
      // ).to.eql(
      //   'こ'
      // );
      // expect(
      //   list.fromString("これは文字列です").tail.head
      // ).to.eql(
      //   'れ'
      // );
      next();
    });
  });
  describe("'List#isEqual'", () => {
    it("'isEqual' to be true", (next) => {
      expect(function(){
        var list1 = List.mkList([2,0,3,1]);
        var list2 = List.mkList([2,0,3,1]);
        return List.isEqual(list1,list2);
      }()).to.eql(
        true
      );
      next();
    });
    it("'isEqual' to be false when two list have different length", (next) => {
      expect(function(){
        var list1 = List.mkList([2,0,3,1,4]);
        var list2 = List.mkList([2,0,3,1]);
        return List.isEqual(list1,list2);
      }()).to.eql(
        false
      );
      expect(function(){
        var list1 = List.mkList([2,0,3,1]);
        var list2 = List.mkList([2,0,3,1,4]);
        return List.isEqual(list1,list2);
      }()).to.eql(
        false
      );
      next();
    });
    it("'isEqual' to be false", (next) => {
      expect(function(){
        var list1 = List.mkList([2,0,3,1]);
        var list2 = List.mkList([0,2,3,1]);
        return List.isEqual(list1,list2);
      }()).to.eql(
        false
      );
      next();
    });
  });
  it("'cons' should construct a list object", (next) => {
    const alist = List.cons(0,List.empty);
    expect(
      List.head(alist)
    ).to.eql(
      0
    );
    expect(
      List.tail(alist)
    ).to.eql(
      List.empty
    );
    next();
  });
  it("'list#head' should return the head of a list", function(next) {
    const alist = List.mkList([0,1,2,3]);
    expect(
      List.head(alist)
    ).to.eql(
      0
    );
    next();
  });
  it("'list#tail' should return the tail of a list", (next) => {
    const alist = List.mkList([0,1,2,3]);
    expect(
      List.head(List.tail(alist))
    ).to.eql(
      1
    );
    next();
  });
  it("'list#toArray'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.toArray(alist)
    ).to.eql(
      [0,1,2,3]
    );
    next();
  });
  it("'list#toString'", (next) => {
    var alist = List.mkList(['a','b','c']);
    expect(
      List.toString(alist)
    ).to.eql(
      "abc" 
    );
    next();
  });
  it("'list#last'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.last(alist)
    ).to.eql(
      3
    );
    next();
  });
  it("'list#at'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.at(alist)(0)
    ).to.eql(
      0
    );
    expect(
      List.at(alist)(1)
    ).to.eql(
      1
    );
    expect(
      List.at(alist)(2)
    ).to.eql(
      2
    );
    next();
  });

  it("'list#concat'", (next) => {
    var list1 = List.mkList([0,1]);
    var list2 = List.mkList([2,3]);
    var result = List.concat(list1)(list2);
    expect(
      List.length(result)
    ).to.eql(
      4
    );
    expect(
      List.toArray(List.take(result)(4))
    ).to.eql(
      [0,1,2,3]
    );
    next();
  });
  it("'list#reverse'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    var result = List.reverse(alist);
    expect(
      List.head(result)
    ).to.eql(
      3
    );
    expect(
      List.length(result)
    ).to.eql(
      4
    );
    next();
  });
  it("'list#concat'", (next) => {
    expect(function(){
      var list1 = List.mkList([0,1]);
      var list2 = List.mkList([2,3]);
      return List.toArray(List.concat(list1)(list2));
    }()).to.eql(
      [0,1,2,3]
    );
    next();
  });
  it("'list#map'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    var result = List.map(alist)(item => {
      return item + 10;
    });
    expect(
      List.head(result)
    ).to.eql(
      10
    );
    expect(
      List.head(List.tail(result))
    ).to.eql(
      11
    );
    expect(
      List.length(result)
    ).to.eql(
      4
    );
    // expect(function(){
    //   __.list.map.bind(__)(__.list.empty)(function(item){
    //   return item + 10;
    // });
    // }()).to.eql(
    //   4
    // );
    next();
  });
  // ~~~scala
  //   for(val x <- m1
  //     val y <- m2)
  //   yield {x + y}
  //
  // becomes...
  //
  // m1.flatMap { x =>  m2.map { y =>
  //                             unit (x+y) }}
  // ~~~
  it("'list#flatMap'", (next) => {
    /*
    scala> val nestedNumbers = List(List(1, 2), List(3, 4))
    scala> nestedNumbers.flatMap(x => x.map(_ * 2))
    res0: List[Int] = List(2, 4, 6, 8)
     */
    var mkList = List.mkList;
    var flatMap = List.flatMap;
    var map = List.map;
    var nestedNumbers = mkList([mkList([1, 2]), mkList([3, 4])]);
    var toArray = List.toArray;
    var flattened = flatMap(nestedNumbers)((x) => {
      return map(x)(n => {
        return n * 2;
      });
    });
    expect(
      toArray(flattened)
    ).to.eql(
      [2,4,6,8]
    );
    next();
  });

  it("'list#filter'", (next) => {
    var even = (n) => {
      return (n % 2) === 0;
    };
    var alist = List.mkList([0,1,2,3,4]);
    var result = List.filter(alist)(even);
    expect(
      List.toArray(result)
    ).to.eql(
      [0,2,4]
    );
    var odd = (n) => {
      return (n % 2) !== 0;
    };
    expect(
      List.toArray(List.filter(alist)(odd))
    ).to.eql(
      [1,3]
    );
    next();
  });
  // it("'list#find'", (next) => {
  //   var odd = (n) => {
  //     return (n % 2) !== 0;
  //   };
  //   var list = __.list.mkList.call(__,[0,1,2,3,4]);
  //   expect(
  //     __.list.find.call(__,list)(odd)
  //   ).to.eql(
  //     __.monad.maybe.unit.call(__,1)
  //   );
  //   next();
  // });
  it("'list.zip' should zip two lists", (next) => {
    var keys = List.mkList(["a","b","c"]);
    var values = List.mkList([1,2,3]);
    var zipped = List.zip(keys)(values);
    expect(
      List.length(zipped)
    ).to.eql(
      3
    );
    // expect(
    //   list.toArray(zipped)
    // ).to.eql(
    //   []
    // );
    next();
  });
  it("'list#pairs'", (next) => {
    // > pairs [1, 2, 3, 4]
    // [(1, 2), (2, 3), (3, 4)]
    const alist = List.mkList([1,2,3,4]);
    const pairs = List.pairs(alist);
    expect(
      List.length(pairs)
    ).to.eql(
      3 
    );
    next();
  });
  // it("'list.zipWith' should zip two lists",(next) => {
  //   var keys = List.mkList(["a","b","c"]);
  //   var values = List.mkList([1,2,3]);
  //   var zippedWithPair = List.zipWith(Pair.cons(keys,values));
  //   expect(
  //     List.length(zippedWithPair)
  //   ).to.eql(
  //     3
  //   );
  //   // expect(
  //   //   __.list.toArray.bind(__)(zippedWithPair)
  //   // ).to.eql(
  //   //   [ { type: 'pair', left: 'a', right: 1 },
  //   //     { type: 'pair', left: 'b', right: 2 },
  //   //     { type: 'pair', left: 'c', right: 3 } ]
  //   // );
  //   next();
  // });
  it("'list#length'", (next) => {
    const alist = List.mkList([0,1,2,3]);
    expect(
      List.length(alist)
    ).to.eql(
      4
    );
    expect(
      List.length(List.empty())
    ).to.eql(
      0
    );
    next();
  });
  it("'list#take'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.toArray(List.take(alist)(2))
    ).to.eql(
      [0,1]
    );
    next();
  });
  it("'list#drop'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.toArray(List.drop(alist)(2))
    ).to.eql(
      [2,3]
    );
    next();
  });
  // it("'list#splitAt' はリストのn番目の要素で分割する", (next) => {
  //   this.timeout(5000);
  //   const alist = list.fromArray([0,1,2,3]);
  //   expect(
  //     list.toArray(list.splitAt(alist)(2))
  //   ).to.eql(
  //     [[0,1],[2,3]]
  //   );
  //   next();
  // });
  // it("'list#shred'", (next) => {
  //   this.timeout(5000);
  //   var list = __.list.fromArray.call(__,[0,1,2,3,4,5]);
  //   expect(
  //     __.list.toArray.call(__,__.list.shred.call(__,list)(2))
  //   ).to.eql(
  //     [[0,1],[2,3],[4,5]]
  //   );
  //   next();
  // });
  // it("'list#shuffle'", (next) => {
  //   this.timeout(5000);
  //   var listA = __.list.fromArray.call(__,[0,1,2]);
  //   var listB = __.list.fromArray.call(__,[3,4,5]);
  //   expect(
  //     __.list.toArray.call(__,__.list.shuffle.call(__,listA)(listB))
  //   ).to.eql(
	  // [ 0, 3, 1, 4, 2, 5 ]
  //   );
  //   next();
  // });
  it("'list#init'", (next) => {
    var alist = List.mkList([0,1,2,3]);
    expect(
      List.toArray(List.init(alist))
    ).to.eql(
      [0,1,2]
    );
    next();
  });
  it("'list#sum'", (next) => {
    const alist = List.mkList([0,1,2,3]);
    expect(
      List.sum(alist)
    ).to.eql(
      6
    );
    next();
  });
  describe("folding higher-functions", () => {
    it("'list#foldr'", (next) => {
      var alist = List.mkList([0,1,2,3]);
      expect(
        List.foldr(alist)(0)((item) => {
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.eql(
        6
      );
      next();
    });
    it("'list#foldr1'", (next) => {
      // foldr1 g [a,b,c,d] = a ‘g‘ (b ‘g‘ (c ‘g‘ d))
      // foldr1 (+) [1,2,3,4] === 10
      expect(
        List.foldr1(List.mkList([1,2,3,4]))(math.add)
      ).to.eql(
        10 
      );
      // foldr1 (/) [12] === 12.0
      expect(
        List.foldr1(List.mkList([12]))(math.div)
      ).to.eql(
        12 
      );
      // > foldr1 (-) [1, 2, 3, 4] :: Int
      // -2 
      expect(
        List.foldr1(List.mkList([1,2,3,4]))(math.subtract)
      ).to.eql(
        -2 
      );
      next();
    });
    it("'list#foldl'", (next) => {
      var alist = List.mkList([0,1,2,3]);
      expect(
        List.foldl(alist)(0)((item) => {
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.eql(
        6
      );
      next();
    });
    it("'list#reduce'", (next) => {
      var alist = List.mkList([0,1,2,3]);
      expect(
        List.reduce(alist)(0)((item) => {
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.eql(
        6
      );
      next();
    });
  });
  // it("'list#and'", function(next) {
  //   expect(function(){
  //     var list = __.list.mkList.bind(__)([true,true]);
  //     return __.list.and.bind(__)((list));
  //   }()).to.eql(
  //     true
  //   );
  //   expect(function(){
  //     var list = __.list.mkList.bind(__)([false,false]);
  //     return __.list.and.bind(__)((list));
  //   }()).to.eql(
  //     false
  //   );
  //   expect(function(){
  //     var list = __.list.mkList.bind(__)([true,false]);
  //     return __.list.and.bind(__)((list));
  //   }()).to.eql(
  //     false
  //   );
  //   expect(function(){
  //     var list = __.list.mkList.bind(__)([false,true]);
  //     return __.list.and.bind(__)((list));
  //   }()).to.eql(
  //     false
  //   );
  //   next();
  // });
  // it("'list#or'", function(next) {
  //   var mkList = __.list.mkList.bind(__);
  //   var or = __.list.or.bind(__);
  //   expect(function(){
  //     return or(mkList([true,true]));
  //   }()).to.eql(
  //     true
  //   );
  //   expect(function(){
  //     return or(mkList([false,false]));
  //   }()).to.eql(
  //     false
  //   );
  //   expect(function(){
  //     return or(mkList([true,false]));
  //   }()).to.eql(
  //     true
  //   );
  //   expect(function(){
  //     return or(mkList([false,true]));
  //   }()).to.eql(
  //     true
  //   );
  //   next();
  // });
  // it("'list#all'", function(next) {
  //   var mkList = __.list.mkList.bind(__);
  //   var all = __.list.all.bind(__);
  //   var even = function(n){
  //     return (n % 2) === 0;
  //   };
  //   expect(function(){
  //     return all(mkList([2,4,6]))(even);
  //   }()).to.eql(
  //     true
  //   );
  //   next();
  // });
  // it("'list#any'", function(next) {
  //   var mkList = __.list.mkList.bind(__);
  //   var any = __.list.any.bind(__);
  //   var even = function(n){
  //     return (n % 2) === 0;
  //   };
  //   expect(function(){
  //     return any(mkList([1,3,6]))(even);
  //   }()).to.eql(
  //     true
  //   );
  //   next();
  // });
  describe("'list#append'", () => {
    var listX = List.mkList([0,2,4]);
    var listY = List.mkList([1,3,5]);
    it("append(xs)(ys)", (next) => {
      var appended = List.append(listX)(listY);
      expect(
        List.toArray(appended)
      ).to.eql(
        [ 0,2,4,1,3,5]
      );
      next();
    });
    it("append(xs)(empty) == xs", (next) => {
      var appended = List.append(listX)(List.empty());
      expect(
        List.toArray(appended)
      ).to.eql(
        [ 0, 2, 4 ]
      );
      next();
    });
    it("append(empty)(xs) == xs", (next) => {
      var appended = List.append(List.empty())(listX);
      expect(
        List.toArray(appended)
      ).to.eql(
        [ 0, 2, 4 ]
      );
      next();
    });
    it("append([0])([1]) == [0,1]", (next) => {
      expect(
        List.isEqual(List.append(List.mkList([0]))(List.mkList([1])), List.mkList([0,1]))
      ).to.ok();
      next();
    });
  });
  it("'list#merge'", function(next) {
    var listX = List.mkList([0,2,4]);
    var listY = List.mkList([1,3,5]);
    var merged = List.merge(listX)(listY);
    expect(
      List.toArray(merged)
    ).to.eql(
      [ 0, 1, 2, 3, 4, 5 ]
    );
    next();
  });
  it("'list#halve'", function(next) {
    var alist = List.mkList([0,1,2,3]);
    var result = List.halve(alist);
    expect(
      List.toArray(Pair.left(result))
    ).to.eql(
      [ 0, 1 ]
    );
    expect(
      List.toArray(Pair.right(result))
    ).to.eql(
      [ 2,3 ]
    );
    next();
  });
  it("'list#sort'", (next) => {
    // this.timeout(5000);
    expect(function(){
      var alist = List.mkList([2,0,3,1]);
      return List.toArray(List.sort(alist));
    }()).to.eql(
      [0,1,2,3]
    );
    expect(function(){
      var nil = List.empty();
      return List.toArray(List.sort(nil));
    }()).to.eql(
      []
    );
    next();
  });
  // it("'list#replicate'", function(next) {
  //   expect(
  //     toArray(__.list.replicate.bind(__)(3)("a"))
  //   ).to.eql(
  //     ["a","a","a"]
  //   );
  //   next();
  // });
  it("'list#unfold'", (next) => {
    // this.timeout(5000);
    //  unfoldr (\b -> if b == 0 then Nothing else Just (b, b-1)) 10
    //  > [10,9,8,7,6,5,4,3,2,1]
    var id = (x) => {
      return x;
    };
    var prev = (x) => {
      return x - 1;
    };
    var isZero = (n) => {
      return n === 0;
    };
    expect(
      List.toArray(List.unfold(isZero)(id)(prev)(10))
    ).to.eql(
      [10,9,8,7,6,5,4,3,2,1]
    );

    //  fibonacci :: [Integer]
    //  fibonacci = unfoldr (\[a,b] -> Just(a+b,[b,b+a])) [0,1]
    //
    //  Prelude> take 10 fibonacci
    //  [1,2,3,5,8,13,21,34,55,89]
    //
    // var fibonacci = ((initialList) => {
    //   var always = (list) => {
    //     // return true;
    //     var zeroth = __.list.at.call(__,list)(0);
    //     // var first = __.list.at.call(__,list)(1);
    //     return zeroth > 10;
    //   };
    //   var mapper = (list) => {
    //     var zeroth = __.list.at.call(__,list)(0);
    //     var first = __.list.at.call(__,list)(1);
    //     return zeroth + first;
    //   };
    //   var next = (list) => {
    //     var zeroth = __.list.at.call(__,list)(0);
    //     var first = __.list.at.call(__,list)(1);
    //     return __.list.mkList.call(__,[first,zeroth + first]);
    //   };
    //   return __.list.unfold.call(__, always)(mapper)(next)(initialList);
    // })(__.list.mkList.call(__,[0,1]));
    // expect(
    //   toArray(__.list.take.call(__,fibonacci)(5))
    // ).to.eql(
    //   [10,9,8,7,6,5,4,3,2,1]
    // );
    next();
  });
  // it("'list#range'", (next) => {
  //   expect(
  //     toArray(__.list.range.call(__,0)(5))
  //   ).to.eql(
  //     [0,1,2,3,4,5]
  //   );
  //   next();
  // });
  describe("functor laws on list", function() {
    var alist = List.mkList([0,1,2,3]);
    // it("map id == id", (next) => {
    //   expect(
    //     toArray(map(list)(__.id))
    //   ).to.eql(
    //     toArray(__.id(list))
    //   );
    //   next();
    // });
    // it("map (f . g)  == map f . map g", function(next){
    //   var f = (n) => {
    //     return n + 1;
    //   };
    //   var g = (n) => {
    //     return - n;
    //   };
    //   expect(
    //     list.toArray(list.map(alist)(__.compose.bind(__)(f)(g)))
    //   ).to.eql(
    //     list.toArray(__.compose.bind(__)(__.flip.bind(__)(map)(f))
    //                                (__.flip.bind(__)(map)(g))(list))
    //   );
    //   next();
    // });
  });
  describe("monoid laws on list", function() {
    var alist = List.mkList([0,1,2,3]);
    it("empty `append` xs == xs", (next) => {
      expect(
        List.toArray(List.append(List.empty())(alist))
      ).to.eql(
        List.toArray(alist)
      );
      next();
    });
    it("xs `append` empty == xs", function(next){
      expect(
        List.toArray(List.append(alist)(List.empty()))
      ).to.eql(
        List.toArray(alist)
      );
      next();
    });
    it("(xs `append` ys) `append` zs == xs `append` (ys `append` zs)", function(next){
      // this.timeout(5000);
      var xs = List.mkList([0,1]);
      var ys = List.mkList([1,2]);
      var zs = List.mkList([2,3]);
      expect(
        List.toArray(List.append(List.append(xs)(ys))(zs))
      ).to.eql(
        List.toArray(List.append(xs)(List.append(ys)(zs)))
      );
      next();
    });
  });
});
//   describe("list#generate", () => {
//     var generate = __.monad.list.generate.bind(__);
//     it("generate(list)", (next) => {
//       var list = cons(1, cons(2, empty()));
//       var generator = generate(list);
//       expect(
//         get(generator())
//       ).to.eql(
//         1
//       );
//       expect(
//         get(generator())
//       ).to.eql(
//         2
//       );
//       next();
//     });
//   });
// });
