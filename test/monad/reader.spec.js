"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

  // describe("Readerモナド",() => {
  //   it("add10", (next) => {
  //     // main = print $ runReader add10 1
  //     // --
  //     // add10 :: Reader Int Int
  //     // add10 = do
  //     //   x <- ask                          -- 環境変数(x=1)を得る
  //     //   y <- local (+1) add10             -- localの使用例, y=12
  //     //   s <- reader . length . show $ x   -- 返り値は自由である例
  //     //  return (x+10)    
  //     var add10 = __.monad.reader.flatMap(__.monad.reader.ask)((x) => {
  //       return __.monad.reader.unit(x + 10);
  //     });
  //     var identity = (any) => {
  //       return any;
  //     };
  //     //var ask = __.monad.reader.Reader(identity);
  //     var ask = {
  //       run: identity
  //     }; 
  //     expect(
  //      __.monad.reader.run(add10)(1)
  //     ).to.eql(
  //       0
  //     );
  //     next();
  //   });

