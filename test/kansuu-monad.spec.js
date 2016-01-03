"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'monad' module", function() {
  describe("'random' monad", function() {
    // var int = __.monad.random.unit.bind(__)(0);
    // var ns = __.monad.random.flatMap.bind(__)(int)(x => {
    //   return __.monad.random.flatMap.bind(__)(int)(y => {
    //  return
    //   }
    // })
    it("random.int", function(next){
      //var rng = seedrandom("seed");
      rng.seed("seed");
      var intRandom = __.monad.random.int.bind(__)(rng);
      expect(
        intRandom.left
      ).to.eql(
          -1937831252
      );
      //var intRandom2 = __.monad.random.int.bind(__)(intRandom.right);
      expect(
        __.monad.random.int.bind(__)(intRandom.right).left
      ).to.eql(
          -884076225
      );
      expect(
        __.monad.random.int.bind(__)(intRandom.right).left
      ).to.eql(
          -505527131
      );
      // expect(
      //     __.monad.random.int.bind(__)(intRandom.right()).left
      // ).to.eql(
      //    2
      //    //4.612568818010603e+306
      // );
      next();
    });
    it("random.ints", function(next){
      var rng = Random.engines.mt19937();
      rng.seed("seed");
      var ints = __.monad.random.ints.bind(__)(3)(rng);
      expect(
        __.list.length.bind(__)(ints.left)
      ).to.eql(
        3
      );
      expect(
        __.list.toArray.bind(__)(ints.left)
      ).to.eql(
        [ -1937831252, -884076225, -725654408 ]
      );
      next();
    });
  });
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
  // });
});
