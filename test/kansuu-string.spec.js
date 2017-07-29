"use strict";

var expect = require('expect.js');
const string = require('../lib/kansuu-string.js');
const List = require('../lib/kansuu-monad.js').list;

describe("'string' module", () => {
  it("'head'", (next) => {
  	expect(string.head("abc")).to.be("a");
    next();
  });
  it("'tail'", (next) => {
  	expect(string.tail("abc")).to.be("bc");
    next();
  });
  it("'toList'", (next) => {
    const alist = string.toList("abc");
    expect(List.head(alist)).to.equal("a")
    next();
  });
  it("'toArray'", (next) => {
  	expect(string.toArray("abc")).to.eql([ 'a', 'b', 'c' ]);
    next();
  });
});
