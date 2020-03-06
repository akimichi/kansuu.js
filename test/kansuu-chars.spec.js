"use strict";

const expect = require('expect.js');


// ### Charsのテスト
describe("Charsをテストする",() => {
  const Chars = require('../lib/kansuu-chars.js');

  it("Chars.consをテストする",(done) => {
    const chars = Chars.cons("a", Chars.empty());
    Chars.match(chars, {
      empty: () => {
        expect().to.fail()
      },
      cons: (head, tail) => {
        expect(head).to.eql('a')
        expect(tail).to.eql('')
        done();
      }
    })
  });
});

