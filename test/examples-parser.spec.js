"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');

describe("'parser' example", () => {
  var p = require('../examples/parser.js');

  /* #@range_begin(succeed_fail) */
  it('succeed', function(next) {
	expect(p.parse(p.succeed(1))("hello")).to.eql( { value : 1, input : 'hello' } );
	expect(p.parse(p.succeed(['+', '-']))("")).to.eql( { value : ['+', '-'], input : '' } );
	expect(p.parse(p.succeed(10))("")).to.eql( { value : 10, input : '' } );
	expect(p.parse(p.succeed(parseInt("10")))("")).to.eql( { value : 10, input : '' } );
	next();
  });
  it('fail', function(next) {
	expect(p.parse(p.fail())("hello")).to.eql( {} );
	next();
  });
  /* #@range_end(succeed_fail) */
  describe('satisfy', function() {
  	it('digit', function(next){
  	  /* #@range_begin(satisfy_digit) */
  	  var isDigit = function(x){
  		if(/\d/.test(x)){
  		  return true;
  		} else {
  		  return false;
  		}
  	  };
  	  var digit = p.satisfy(isDigit);
  	  expect(p.parse(digit)("123")).to.eql( { value : '1', input : '23' } );
  	  expect(p.parse(digit)("abc")).to.eql( {});
  	  /* #@range_end(satisfy_digit) */
  	  next();	  
  	});
  	it('char', function(next){
  	  expect(p.parse(p.char("a"))("abc")).to.eql( { value : 'a', input : 'bc' });
  	  expect(p.parse(p.char("a"))("123")).to.eql( {});
  	  next();	  
  	});
  });
  it('item', function(next) {
  	expect(p.parse(p.item())("")).to.eql( [] );
  	expect(p.parse(p.item())("hello")).to.eql( { value : 'h', input : 'ello' } );
  	next();
  });
  it('char', function(next) {
  	/* #@range_begin(char) */
  	var plus = p.char('+');
  	expect(p.parse(plus)("-")).to.eql( {} );
  	expect(p.parse(plus)("+")).to.eql( {value: '+', input: ''} );
  	expect(p.parse(plus)("-+")).to.eql( {} );
  	/* #@range_end(char) */
  	next();
  });
  describe('space', function() {
  	/* #@range_begin(space) */
  	it('空白パーサー space をテストする', function(next) {
  	  expect(p.parse(p.space())("  abc")).to.eql( { value : '', input : 'abc' });
  	  next();
  	});
  	/* #@range_end(space) */
  });
  it('string', function(next) {
  	/* #@range_begin(string) */
  	expect(p.parse(p.string("abc"))("abcdef")).to.eql( { value : 'abc', input : 'def' });
  	expect(p.parse(p.string("abc"))("ab1234")).to.eql( {});
  	/* #@range_end(string) */
  	next();
  });
  describe('seq', function() {
  	it('plusminus', function(next){
  	  var plus = p.char('+');
  	  var minus = p.char('-');
  	  var plusminus = p.seq(plus,function(ans1){ 
  		return p.seq(minus,function(ans2){
  		  return p.succeed([ans1, ans2]);
  		});
  	  });
  	  expect(p.parse(plusminus)("+-*")).to.eql( { value : ['+','-'], input : '*' } );
  	  next();
  	});
  	it('minusone should be -1', function(next){
  	  /*
  	   #@range_begin(minusone)
  	   */
  	  var minus = p.char('-');
  	  var one = p.char('1');
  	  var minusone = p.seq(minus,function(ans1){ 
  		return p.seq(one,function(ans2){
  		  var ans = parseInt(ans1 + ans2);
  		  return p.succeed(ans);
  		});
  	  });
  	  expect(p.parse(minusone)("-1")).to.eql( { value : -1, input : '' } );
  	  /*
  	   #@range_end(minusone)
  	   */
  	  next();
  	});
  	it('oneoneone should be 111', function(next){
  	  var one = p.char('1');
  	  var oneoneone = p.seq(one,function(ans1){ 
  		return p.seq(one,function(ans2){
  		  return p.seq(one,function(ans3){
  			var ans = parseInt(ans1 + ans2 + ans3);
  			return p.succeed(ans);
  		  });
  		});
  	  });
  	  expect(p.parse(oneoneone)("1111")).to.eql( { value : 111, input : '1' } );
  	  next();	  
  	});
  });
  describe('alt', function() {
  	it('one or succeed a',function(next){
  	  var parser = p.alt(p.char('1'), 
  						 p.succeed('a'));
  	  expect(p.parse(parser)("1a")).to.eql( { value : '1', input : 'a' });
  	  next();	  
  	});
  	it('item or succeed',function(next){
  	  var parser = p.alt(p.item(), p.succeed('a'));
  	  expect(p.parse(parser)("hello")).to.eql( { value : 'h', input : 'ello' });
  	  next();	  
  	});
  	it('fail or succeed(d) abc',function(next){
  	  var parser = p.alt(p.fail(), p.succeed('d'));
  	  expect(p.parse(parser)("abc")).to.eql( { value : 'd', input : 'abc' });
  	  next();	  
  	});
  	it('fail or succeed',function(next){
  	  var parser = p.alt(p.fail(), p.succeed('a'));
  	  expect(p.parse(parser)("hello")).to.eql({ value : 'a', input : 'hello' });
  	  next();	  
  	});
  	it('fail or fail',function(next){
  	  var parser = p.alt(p.fail(), p.fail());
  	  expect(p.parse(parser)("hello")).to.eql( {});
  	  next();	  
  	});
  });
  // describe('digit', function() {
  // 	it('accepts digits',function(next){
  // 	  expect(p.parse(p.many(p.digit())(__.op["+"]))("123")).to.eql( { value : '123', input : '' });
  // 	  expect(p.parse(p.many1(p.digit())(__.op["+"]))("abcdef")).to.eql( {});
  // 	  next();
  // 	});
  // });
  // describe('lower', function() {
  // 	it('many lower', function(next){
  // 	  expect(p.parse(p.many(p.lower())(__.op["+"]))("abc")).to.eql( { value : 'abc', input : '' } );
  // 	  expect(p.parse(p.many(p.lower())(__.op["+"]))("abcABC")).to.eql( { value : 'abc', input : 'ABC' });
  // 	  next();
  // 	});
  // });
  // describe('ident', function() {
  // 	it('ident', function(next){
  // 	  expect(p.parse(p.ident())("hello world")).to.eql( { value : 'hello', input : ' world' });
  // 	  next();
  // 	});
  // });
  // describe('nat', function() {
  // 	it('nat', function(next){
  // 	  var result = p.parse(p.nat())("123 pounds")
  // 	  expect(__.get("value")(result)).to.eql(123);
  // 	  //expect(p.parse(p.nat())("123 pounds")).to.eql( [ { value : 123, input : ' pounds' } ]); // should succeed
  // 	  next();
  // 	});
  // });
  // describe('token', function() {
  // 	it('identifier', function(next){
  // 	  expect(p.parse(p.identifier())("  abc   ")).to.eql( { value : 'abc', input : '' });
  // 	  next();	  
  // 	});
  // 	it('natural', function(next){
  // 	  expect(p.parse(p.natural())("  234   ")).to.eql( { value : 234, input : '' } );
  // 	  next();	  
  // 	});
  // 	it('symbol', function(next){
  // 	  expect(p.parse(p.symbol("pi"))("  pi   ")).to.eql(  { value : 'pi', input : '' } );
  // 	  expect(p.parse(p.symbol("pi"))("pi   ")).to.eql(  { value : 'pi', input : '' } );
  // 	  expect(p.parse(p.symbol("pi"))("  pi")).to.eql(  { value : 'pi', input : '' } );
  // 	  next();	  
  // 	});
  // });
  // describe('many', function() {
  // 	it('many digit 123abc',function(next){
  // 	  /*
  // 	   #@range_begin(many_digit)
  // 	   */
  // 	  var isDigit = function(x){
  // 		if(/\d/.test(x)){
  // 		  return true;
  // 		} else {
  // 		  return false;
  // 		}
  // 	  };
  // 	  var digit = p.satisfy(isDigit);
  // 	  expect(p.parse(p.many(digit)(__.op["+"]))("123abc")).to.eql({ value : '123', input : 'abc' } );
  // 	  /*
  // 	   #@range_end(many_digit)
  // 	   */
  // 	  next();	  
  // 	});
  // 	it('many digit abcdef',function(next){
  // 	  expect(p.parse(p.many(p.digit())(__.op["+"]))("abcdef")).to.eql( { value : [  ], input : 'abcdef' });
  // 	  next();	  
  // 	});
  // 	it('many natural',function(next){
  // 	  var natural = p.token(p.nat());
  // 	  expect(p.parse(p.many(natural)(__.cons))("12 23 ")).to.eql( { value : [12, 23], input : '' });
  // 	  next();	  
  // 	});
  // });
  // /* #@range_begin(natural_array) */
  // describe('自然数の配列を認識する', function() {
  // 	var openBracket = p.token(p.char("["));
  // 	var closeBracket = p.token(p.char("]"));
  // 	var natural = p.token(p.nat());
	
  // 	var arrayParser = p.seq(openBracket,function(_){ 
  // 	  return p.seq(p.many(natural)(__.cons),function(naturals){
  // 		return p.seq(closeBracket,function(_){ 
  // 		  if(__.isEmpty(naturals))
  // 			return p.succeed([]);
  // 		  else
  // 			return p.succeed(naturals);
  // 		});
  // 	  });
  // 	});
  // 	it('[ ]', function(next){
  // 	  expect(p.parse(arrayParser)("[   ]")).to.eql(  { value : [ ], input : '' } );
  // 	  next();	  
  // 	});
  // 	it('[ 12 23 45 ]', function(next){
  // 	  expect(p.parse(arrayParser)("[ 12 23 45 ]")).to.eql(  { value : [12, 23, 45 ], input : '' } );
  // 	  next();	  
  // 	});
  // });
  // /* #@range_end(natural_array) */
});
