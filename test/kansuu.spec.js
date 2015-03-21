"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("Kansuu module", function() {
  it("'id''", function(next) {
  	expect(__.id(1)).to.be(1);
  	expect(__.id(null)).to.be(null);
    next();
  });
  describe("judgment predicates", function() {
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
  	  expect(__.falsy.bind(__)(1)).to.be(false);
      next();
  	});
  	describe("'isEmpty'", function() {
  	  it("isEmpty(list) ", function(next) {
  		expect(
		  __.isEmpty.bind(__)([])
		).to.be(
		  true
		);
		expect(
		  __.isEmpty.bind(__)([1,2,3])
		).to.be(
		  false
		);
		next();
  	  });
  	  it("isEmpty(string) ", function(next) {
  		expect(
		  __.isEmpty.bind(__)("")
		).to.be(
		  true
		);
		expect(
		  __.isEmpty.bind(__)("123")
		).to.be(
		  false
		);
		next();
  	  });
  	});
  });
  describe("combinators", function() {
	var S = __.combinator.S;
	var K = __.combinator.K;
	var I = __.combinator.I;
	var B = __.combinator.B;
	var C = __.combinator.C;
	it('I', function(next){
	  expect(I(1)).to.eql(1);
	  next();
	});
	it('SKK == I', function(next) {
	  expect(S(K)(K)(0)).to.eql(0);
	  expect(S(K)(K)("a")).to.eql("a");
	  next();
	});
	it('T == K', function(next) {
	  var T = K;
	  expect(T(1)(0)).to.eql(1);
	  next();
	});
	it('S add I 7 == 14', function(next) {
	  expect(S(__.add)(I)(7)).to.eql(14);
	  next();
	});
	it('succ == S(S(K add)(K 1)) I', function(next) {
	  var succ = S(S(K(__.add))(K(1)))(I);
	  expect(succ(0)).to.eql(1);
	  expect(succ(1)).to.eql(2);
	  next();
	});
	it('fac', function(next) {
	  // var plus = function(x){
	  // 	return function(y){
	  // 	  return x + y;
	  // 	};
	  // };
	  // var multiply = function(x){
	  // 	return function(y){
	  // 	  return x * y;
	  // 	};
	  // };
	  // var divide = function(x){
	  // 	return function(y){
	  // 	  return x / y;
	  // 	};
	  // };
	  // var minus = function(x){
	  // 	return function(y){
	  // 	  return x - y;
	  // 	};
	  // };
	  // var eq = function(x){
	  // 	return function(y){
	  // 	  return (x === y);
	  // 	};
	  // };
	  // var cond = function(pred){
	  // 	return function(x){
	  // 	  return function(y){
	  // 		if(pred){
	  // 		  return x();
	  // 		} else {
	  // 		  return y();
	  // 		}
	  // 	  };
	  // 	};
	  // };
	  var averageX = function(x){
		return C(B(__.divide)(__.add(x)))(2);
		//return C(B(divide)(plus(x)))(2);
	  };
	  expect(averageX(1)(3)).to.eql(2);
	  expect(averageX(2)(4)).to.eql(3);
	  // var average = C(B(C(B(B(divide))(plus)))(2));
	  // expect(average(1)(3)).to.eql(2);
	  // var fac = S(C(B(cond(eq(0))))(1)
	  // 			  S(multiply(B(fac(C(minus)(1))))));
	  next();
	});
	// it('SK == false', function() {
	// 	var F = function(x){
	// 	  return function(y){
	// 		return S(K)(x)(y);
	// 	  };
	// 	};
	// 	expect(F(1)(0)).to.eql(1);
	// });
  });
  describe("tap", function() {
	it('can successfully hide sideeffects', function(next) {
	  /* #@range_begin(tap_combinator_test) */
	  var consoleSideEffect = function(any){
		console.log(any);
	  };
	  var target = 1;
	  expect(
		__.tap(target)(consoleSideEffect)
	  ).to.eql(
		1
	  );
	  var updateSideEffect = function(any){
		any = any + 1;
	  };
	  expect(
		__.tap(target)(updateSideEffect)
	  ).to.eql(
		1
	  );
	  /* #@range_end(tap_combinator_test) */
	  next();
	});
	it('can not hide exception', function(next) {
	  /* #@range_begin(tap_combinator_exception_test) */
	  var exceptionSideEffect = function(any){
		throw new Error(any);
	  };
	  var target = "error";
	  expect(function(){
		return __.tap(target)(exceptionSideEffect);
	  }).to.throwError();
	  /* #@range_end(tap_combinator_exception_test) */
	  next();
	});
  });
  describe("higher-order functions", function() {
	describe("loop", function() {
	  it('can iterate', function(next) {
		var lessThan = function(n){
		  return function(x){
			return x < n;
		  };
		};
		var succ = function(n){
		  return n + 1;
		};
		expect(__.loop(lessThan(3))(0)(succ)).to.eql(3);
		next();
	  });
	});
	describe("curry", function() {
  	  it("'curry' should curry function", function(next) {
		var addUncurried = function(n1,n2){
		  return n1 + n2;
		};
		expect(
		  addUncurried(1,2)
		).to.eql(
		  3
		);
		var addCurried = __.curry(addUncurried);
		expect(
		  addCurried(1)(2)
		).to.eql(
		  3
		);
		next();
	  });
	});
	describe("uncurry", function() {
  	  it("'uncurry' should curry function", function(next) {
		var addCurried = function(n1){
		  return function (n2){
			return n1 + n2;
		  };
		};
		var addUncurried = __.uncurry(addCurried);
		expect(
		  addUncurried(1,2)
		).to.eql(
		  3
		);
		next();
	  });
	});
  });
  /*
   curry (uncurry E ) = E
   uncurry (curry E ) = E
   */
  describe("misc", function() {
  	it("'until'", function(next) {
	  expect(
		__.until(__.math.isMoreThan(100))(__.math.times(7))(1)
	  ).to.eql(
		343
	  );
	  next();
	});
  }),
  describe("functional composition", function() {
	describe("'compose'", function() {
  	  it("'compose one argument functions'", function(next) {
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
  	  it("'compose two argument functions'", function(next) {
		var negate = function(x) {
          return -x;
		};
		var multiply = function(x,y){
		  return x * y;
		};
		expect((__.compose.bind(__)(negate)(multiply))(2,3)).to.eql(-6);
		next();
  	  });
  	  it("compose several functions", function(next) {
		var not = function(x){
		  return ! x;
		};
		expect(
		  __.compose.bind(__)(not)(__.math.isEqual(3))(3)
		).to.eql(
			false
		);
		// expect(
		//   __.compose.bind(__)(__.not)(__.math.isEqual(3))(3)
		// ).to.eql(
		// 	false
		// );
		next();
  	  });
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
  describe("folding functions", function() {
  	it("'reduce'", function(next) {
	  var list = [1,2,3];
  	  expect(
		__.reduce(list)(0)(function(item){
		  return function(accumulator){
			return item + accumulator;
		  };
		})
	  ).to.be(
		6
	  );
      next();
  	});
  });
  // describe("logical operators", function() {
  // 	it("'not'", function(next) {
  // 	  expect(__.not(__.existy)).to.be(true);
  //     next();
  // 	});
  // });
  
});
