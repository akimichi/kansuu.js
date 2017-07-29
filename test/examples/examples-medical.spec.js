"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  med = require('../../examples/medical.js');

describe("'medical' example", () => {
  it('BMI', (next) => {
    expect(
      med.BMI(75, 175)
    ).to.be.within(24.0, 25.0)
    next();
  });
  describe('person', () => {
	var male = med.algebraic.male({
	  weight: 72,
	  height: 175
	});
	var female = med.algebraic.female({
	  weight: 54,
	  height: 160
	});
	it('BMI', (next) => {
      expect(
		med.algebraic.evaluate.call(med,male).BMI
      ).to.be(23.510204081632654)
      next();
	});
	it('TBW', (next) => {
      expect(
		med.algebraic.evaluate.call(med,female).TBW
      ).to.be(29.783085)
      next();
	});
  });
  describe('case', () => {
	var male = med.algebraic.male({
	  weight: 62.9,
	  height: 174
	});
	it('BMI', (next) => {
      expect(
		med.algebraic.evaluate.call(med,male).BMI
      ).to.be(20.775531774342713)
      next();
	});
	it('TBW', (next) => {
      expect(
		med.algebraic.evaluate.call(med,male).TBW
      ).to.be(38.5476065)
      next();
	});
  });
});
