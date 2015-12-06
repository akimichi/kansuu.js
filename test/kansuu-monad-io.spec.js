"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'IO' monad module", function() {
  describe("'IO' monad", function() {
    it("'print'", (next) => {
      var printer = __.monad.IO.print.call(__,
                                           "this is a test");
      printer.run();
      var printEven = (n) => {
        if(n % 2 === 0){
          return __.monad.IO.print.call(__,
                                           true);
        } else {
          return __.monad.IO.print.call(__,
                                           false);
        }
      };
      printEven(2).run();
      // expect(
      //   printEven(2)
      // ).to.eql(
      //   printEven(2)
      // );
      next();
    });
    it("IO#flatMap", (next) => {
      var readDecimal = __.monad.IO.readFile.call(__,
                                                  "test/resource/decimal.txt");
      // console.log(readDecimal.run())
      console.log(parseInt(readDecimal.run(), 10).toString(16));
      __.monad.IO.flatMap.call(__, readDecimal)((decimal) => {
        console.log(decimal);
        return __.monad.IO.print.call(__,
                                      parseInt(decimal, 10).toString(16));
      });
      next();
    });
  });
  describe("'writer' monad", function() {
    it("'writer'", (next) => {
      var squared = (x) => {
        return __.monad.writer.unit.bind(__)(x * x)(__.list.mkList.bind(__)([util.format("%s was squared.",x)]));
      };
      var halved = (x) => {
        return __.monad.writer.unit.bind(__)(x / 2)(__.list.mkList.bind(__)([util.format("%s was halved.",x)]));
      };
      var answer = __.monad.writer.flatMap.bind(__)(
        __.monad.writer.flatMap.bind(__)(
          __.monad.writer.unit.bind(__)(4)(__.list.empty)
        )(squared)
      )(halved);
      expect(
        answer.value
      ).to.eql(
        8
      );
      expect(
        __.list.toArray.bind(__)(answer.buffer)
      ).to.eql(
        [ '4 was squared.', '16 was halved.' ]
      );
      next();
    });
  });
});
