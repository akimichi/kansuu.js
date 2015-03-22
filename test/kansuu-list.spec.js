"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'list' module", function() {
  it("'cons' should construct a list", function(next) {
	expect(
	  __.list.cons.bind(__)(1)([])
	).to.eql(
	  [1]
	);
	expect(
	  __.list.cons.bind(__)("a")(["b","c"])
	).to.eql(
	  ["a","b","c"]
	);
	next();
  });
  it("'head' should return the 1st element", function(next) {
	expect(__.list.head.bind(__)([0,1,2,3])).to.eql(0);
	next();
  });
  it("'tail' should return the tail element", function(next) {
	expect(__.list.tail.bind(__)([0,1,2,3])).to.eql([1,2,3]);
	next();
  });
  it("'append'", function(next) {
	var xs = [0,1];
	var ys = [2,3];
	expect(__.list.append.bind(__)(xs)(ys)).to.eql([0,1,2,3]);
	expect(xs).to.eql([0,1]);
	expect(ys).to.eql([2,3]);
	next();
  });
  it("'reverse' is immutable", function(next) {
	var array = [0,1,2];
	expect(__.list.reverse.bind(__)(array)).to.eql([2,1,0]);
	expect(array).to.eql([0,1,2]);
	next();
  });
  it("'last' uses compose", function(next) {
	var array = [0,1,2];
	expect(__.list.last.bind(__)(array)).to.eql(2);
	expect(array).to.eql([0,1,2]);
	expect(__.list.last.bind(__)([0])).to.eql(0);
	next();
  });
  it("'init' uses compose", function(next) {
	var array = [0,1,2];
	expect(__.list.init.bind(__)(array)).to.eql([0,1]);
	expect(array).to.eql([0,1,2]);
	expect(__.list.init.bind(__)([0])).to.eql([]);
	next();
  });
  it("'take'", function(next) {
	var array = [0,1,2];
	expect(__.list.take.bind(__)(array)(1)).to.eql([0]);
	expect(__.list.take.bind(__)(array)(2)).to.eql([0,1]);
	expect(__.list.take.bind(__)(array)(3)).to.eql([0,1,2]);
	expect(__.list.take.bind(__)(array)(4)).to.eql([0,1,2]);
	expect(__.list.take.bind(__)(array)(0)).to.eql([]);
	expect(array).to.eql([0,1,2]);
	next();
  });
  it("'drop'", function(next) {
	var array = [0,1,2];
	expect(__.list.drop.bind(__)(array)(1)).to.eql([1,2]);
	expect(__.list.drop.bind(__)(array)(2)).to.eql([2]);
	expect(__.list.drop.bind(__)(array)(0)).to.eql(array);
	expect(array).to.eql([0,1,2]);
	next();
  });
  describe("'map'", function() {
	it("'map [number] double'", function(next) {
	  var array = [0,1,2];
	  var double = function(n){
		return 2 * n;
	  };
	  expect(
		__.list.map.bind(__)(array)(double)
	  ).to.eql(
		[0,2,4]
	  );
  	  expect(array).to.eql([0,1,2]);
	  next();
  	});
  	it("'map id == id'", function(next) {
	  var sequence = [0,1,2];
	  expect(
		__.list.map.bind(__)(sequence)(__.id)
	  ).to.eql(
		__.id(sequence)
	  );
	  next();
  	});
    // it 'map (f . g) == map f . map g', ->
    //   (expect fj.map ary, fj.compose(square, step1)).toEqual fj.compose(fj.flip(fj.map)(square), fj.flip(fj.map)(step1))(ary)
  });
  it("'splitAt'", function(next) {
	var array = [0,1,2,3];
  	expect(
	  __.list.splitAt.bind(__)(array)(2)
	).to.eql(
	  [ [ 0, 1 ], [ 2, 3 ] ]
	);
    next();
  });
  it("'takeWhile'", function(next) {
	var list = [2,4,6,1,5,6];
    var even = function(n){
	  return 0 === (n % 2);
	};
    expect(__.list.takeWhile.bind(__)(list)(even)).to.eql([2,4,6]);
    expect(__.list.takeWhile.bind(__)([2,4,1,3])(function(n){
	  return n > 1;
	})).to.eql([2,4]);
    next();
  });
  it("'span'", function(next) {
	var isPositive = function(n){
	  return n > 0;
	};
    expect(
	  __.span.bind(__)(isPositive)([])
	).to.eql(
	  { type: 'pair', left: [], right: [] }
	);
	// span (< 3) [1,2,3,4,1,2,3,4] == ([1,2],[3,4,1,2,3,4])
    expect(
	  __.span.bind(__)(function(n){ return n < 3;})([1,2,3,4,1,2,3,4])
	).to.eql(
	  __.pair.mkPair([1,2])([3,4,1,2,3,4])
	);
	// span (< 9) [1,2,3] == ([1,2,3],[])
    expect(
	  __.span.bind(__)(__.math.isLessThan(9))([1,2,3])
	).to.eql(
	  __.pair.mkPair([1,2,3])([])
	);
	// span (< 0) [1,2,3] == ([],[1,2,3])
    expect(
	  __.span.bind(__)(__.math.isLessThan(0))([1,2,3])
	).to.eql(
	  __.pair.mkPair([])([1,2,3])
	);
    next();
  });
  it("'break'", function(next) {
	// break (3==) [1,2,3,4,5] == ([1,2],[3,4,5])
    expect(
	  __.break.bind(__)(__.math.isEqual(3))([1,2,3,4,5])
	).to.eql(
	  { type: 'pair', left: [ 1, 2 ], right: [ 3, 4, 5 ] }
	);
	// break (> 3) [1,2,3,4,1,2,3,4] == ([1,2,3],[4,1,2,3,4])
    expect(
	  __.break.bind(__)(__.math.isMoreThan(3))([1,2,3,4,1,2,3,4])
	).to.eql(
	  { type: 'pair',
		left: [ 1, 2, 3 ],
		right: [ 4, 1, 2, 3, 4 ] 
	  } 
	);
	// break (< 9) [1,2,3] == ([],[1,2,3])
    expect(
	  __.break.bind(__)(__.math.isLessThan(9))([1,2,3])
	).to.eql(
	  { type: 'pair',
		left: [ ],
		right: [ 1, 2, 3 ] 
	  } 
	);
	// break (> 9) [1,2,3] == ([1,2,3],[])
    expect(
	  __.break.bind(__)(__.math.isMoreThan(9))([1,2,3])
	).to.eql(
	  { type: 'pair',
		left: [ 1, 2, 3 ],
		right: [ ]
	  } 
	);
    next();
  });
  // it("'lines'", function(next) {
  //   // lines "hello world\nit's me,\neric\n"
  //   // ["hello world", "it's me,", "eric"]
  //   expect(
  // 	 __.lines.bind(__)("abc\ndef")
  //   ).to.eql(
  // 	 [ [ 'a', 'b', 'c', '\n', 'd', 'e', 'f' ] ]
  //   );
  //   next();
  // });
  it("'dropWhile'", function(next) {
	var list = [2,4,6,1,5,6];
    var even = function(n){
	  return 0 === (n % 2);
	};
    expect(__.list.dropWhile.bind(__)(list)(even)).to.eql([1,5,6]);
    expect(__.list.dropWhile.bind(__)([2,4,1,3])(function(n){
	  return n > 1;
	})).to.eql([1,3]);
    expect(__.list.dropWhile.bind(__)([2,3,4])(function(n){
	  return n > 1;
	})).to.eql([ ]);
    next();
  });
  it("'zip'", function(next) {
	var listX = [0,1,2,3,4];
	var listY = ["h","a","l","l","o"];
	expect(__.list.zip.bind(__)(listX)(listY)).to.eql([[0,'h'],[1,'a'],[2,'l'],[3,'l'],[4,'o']]);
    next();
  });
  describe("filter", function() {
  	it("'単純なフィルター'", function(next) {
	  var even = function(n){
        return (n % 2) === 0;
	  };
      expect(__.list.filter.bind(__)([1,2,3,4,5])(even)).to.eql([ 2, 4]);
      expect(__.list.filter.bind(__)([1,2,3,4,5])(function(n){
		return n > 3;
	  })).to.eql([4,5]);
	  var odd = function(n){
		return __.not(even(n));
        //return __.not(even)(n);
	  };
	  expect(__.list.filter.bind(__)([1,2,3])(odd)).to.eql([1,3]);
	  next();
  	});
    it('は複雑な条件をフィルターできる', function(next){
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
		__.list.filter.bind(__)(list)(__.andify.bind(__)(multipleOf2)(multipleOf3))
	  ).to.eql(
		[6,12]
	  );
	  next();
  	});
  });
});
