"use strict";

const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  base = require('../lib/kansuu-base.js'),
  List = require('../lib/kansuu-monad.js').list,
  BTree = require('../lib/kansuu-btree.js');


describe("'BTree' module", () => {
  it("'btree#unit'", (next) => {
    const btree = BTree.unit(1);
    console.log(btree);
    BTree.match(btree,{
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
    const btree = BTree.mkBtree(List.mkList([0,1,2,3]));
    expect(
      BTree.size(btree)
    ).to.eql(
      4
    );
    next();
  });
  it("'btree#map'", (next) => {
    const btree = BTree.mkBtree(List.mkList([0,1,2]));
    expect(
      List.toArray(BTree.flatten(BTree.map(btree)(n => {
        return n * 2;
      })))
    ).to.eql(
      [0,2,4]
    );
    next();
  });
  it("'btree#flatten'", (next) => {
    const btree = BTree.mkBtree(List.mkList([0,1,2,3]));
    expect(
      List.toArray(BTree.flatten(btree))
    ).to.eql(
      [0,1,2,3]
    );
    next();
  });

});
