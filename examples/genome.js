"use strict";

/*
  genome processing library

 */

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  aminoCodonTable: {
    ala: ["GCU", "GCC", "GCG"],
    arg: ["CGU", "CGC", "CGA", "CGG", "AGA", "AGG"],
    asn: ["AAU", "AAC"],
    asp: ["GAU", "GAC"],
    cys: ["UGU", "UGC"],
    gln: ["CAA", "CAG"],
    glu: ["GAA", "GAG"],
    gly: ["GGU", "GGC", "GGA", "GGG"],
    his: ["CAU", "CAC"],
    ile: ["AUU", "AUC", "AUA"],
    leu: ["UUA", "UUG", "CUU", "CUC", "CUA", "CUG"],
    lys: ["AAA", "AAG"],
    met: ["AUG"],
    phe: ["UUU", "UUC"],
    pro: ["CCU", "CCC", "CCA", "CCG"],
    ser: ["UCU", "UCC", "UCA", "UCG", "AGU", "AGC"],
    thr: ["ACU", "ACC", "ACA", "ACG"],
    tyr: ["UAU", "UAC"],
    trp: ["UGG"],
    val: ["GUU", "GUC", "GUA", "GUG"],
    stp: ["UAG", "UGA", "UAA"],
    asx: ["RAU", "RAC"],
    glx: ["SAA", "SAG"]
  },
  aminoWeightTable: {
    ala: 89,
    arg: 174,
    asn: 132,
    asp: 133,
    cys: 121,
    gln: 146,
    glu: 147,
    gly: 147,
    his: 155,
    ile: 131,
    leu: 131,
    lys: 146,
    met: 149,
    phe: 165,
    pro: 115,
    ser: 105,
    thr: 119,
    tyr: 181,
    trp: 204,
    val: 117,
    stp: 0,
    asx: 133,
    glx: 147
  },
  complement: (base) => {
    switch (base) {
      case "A":
        return "T";
      case "T":
        return "A";
      case "G":
        return "C";
      case "C":
        return "G";
      case "*":
        return "*";
      default:
        throw {
          name: "runtime error in complement",
          message: "unknown base of " + base
        };
    }
  },
  complements: (xs) => {
	expect(xs).to.an('array');
    return __.map(xs)(this.complement);
  },
  transcript: function(dnacodon) {
    var t2u;
	expect(__.existy(dnacodon)).to.ok();
	expect(dnacodon).to.an('array');
	expect(dnacodon.length).to.eql(3);
    //fj.demand([fj.existy(dnacodon, fj.isArray(dnacodon, dnacodon.length === 3))], "the argument " + dnacodon + " should be a codon");
    t2u = function(base) {
      if (base === "T") {
        return "U";
      } else {
        return base;
      }
    };
    return __.map(dnacodon)(__.compose(t2u)(this.complement));
  },
  translate: function(rnaCodon) {
    var codon, codonAminoClosures, found, notfoundAmino;
	expect(__.existy(rnaCodon)).to.ok();
	expect(rnaCodon).to.an('array');
	expect(rnaCodon.length).to.eql(3);
    //fj.demand([fj.existy(rnaCodon, fj.isArray(rnaCodon, rnaCodon.length === 3))], "the argument " + rnaCodon + " should be a codon");
    codonAminoClosures = (function(_this) {
      return function() {
        var amino, closures, codons, fn, ref;
        closures = [];
        ref = _this.aminoCodonTable;
        fn = function(amino, codons) {
          var closure;
          closure = function(codon) {
            if ((codons.indexOf(codon)) >= 0) {
              return [amino];
            } else {
              return [];
            }
          };
          return closures = __.cons(closure)(closures);
        };
        for (amino in ref) {
          if (!hasProp.call(ref, amino)) continue;
          codons = ref[amino];
          fn(amino, codons);
        }
        return closures;
      };
    })(this);
    codon = rnaCodon.join('');
    notfoundAmino = (closure) => {
      if (__.isEmpty(closure(codon))) {
        return true;
      } else {
        return false;
      }
    };
    found = __.dropWhile(codonAminoClosures())(notfoundAmino);
    if (__.isEmpty(found)) {
      throw {
        name: "runtime error in translate",
        message: "unknown codon of " + rnaCodon
      };
    } else {
      return found[0](codon);
    }
  },
  frames: function(xs, n) {
	expect(xs).to.an('array');
	expect(n).to.a('number');
    var doloop = function(xs, n, accumulator) {
      var rest = __.drop(xs)(n);
      if (__.isEmpty(rest)) {
        return accumulator;
      } else {
        return doloop(rest, n, __.cons(__.take(xs)(n))(accumulator));
      }
    };
    var accumulator = [];
    return __.reverse(doloop(xs, n, accumulator));
  },
  codons: function(seq) {
	expect(seq).to.an('array');
    return this.frames(seq, 3);
  }
};

