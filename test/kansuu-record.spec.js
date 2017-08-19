"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 List = require('../lib/kansuu.js').monad.list,
 Maybe = require('../lib/kansuu.js').monad.maybe,
 Record = require('../lib/kansuu-record.js'); 


describe("'record' module", () => {
  const toArray = List.toArray,
    nothing = Maybe.nothing;
  const isEqual = Maybe.isEqual;
  var some = (n) => {
    return Maybe.unit(n);
  };

  it("'record'", (next) => {
    // expect(function(){
    //   return Record.empty(1);
    // }()).to.eql(
    //   nothing
    // );
    const record = Record.set('a',0)(Record.empty);
    expect(
      isEqual(
        Record.get('a')(record),
        some('1')
      )
    ).to.eql(
      false 
    );
    Maybe.match(Record.get('a')(record), {
      empty: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          0 
        )
      }
    })
    expect(function(){
      Record.flatMap(Record.set('b',2)(Record.empty))(newRecord => {
        Record.flatMap(Record.set('c',3)(newRecord))(finalRecord => {
            return Record.unit(finalRecord); 
        });
      });
      var array = Record.set('b',2))(1)('b');
      return array(1);
    }()).to.eql(
      some('b')
    );
    next();
  });
});
