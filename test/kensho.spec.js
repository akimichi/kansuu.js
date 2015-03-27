"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var qc = require('../lib/kensho.js');

describe("Kensho module", function() {
  it("ints", function(next) {
	var ints = qc.ints(0);
	expect(
	  ints.value
	).to.eql(0);
	expect(
	  ints.next().value
	).to.eql(1);
	next();
  });
});

