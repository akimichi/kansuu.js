"use strict";

// medical functions
// =============================
//

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  /* #@range_begin(BMI) */
  BMI: (weight /* kg */, height /* cm */) => {
	var height_in_meter = height / 100.0;
	return weight / (height_in_meter * height_in_meter);
  },
  /* #@range_end(BMI) */
  // total body water
  /* #@range_begin(TBW) */
  TBW: (weight /* kg */) => {
	return weigth * 0.6;
  },
  /* #@range_end(TBW) */
  /*
  mEq =mg/式量×価数= mmol ×価数
  mg = mEq ×式量/価数= mmol ×式量
  mmol =mg/式量=mEq/価数
  */
  atom: {
	Na: {
	  valency: 1,
	},
	K: {
	  valency: 1,
	},
	Mg: {
	  valency: 2,
	},
	Ca: {
	  valency: 2,
	},
	Zn: {
	  valency: 2,
	},
	Cu: {
	  valency: 2.1,
	},
	Fe: {
	  valency: 2.3,
	},
	H: {
	  valency: 1,
	},
	I: {
	  valency: 1,
	},
	O: {
	  valency: 2,
	},
	C: {
	  valency: 4,
	},
	Cl: {
	  valency: 1,
	}
  },
  // valence
  // H(1), Na(1)、Mg(2)、Al(3)、Si(4)、P(3)、S(2)、Cl(1)、Ar(0)  
  valence: (atom) => {
	
  }
}
