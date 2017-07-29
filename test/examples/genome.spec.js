"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Array = require('../../lib/kansuu-array.js'),
  genome = require('../../examples/genome.js');

describe("'genome' example", () => {

  describe('complements', () => {
    it('can return its complements', (next) => {
      expect(
        genome.complements(['G', 'C', 'G'])
      ).to.eql(
        ['C', 'G', 'C']
      );
      expect(
        Array.map([["T", "A", "C"], ["C", "G", "C"]])(genome.complements)
      ).to.eql(
        [['A', 'T', 'G'], ['G', 'C', 'G']]
      );
      expect(
        Array.map([["T", "A", "C"], ["C", "G", "C"]])(genome.complements)
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
        genome.codons(seq)
      ).to.eql(
        [['A', 'T', 'G'], ['C', 'A', 'T']]
      );
      next();
    });
  });
  describe('translate', () => {
    it('can translate from rna codon to amino', (next) => {
      expect(
        genome.translate(['G', 'C', 'G'])
      ).to.eql(
        ['ala']
      );
      expect(
        genome.translate(['A', 'U', 'G'])
      ).to.eql(
        ['met']
      );
      next();
    });
  });
  describe('transcript', function() {
    it('can transcript from dna sequence to rna sequence', (next) => {
      expect(
        genome.transcript(["T", "A", "C"])
      ).to.eql(
        ['A', 'U', 'G']
      );
      expect(
        genome.transcript(["C", "G", "C"])
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
