"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var med = require('../examples/medical.js');

describe("'medical' example", () => {
  it('BMI', (next) => {
    expect(
      med.BMI(75, 175)
    ).to.be.within(24.0, 25.0)
    next();
  });
});
