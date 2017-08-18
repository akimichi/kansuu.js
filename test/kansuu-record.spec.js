"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 Record = require('../lib/kansuu-record.js'),


describe("'record' module", function() {
  var toArray = __.list.toArray.bind(__);
  var some = function(n){
    return __.monad.maybe.unit.bind(__)(n);
  };
  var nothing = __.monad.maybe.nothing;
  it("'record'", function(next) {
    /* #@range_begin(record_module_test) */
    expect(function(){
      return __.record.empty.bind(__)(1);
    }()).to.eql(
      nothing
    );
    expect(function(){
      var array = __.record.extend.bind(__)(__.record.empty.bind(__))(0)('a');
      return array(0);
    }()).to.eql(
      some('a')
    );
    expect(function(){
      var array = __.record.extend.bind(__)(__.record.extend.bind(__)(__.record.empty.bind(__))(0)('a'))(1)('b');
      return array(1);
    }()).to.eql(
      some('b')
    );
    expect(function(){
      var object = __.record.extend.bind(__)(__.record.empty.bind(__))('key')('value');
      return object('key');
    }()).to.eql(
      some('value')
    );
    /* #@range_end(record_module_test) */
    next();
  });
});
