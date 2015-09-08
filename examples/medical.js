"use strict";

// medical functions
// =============================
//

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  // weight[kg], height [cm]
  BMI: (weight /* kg */, height /* cm */) => {
	var height_in_meter = height / 100.0
	return weight / (height_in_meter * height_in_meter);
  }
}
