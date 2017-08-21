"use strict";

const Maybe = require('./kansuu-monad.js').maybe,
  array = require('./kansuu-array.js');
const expect = require('expect.js');

// 'record' module
// ==============
const Record = {
  empty: (key) => {
    return Maybe.nothing();
  },
  // set:: (String, Any) => Maybe[Any]
  set: (key,value) => {
    expect(key).to.a('string');
    return (aRecord) => {
      expect(aRecord).to.a('function');
      return (queryKey) => {
        expect(queryKey).to.a('string');
        if(key === queryKey) {
          return Maybe.just(value);
        } else {
          return Record.get(queryKey)(aRecord);
        }
      };
    }
  },
  // get:: String => Record => Maybe[Any]
  get: (key) => {
    expect(key).to.a('string');
    return (aRecord) => {
      expect(aRecord).to.a('function');
      return aRecord(key);
    };
  },
  unit:(key,value) => {
    return Record.set(key,value)(Record.empty);
  },
  // Record#fromObject
  //  construct Record from JavaScript object data
  fromObject: (object) => {
    expect(object).to.a('object');
    if (!Object.entries)
      Object.entries = function( obj ){
        var ownProps = Object.keys( obj ),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
        while (i--)
          resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
      };
    const entries = Object.entries(object);
    return array.foldr(entries)(Record.empty)(item => {
      return (accumulator) => {
        expect(item).to.a('array');
        expect(accumulator).to.a('function');
        const key = array.head(item),
          value = array.head(array.tail(item));
        return Record.set(key, value)(accumulator);
      };
    });
  },
}; /* end of 'Record' module */

module.exports = Record;


