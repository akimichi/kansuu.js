"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');


describe("'btree' module", () => {
  // it("'btree#mkBtree'", (next) => {
  //   var mkBtree = __.btree.mkBtree.bind(__);
  //   var btree = mkBtree(__.list.mkList.call(__, [0,1,2]));
  //   console.log(btree);
  //   expect(
  //     btree.leaf
  //   ).to.eql(
  //     4
  //   );
  //   next();
  // });
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
