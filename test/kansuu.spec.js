var expect = require('expect.js');
var __ = require('../index.js');

describe("Kansuu module", function() {
  it("'id''", function(next) {
  	expect(__.id(1)).to.be(1);
  	expect(__.id(null)).to.be(null);
    next();
  });
  describe("judgment operators", function() {
  	it("'existy'", function(next) {
  	  expect(__.existy(1)).to.be(true);
  	  expect(__.existy(null)).to.be(false);
      next();
  	});
  	it("'truthy'", function(next) {
  	  expect(__.truthy(1)).to.be(true);
      next();
  	});
  	it("'falsy'", function(next) {
  	  expect(__.falsy(1)).to.be(false);
  	  expect(__.falsy.bind(__)(1)).to.be(false);
  	  //expect(__.bind(__.falsy, __)(1)).to.be(false);
      next();
  	});
  });
  describe("higher-order functions", function() {
	describe("curry", function() {
	  
	});
	
  });
  describe("list module", function() {
  	it("'cons' should construct a list", function(next) {
  	  expect(__.list.cons.bind(__)(1)([])).to.eql([1]);
  	  expect(__.list.cons.bind(__)("a")(["b","c"])).to.eql(["a","b","c"]);
  	  //expect(__.list.cons(1)([])).to.eql([1]);
  	  //expect(__.list.cons.bind(__)(1)(2)).to.eql([]);
	  //expect(__.list.cons.bind(__)(1)(2)).fail();
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
  	  it("'map [T] double'", function(next) {
		var array = [0,1,2];
		var double = function(n){
		  return 2 * n;
		};
  		expect(__.list.map.bind(__)(array)(double)).to.eql([0,2,4]);
  		expect(array).to.eql([0,1,2]);
		next();
  	  });
  	  it("'map id == id'", function(next) {
		var list = [0,1,2];
		expect(__.list.map.bind(__)(list)(__.id)).to.eql(__.id(list));
		next();
  	  });
      // it 'map (f . g) == map f . map g', ->
      //   (expect fj.map ary, fj.compose(square, step1)).toEqual fj.compose(fj.flip(fj.map)(square), fj.flip(fj.map)(step1))(ary)
	});
  	it("'splitAt'", function(next) {
	  var array = [0,1,2,3];
  	  expect(__.list.splitAt.bind(__)(array)(2)).to.eql([ [ 0, 1 ], [ 2, 3 ] ]);
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
          return __.not(even)(n);
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
		expect(__.list.filter.bind(__)(list)(__.andify.bind(__)(multipleOf2)(multipleOf3))).to.eql([6,12]);
		next();
  	  });
  	});
  });
  describe("math", function() {
  	describe("approximate", function() {
  	  it("'sqrt'", function(next) {
  		var sqrt = __.math.approximate.bind(__)(__.math.improve_sqrt.bind(__))(0.001);
  		expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
		expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
		var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
		expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
  		next();
  	  });
  	});
  	describe("mkApproximate", function() {
  	  it("'configureSqrt'", function(next) {
		var precision = 0.001;
  		var sqrt = __.math.mkApproximate.bind(__)(__.math.configureSqrt.bind(__)(precision));
  		expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
		expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
		var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
		expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
  		next();
  	  });
  	  it("'configureFunction'", function(next) {
		var precision = 0.001;
		var improve = function(n) {
		  expect(n).to.a('number');
		  return function improveGuess(guess){
			expect(guess).to.a('number');
			return (guess + (n / guess)) / 2.0;
		  };	
		};
		var good_enough = function(guess) {
		  expect(guess).to.a('number');
		  return function isGoodEnough(n){
			expect(n).to.a('number');
			return Math.abs(guess * guess - n) < precision;
		  };
		};
		var configureSqrt = __.math.configureFunction(improve)(good_enough);
  		var sqrt = __.math.mkApproximate.bind(__)(configureSqrt(precision));
  		expect(sqrt(2)(1.0)).to.be.within(1.4,1.5);
		expect(sqrt(12345 * 12345)(1.0)).to.be.within(12344,12346);
		var sqrtFrom10000 = __.flip.bind(__)(sqrt)(10000);
		expect(sqrtFrom10000(12345 * 12345)).to.be.within(12344,12346);
  		next();
  	  });
  	});
  });
  describe("functional composition", function() {
  	it("'compose'", function(next) {
	  var increment = function(n){
		return n + 1;
	  };
	  var decrement = function(n){
		return n - 1;
	  };
	  var double = function(n){
		return 2 * n;
	  };
  	  expect(__.compose.bind(__)(increment)(decrement)(5)).to.be(5);
  	  expect(__.compose.bind(__)(decrement)(increment)(5)).to.be(5);
  	  expect(__.compose.bind(__)(increment)(increment)(5)).to.be(7);
	  // (n * 2) + 1
  	  expect(__.compose.bind(__)(increment)(double)(5)).to.be(11);
	  // (n + 1) * 2
  	  expect(__.compose.bind(__)(double)(increment)(5)).to.be(12);
      next();
  	});
  	it("'flip'", function(next) {
	  var divide = function(x){
		return function(y){
		  return x / y;
		};
	  };
	  expect(divide(12)(3)).to.be(4);
	  expect(__.flip.bind(__)(divide)(12)(3)).to.be(0.25);
	  expect(__.flip.bind(__)(__.flip.bind(__)(divide))(12)(3)).to.be(4);
      next();
  	});
  	it("'pipe'", function(next) {
	  var increment = function(n){
		return n + 1;
	  };
	  var double = function(n){
		return 2 * n;
	  };
	  // (n + 1)* 2
  	  expect(__.pipe.bind(__)(increment)(double)(5)).to.be(12);
	  // (n * 2) + 1
  	  expect(__.pipe.bind(__)(double)(increment)(5)).to.be(11);
      next();
  	});
  });
  // describe("logical operators", function() {
  // 	it("'not'", function(next) {
  // 	  expect(__.not(__.existy)).to.be(true);
  //     next();
  // 	});
  // });
  
  // describe("list", function() {
  // 	it("should construct a list by 'cons'", function(next) {
  // 	  expect(__.cons(1,[]).bind(__)).to.be([]);
  //     next();
  // 	});
	
  // });
});
