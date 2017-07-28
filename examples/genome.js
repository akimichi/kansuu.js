"use strict";

/*
  genome processing library

 */

var __ = require('../lib/kansuu.js');
var Array = require('../lib/kansuu-array.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


const aminoCodonTable = {
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
};

const aminoWeightTable = {
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
};

const complement = (base) => {
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
};

const complements = (xs) => {
  expect(xs).to.an('array');
  return Array.map(xs)(complement);
};


const frames = (xs, n) => {
  expect(xs).to.an('array');
  expect(n).to.a('number');
  var doloop = (xs, n, accumulator) => {
    var rest = Array.drop(xs)(n);
    if (Array.isEmpty(rest)) {
      return accumulator;
    } else {
      return doloop(rest, n, Array.cons(Array.take(xs)(n), accumulator));
    }
  };
  var accumulator = [];
  return Array.reverse(doloop(xs, n, accumulator));
};

const codons = (seq) => {
  expect(seq).to.an('array');
  return frames(seq, 3);
};

const transcript = (dnacodon) => {
  expect(dnacodon).to.an('array');
  expect(dnacodon.length).to.eql(3);
  //fj.demand([fj.existy(dnacodon, fj.isArray(dnacodon, dnacodon.length === 3))], "the argument " + dnacodon + " should be a codon");
  const t2u = (base) => {
    if (base === "T") {
      return "U";
    } else {
      return base;
    }
  };
  return Array.map(dnacodon)(__.compose(t2u,complement));
};

const translate = (rnaCodon) => {
  var codon, found;
  expect(__.existy(rnaCodon)).to.ok();
  expect(rnaCodon).to.an('array');
  expect(rnaCodon.length).to.eql(3);

  const codonAminoClosures = () => {
    var amino, closures, codons, fn, ref;
    closures = [];
    ref = aminoCodonTable;
    fn = (amino, codons) => {
      var closure;
      closure = (codon) => {
        if ((codons.indexOf(codon)) >= 0) {
          return [amino];
        } else {
          return [];
        }
      };
      return closures = Array.cons(closure,closures);
    };
    for (amino in ref) {
      if (!hasProp.call(ref, amino)) continue;
      codons = ref[amino];
      fn(amino, codons);
    }
    return closures;
  };
  codon = rnaCodon.join('');
  const notfoundAmino = (closure) => {
    if (Array.isEmpty(closure(codon))) {
      return true;
    } else {
      return false;
    }
  };
  found = Array.dropWhile(codonAminoClosures())(notfoundAmino);
  if (Array.isEmpty(found)) {
    throw {
      name: "runtime error in translate",
      message: "unknown codon of " + rnaCodon
    };
  } else {
    return found[0](codon);
  }
};

module.exports = {
  aminoCodonTable: aminoCodonTable,
  aminoWeightTable: aminoWeightTable,
  complement: complement,
  complements: complements,
  codons: codons,
  frames: frames,
  transcript: transcript,
  translate: translate,
};

