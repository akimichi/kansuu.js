"use strict";

const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  Array = require('../lib/kansuu-array.js'),
  Pair = require('../lib/kansuu-pair.js'),
  math = require('../lib/kansuu-math.js');


describe("array", () => {
  it("'cons' should construct a list", (next) => {
    expect(
      Array.cons(1,[])
    ).to.eql(
      [1]
    );
    expect(
      Array.cons("a",["b","c"])
    ).to.eql(
      ["a","b","c"]
    );
    next();
  });
  it("'head' should return the 1st element", (next) => {
    expect(Array.head([0,1,2,3])).to.eql(0);
    next();
  });
  it("'tail' should return the tail element", (next) => {
    expect(Array.tail([0,1,2,3])).to.eql([1,2,3]);
    next();
  });
  it("'concat'", (next) =>  {
    var xs = [0,1];
    var ys = [2,3];
    expect(Array.concat(xs,ys)).to.eql([0,1,2,3]);
    expect(xs).to.eql([0,1]);
    expect(ys).to.eql([2,3]);
    next();
  });
  it("'reverse' is immutable", (next) =>  {
    var array = [0,1,2];
    expect(Array.reverse(array)).to.eql([2,1,0]);
    expect(array).to.eql([0,1,2]);
    next();
  });
  it("'last' uses compose", (next) =>  {
    var array = [0,1,2];
    expect(Array.last(array)).to.eql(2);
    expect(array).to.eql([0,1,2]);
    expect(Array.last([0])).to.eql(0);
    next();
  });
  it("'init' uses compose", (next) =>  {
    var array = [0,1,2];
    expect(Array.init(array)).to.eql([0,1]);
    expect(array).to.eql([0,1,2]);
    expect(Array.init([0])).to.eql([]);
    next();
  });
  it("'take'", (next) =>  {
    var array = [0,1,2];
    expect(Array.take(array)(1)).to.eql([0]);
    expect(Array.take(array)(2)).to.eql([0,1]);
    expect(Array.take(array)(3)).to.eql([0,1,2]);
    expect(Array.take(array)(4)).to.eql([0,1,2]);
    expect(Array.take(array)(0)).to.eql([]);
    expect(array).to.eql([0,1,2]);
    next();
  });
  it("'drop'", (next) =>  {
    var array = [0,1,2];
    expect(Array.drop(array)(1)).to.eql([1,2]);
    expect(Array.drop(array)(2)).to.eql([2]);
    expect(Array.drop(array)(0)).to.eql(array);
    expect(array).to.eql([0,1,2]);
    next();
  });
  describe("'map'", function() {
    it("'map [number] double'", (next) =>  {
      var array = [0,1,2];
      var double = function(n){
        return 2 * n;
      };
      expect(
        Array.map(array)(double)
      ).to.eql(
        [0,2,4]
      );
      expect(array).to.eql([0,1,2]);
      next();
    });
    it("'map id == id'", (next) =>  {
      var sequence = [0,1,2];
      expect(
        Array.map(sequence)(__.id)
      ).to.eql(
        __.id(sequence)
      );
      next();
    });
    // it 'map (f . g) == map f . map g', ->
    //   (expect fj.map ary, fj.compose(square, step1)).toEqual fj.compose(fj.flip(fj.map)(square), fj.flip(fj.map)(step1))(ary)
  });
  it("'splitAt'", (next) =>  {
    var array = [0,1,2,3];
    expect(
      Array.splitAt(array)(2)
    ).to.eql(
      [ [ 0, 1 ], [ 2, 3 ] ]
    );
    next();
  });
  it("'takeWhile'", (next) =>  {
    var list = [2,4,6,1,5,6];
    var even = (n) => {
      return 0 === (n % 2);
    };
    expect(Array.takeWhile(list)(even)).to.eql([2,4,6]);
    expect(Array.takeWhile([2,4,1,3])(n => {
      return n > 1;
    })).to.eql([2,4]);
    next();
  });
  it("'before'", (next) =>  {
    expect(
      Array.before([1,2,3,0,4,5,6])(0)
    ).to.eql(
      [1,2,3]
    );
    next();
  });
  it("'after'", (next) =>  {
    expect(
      Array.after([1,2,3,0,4,5,6])(0)
    ).to.eql(
      [4,5,6]
    );
    next();
  });
  it("'span'", (next) =>  {
    var isPositive = function(n){
      return n > 0;
    };
    expect(
      Array.span(isPositive)([])
    ).to.eql(
      [[],[]] 
    );
    // span (< 3) [1,2,3,4,1,2,3,4] == ([1,2],[3,4,1,2,3,4])
    expect(
      Array.span(function(n){ return n < 3;})([1,2,3,4,1,2,3,4])
    ).to.eql(
      [[1,2],[3,4,1,2,3,4]]
      // Pair.mkPair([1,2])([3,4,1,2,3,4])
    );
    // span (< 9) [1,2,3] == ([1,2,3],[])
    expect(
      Array.span(math.isLessThan(9))([1,2,3])
    ).to.eql(
      [[1,2,3],[]]
      //Pair.mkPair([1,2,3])([])
    );
    // span (< 0) [1,2,3] == ([],[1,2,3])
    expect(
      Array.span(math.isLessThan(0))([1,2,3])
    ).to.eql(
      [[],[1,2,3]]
      //]Pair.mkPair([])([1,2,3])
    );
    next();
  });
  it("'breaks'", (next) =>  {
    // break (3==) [1,2,3,4,5] == ([1,2],[3,4,5])
    expect(
      Array.breaks(math.isEqual(3))([1,2,3,4,5])
    ).to.eql(
      [[ 1, 2 ], [ 3, 4, 5 ]]
      // { type: 'pair', left: [ 1, 2 ], right: [ 3, 4, 5 ] }
    );
    // break (> 3) [1,2,3,4,1,2,3,4] == ([1,2,3],[4,1,2,3,4])
    expect(
      Array.breaks(math.isMoreThan(3))([1,2,3,4,1,2,3,4])
    ).to.eql(
      [[ 1, 2, 3 ],[ 4, 1, 2, 3, 4 ]]
      // { type: 'pair',
      //   left: [ 1, 2, 3 ],
      //   right: [ 4, 1, 2, 3, 4 ]
      // }
    );
    // break (< 9) [1,2,3] == ([],[1,2,3])
    expect(
      Array.breaks(math.isLessThan(9))([1,2,3])
    ).to.eql(
      [[ ], [ 1, 2, 3 ]]
      // { type: 'pair',
      //   left: [ ],
      //   right: [ 1, 2, 3 ]
      // }
    );
    // break (> 9) [1,2,3] == ([1,2,3],[])
    expect(
      Array.breaks(math.isMoreThan(9))([1,2,3])
    ).to.eql(
        [[ 1, 2, 3 ],[ ]]
      // { type: 'pair',
      //   left: [ 1, 2, 3 ],
      //   right: [ ]
      // }
    );
    next();
  });
  // it("'lines'", (next) =>  {
  //   // lines "hello world\nit's me,\neric\n"
  //   // ["hello world", "it's me,", "eric"]
  //   expect(
  //   Array.lines("abc\ndef")
  //   ).to.eql(
  //   [ [ 'a', 'b', 'c', '\n', 'd', 'e', 'f' ] ]
  //   );
  //   next();
  // });
  it("'dropWhile'", (next) =>  {
    var list = [2,4,6,1,5,6];
    var even = function(n){
      return 0 === (n % 2);
    };
    expect(Array.dropWhile(list)(even)).to.eql([1,5,6]);
    expect(Array.dropWhile([2,4,1,3])(function(n){
      return n > 1;
    })).to.eql([1,3]);
    expect(Array.dropWhile([2,3,4])(function(n){
      return n > 1;
    })).to.eql([ ]);
    next();
  });
  it("'zip'", (next) =>  {
    var listX = [0,1,2,3,4];
    var listY = ["h","a","l","l","o"];
    expect(Array.zip(listX)(listY)).to.eql([[0,'h'],[1,'a'],[2,'l'],[3,'l'],[4,'o']]);
    next();
  });
  describe("folding functions", () => {
    it("'reduce'", (next) => {
      var list = [1,2,3];
      expect(
        Array.reduce(list)(0)(item =>{
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.be(
        6
      );
      next();
    });
  });

  describe("filter", function() {
    it("'単純なフィルター'", (next) =>  {
      var even = function(n){
        return (n % 2) === 0;
      };
      expect(Array.filter([1,2,3,4,5])(even)).to.eql([ 2, 4]);
      expect(Array.filter([1,2,3,4,5])(function(n){
        return n > 3;
      })).to.eql([4,5]);
      var odd = function(n){
        return __.not(even(n));
        //return Array.not(even)(n);
      };
      expect(Array.filter([1,2,3])(odd)).to.eql([1,3]);
      next();
    });
    it('は複雑な条件をフィルターできる', (next) => {
      var one = function(n){
        return n === 1;
      };
      var two = function(n){
        return n === 2;
      };
      var list = [1,2,3,4,5,6,7,8,9,10,11,12,13];
      var multipleOf2 = function(n){
        return 0 === (n % 2);
      };
      var multipleOf3 = function(n){
        return 0 === (n % 3);
      };
      expect(
        Array.filter(list)(__.andify(multipleOf2)(multipleOf3))
      ).to.eql(
        [6,12]
      );
      next();
    });
  });
});
