"use strict";

const Maybe = require('./kansuu-monad.js').maybe; 
const expect = require('expect.js');

// 'record' module
// ==============
const Record = {
  empty: (key) => {
    return Maybe.nothing();
  },
  // set:: (String, Any) => Record
  set: (key,value) => {
    expect(key).to.a('string');
    return (aRecord) => {
      expect(aRecord).to.a('function');
      return (queryKey) => {
        expect(queryKey).to.a('string');
        if(key === queryKey) {
          return Maybe.just(value);
        } else {
          return Record.get(key)(aRecord);
        }
      };
    }
  },
  // get:: String => Record => Any
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
  // (>>=) :: Record[a] -> (a -> Record[b]) -> Record[b]
  flatMap: (recordInstance) => {
    return (transform) => { // a => Record[b]
      expect(transform).to.a('function');
      return Record.set(transform)(recordInstance);
    };
  }
}; /* end of 'Record' module */

module.exports = Record;


  // objects: {
  //   empty: {
  //   },
  //   get: (key) => {
  //     var self = this;
  //     return (obj) => {
  //       expect(obj).to.an('object');
  //       return obj[key];
  //     };
  //   },
  //   isEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     var hasOwnProperty = Object.prototype.hasOwnProperty;
  //     for(var key in obj){
  //       if(hasOwnProperty.call(obj, key))
  //         return false;
  //     }
  //   },
  //   isNotEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     return self.not.call(self,self.objects.isEmpty(obj));
  //   },
  // },
  //
