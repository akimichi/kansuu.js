"use strict";

const util = require('util'),
  expect = require('expect.js'),
  seedrandom = require('seedrandom'),
  Random = require("random-js"),
  rng = Random.engines.mt19937(),
  fs = require('fs');

var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
const List = require('../lib/kansuu-monad.js').list,
  IO = require('../lib/kansuu-monad.js').io;

describe("'IO' monad", () => {
  it("IO#unit", (next) => {
    const unit = IO.unit(1);
    expect(
      IO.run(unit) 
    ).to.eql(
      1
    );
    next();
  });
  // ### IOモナドをテストする
  // IOモナドで参照透過性を確保する
  it('IOモナドで参照透過性を確保する', (next) => {
    expect(
      IO.flatMap(IO.readFile("./test/resource/state.txt"))((content) => {
        return IO.flatMap(IO.println(content))((_) => {
          return IO.done(_);
        });
      })()
    ).to.eql(
      IO.flatMap(IO.readFile("./test/resource/state.txt"))((content) => {
        return IO.flatMap(IO.println(content))((_) => {
          return IO.done(_);
        });
      })()
    );
    next();
  });
  it("IO#flatMap", (next) => {
    var readDecimal = IO.readFile("./test/resource/decimal.txt");
    // console.log(readDecimal.run())
    console.log(parseInt(IO.run(readDecimal), 10).toString(16));
    IO.flatMap(readDecimal)((decimal) => {
      console.log(decimal);
      return IO.print(parseInt(decimal, 10).toString(16));
    });
    next();
  });
  it('run関数の利用法', (next) => {
    expect(
      IO.run(IO.println("名前はまだない")) 
    ).to.eql(
      null
    );
    next();
  });
  describe('IOアクションを合成する', () => {
    /* IO.seq:: IO[a] => IO[b] => IO[b] */
    it("'print'", (next) => {
      var printer = IO.print("this is a test");
      IO.run(printer);
      var printEven = (n) => {
        if(n % 2 === 0){
          return IO.print("true");
        } else {
          return IO.print("false");
        }
      };
      IO.run(printEven(2));
      // expect(
      //   printEven(2)
      // ).to.eql(
      //   printEven(2)
      // );
      next();
    });
  });
});
  // describe("'writer' monad", function() {
  //   it("'writer'", (next) => {
  //     var squared = (x) => {
  //       return __.monad.writer.unit.bind(__)(x * x)(__.list.mkList.bind(__)([util.format("%s was squared.",x)]));
  //     };
  //     var halved = (x) => {
  //       return __.monad.writer.unit.bind(__)(x / 2)(__.list.mkList.bind(__)([util.format("%s was halved.",x)]));
  //     };
  //     var answer = __.monad.writer.flatMap.bind(__)(
  //       __.monad.writer.flatMap.bind(__)(
  //         __.monad.writer.unit.bind(__)(4)(__.list.empty)
  //       )(squared)
  //     )(halved);
  //     expect(
  //       answer.value
  //     ).to.eql(
  //       8
  //     );
  //     expect(
  //       __.list.toArray.bind(__)(answer.buffer)
  //     ).to.eql(
  //       [ '4 was squared.', '16 was halved.' ]
  //     );
  //     next();
  //   });
  // });

