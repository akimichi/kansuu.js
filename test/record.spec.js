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

  it("Record#fromObject", (next) => {
    const record = Record.fromObject({'a': 1, 'b':2 });
    Maybe.match(Record.get('a')(record), {
      nothing: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          1 
        )
      }
    })
    Maybe.match(Record.get('b')(record), {
      nothing: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          2 
        )
      }
    })
    next();
  });
  it("Record.setを重ねる", (next) => {
    const record = Record.set('a',1)(Record.set('a',2)(Record.empty));
    Maybe.match(Record.get('a')(record), {
      empty: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          1 
        )
      }
    })
    next();
  });
  it("record set sequence", (next) => {
    const record = Record.set('a',1)(Record.set('b',2)(Record.empty));
    Maybe.match(Record.get('a')(record), {
      empty: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          1 
        )
      }
    })
    Maybe.match(Record.get('b')(record), {
      nothing: () => {
        expect().to.fail();
      },
      just: (value) => {
        expect(
          value
        ).to.eql(
          2 
        )
      }
    })
    next();
  });
  it("'record'", (next) => {
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
    // const newRecord = Record.flatMap(Record.unit('b',2))((key, value) => {
    //   return Record.unit(key,value); 
    //   // return Record.flatMap(Record.set('c',3)(newRecord))(finalRecord => {
    //   //   return Record.unit(finalRecord); 
    //   // });
    // });
    // Maybe.match(Record.get('b')(newRecord), {
    //   empty: () => {
    //     expect().to.fail();
    //   },
    //   just: (value) => {
    //     expect(
    //       value
    //     ).to.eql(
    //       0 
    //     )
    //   }
    // })
    // expect(

    // ).to.eql(
    //   some('b')
    // );
    next();
  });
});
