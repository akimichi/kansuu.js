"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var gn = require('../examples/genome.js');

describe("'genome' example", () => {
  var gnBound = base.binds(gn);
  describe('complements', function() {
    it('can return its complements', (next) => {
      expect(
        gn.complements(['G', 'C', 'G'])
      ).to.eql(
        ['C', 'G', 'C']
      );
      expect(
        __.map([["T", "A", "C"], ["C", "G", "C"]])(gnBound(gn.complements))
      ).to.eql(
        [['A', 'T', 'G'], ['G', 'C', 'G']]
      );
      expect(
        __.map([["T", "A", "C"], ["C", "G", "C"]])(gn.complements.bind(gn))
      ).to.eql(
        [['A', 'T', 'G'], ['G', 'C', 'G']]
      );
      next();
    });
  });
  describe('codons', () => {
    it('can transform dna sequence to codons', (next) => {
      var seq = ['A', 'T', 'G', 'C', 'A', 'T', 'G', 'C'];
      expect(
        gn.codons(seq)
      ).to.eql(
        [['A', 'T', 'G'], ['C', 'A', 'T']]
      );
      next();
    });
  });
  describe('translate', () => {
    it('can translate from rna codon to amino', (next) => {
      expect(
        gn.translate(['G', 'C', 'G'])
      ).to.eql(
        ['ala']
      );
      expect(
        gn.translate(['A', 'U', 'G'])
      ).to.eql(
        ['met']
      );
      next();
    });
  });
  describe('transcript', function() {
    it('can transcript from dna sequence to rna sequence', (next) => {
      expect(
        gn.transcript(["T", "A", "C"])
      ).to.eql(
        ['A', 'U', 'G']
      );
      expect(
        gn.transcript(["C", "G", "C"])
      ).to.eql(
        ['G', 'C', 'G']
      );
      next();
    });
  });
});
//     describe('fj.map (gn.codons dnaseq), fj.compose(gn.translate, gn.transcript)', function() {
//       return it('can transform dna sequence to protein', function() {
//         /*
//          *#@range_begin(map_compose_to_translate_dna)
//          */
//         var dnaseq, protein;
//         dnaseq = ['T', 'A', 'C', 'C', 'G', 'C', 'G', 'G', 'C', 'T', 'A', 'T', 'T', 'A', 'C', 'T', 'G', 'C', 'C', 'A', 'G', 'G', 'A', 'A', 'G', 'G', 'A', 'A', 'C', 'T'];
//         protein = fj.map(gn.codons(dnaseq), fj.compose(gn.translate, gn.transcript, gn));
//         return (expect(protein)).to.eql([['met'], ['ala'], ['pro'], ['ile'], ['met'], ['thr'], ['val'], ['leu'], ['pro']]);

//         /*
//          *#@range_end(map_compose_to_translate_dna)
//          */
//       });
//     });
// });
