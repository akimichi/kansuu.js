"use strict";

const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  base = require('../lib/kansuu-base.js'),
  Tree = require('../lib/kansuu-tree.js');


describe("'bTree' module", () => {
  it("'btree#unit'", (next) => {
    const btree = Tree.unit(1);
    console.log(btree);
    Tree.match(btree,{
      leaf: (value) => {
        expect(value ).to.eql(1);

      },
      fork: (a, b) => {
        expect().fail() 
      }
    });
    next();
  });
  it("'btree#size'", (next) => {
    this.timeout(3000);
    var btree = __.btree.mkBtree.call(__, __.list.mkList.call(__, [0,1,2,3]));
    expect(
      __.btree.size.call(__,btree)
    ).to.eql(
      4
    );
    next();
  });
  it("'btree#flatMap'");
  it("'btree#flatten'", (next) => {
    this.timeout(3000);
    var btree = __.btree.mkBtree.call(__, __.list.mkList.call(__, [0,1,2,3]));
    expect(
      __.list.toArray.call(__, __.btree.flatten.call(__,btree))
    ).to.eql(
      [0,1,2,3]
    );
    next();
  });
  it("'btree#map'", (next) => {
    this.timeout(3000);
    var map = __.btree.map.bind(__);
    var btree = __.btree.mkBtree.call(__, __.list.mkList.call(__, [0,1,2]));
    expect(
      __.list.toArray.call(__,
                           __.btree.flatten.call(__,__.btree.map.call(__,btree)(function(n){
                             return n * 2;
                           })))
    ).to.eql(
      [0,2,4]
    );
    next();
  });

});
