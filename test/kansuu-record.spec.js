"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 List = require('../lib/kansuu.js').monad.list,
 Maybe = require('../lib/kansuu.js').monad.maybe,
 Record = require('../lib/kansuu-record.js'); 


describe("'record' module", () => {
  const toArray = List.toArray,
    nothing = Maybe.nothing;
  var some = (n) => {
    return Maybe.unit(n);
  };

  it("'record'", (next) => {
    // expect(function(){
    //   return Record.empty(1);
    // }()).to.eql(
    //   nothing
    // );
    expect(() => {
      const record = Record.set('a',0);
      return Record.get('a');
    })()).to.eql(
      some('a')
    );
    // expect(function(){
    //   var array = __.record.extend.bind(__)(__.record.extend.bind(__)(__.record.empty.bind(__))(0)('a'))(1)('b');
    //   return array(1);
    // }()).to.eql(
    //   some('b')
    // );
    expect(function(){
      // var object = __.record.extend.bind(__)(__.record.empty.bind(__))('key')('value');
      // return object('key');
    // }()).to.eql(
      // some('value')
    // );
    next();
  });
});
