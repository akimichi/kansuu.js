"use strict";

const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  base = require('../lib/kansuu-base.js'),
  List = require('../lib/kansuu-monad.js').list,
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
    const btree = Tree.mkBtree(List.mkList([0,1,2,3]));
    expect(
      Tree.size(btree)
    ).to.eql(
      4
    );
    next();
  });
  it("'btree#map'", (next) => {
    const btree = Tree.mkBtree(List.mkList([0,1,2]));
    expect(
      List.toArray(Tree.flatten(Tree.map(btree)(n => {
        return n * 2;
      })))
    ).to.eql(
      [0,2,4]
    );
    next();
  });
  it("'btree#flatMap'");
  it("'btree#flatten'", (next) => {
    const btree = Tree.mkBtree(List.mkList([0,1,2,3]));
    expect(
      List.toArray(Tree.flatten(btree))
    ).to.eql(
      [0,1,2,3]
    );
    next();
  });

});
