"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');

describe("'monad' module", function() {
  it("'writer'", function(next) {
	var squared = function(x) {
	  return __.monad.writer.unit.bind(__)(x * x)(__.list.mkList.bind(__)([util.format("%s was squared.",x)]));
	};
	var halved = function(x) {
	  return __.monad.writer.unit.bind(__)(x / 2)(__.list.mkList.bind(__)([util.format("%s was halved.",x)]));
	};
	var answer = __.monad.writer.flatMap.bind(__)(
	  __.monad.writer.flatMap.bind(__)(
		__.monad.writer.unit.bind(__)(4)(__.list.nil)
	  )(squared)
	)(halved);
	expect(
	  answer.value
	).to.eql(
	  8
	);
	expect(
	  __.list.toArray.bind(__)(answer.buffer)
	).to.eql(
	  [ '4 was squared.', '16 was halved.' ] 
	);
	next();
  });
});
