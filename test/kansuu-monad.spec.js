"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'monad' module", function() {
  // ### Contモナドのテスト
  describe("Contモナドをテストする",() => {
    const  Cont = require('../lib/kansuu-monad.js').Cont ;

    var identity = (x) => {
      return x;
    };
    // ~~~haskell
    // *Main> let s3 = Cont (square 3)
    // *Main> print =: runCont s3
    // 9 
    // ~~~
    it('square', (next) => {
      // ~~~haskell
      // square :: Int -> ((Int -> r) -> r)
      // square x = \k -> k (x * x)
      // ~~~
      var square = (n) => {
        return n * n;
      };
      var square3 = Cont.unit(square(3)); 
      expect(
        square3(identity)
      ).to.eql(
        9
      );
      next();
    });
    // **Cont.flatMap**で算術演算を組み合わせる例
    it('Cont.flatMapで算術演算を組み合わせる例', (next) => {
      var addCPS = (n,m) => {
        var add = (n,m) => {
          return n + m;
        };
        return Cont.unit(add(n,m)); 
      };
      expect(
        addCPS(2,3)(identity)
      ).to.eql(
        5
      );
      var multiplyCPS = (n,m) => {
        var multiply = (n,m) => {
          return n * m;
        };
        return Cont.unit(multiply(n,m)); 
      };
      var subtractCPS = (n,m) => {
        var subtract = (n,m) => {
          return n - m;
        };
        return Cont.unit(subtract(n,m)); 
      };
      /* ((2 + 3) * 4) - 5 = 15 */
      expect(
        Cont.flatMap(addCPS(2,3))((addResult) => {
          return Cont.flatMap(multiplyCPS(addResult,4))((multiplyResult) => {
            return Cont.flatMap(subtractCPS(multiplyResult,5))((result) => {
              return Cont.unit(result);
            });
          });
        })(identity)
      ).to.eql(
        15
      );
      next();
    });
    describe("callCCを利用する",() => {
      it('square using callCC', (next) => {
        // ~~~haskell
        // -- Without callCC
        // square :: Int -> Cont r Int
        // square n = return (n ˆ 2)
        // -- With callCC
        // squareCCC :: Int -> Cont r Int
        // squareCCC n = callCC $ \k -> k (n ˆ 2) 
        // ~~~
        var squareCPS = (n) => {
          return Cont.unit(n * n);
        };
        expect(
          squareCPS(2)(identity)
        ).to.eql(
          4
        );
        var safeDivideCC = (n,m) => {
          return Cont.callCC((k) => {
            if(m !== 0) {
              return k(n / m);
            }
            return k(null);
          });
        };
        expect(
          safeDivideCC(4,2)(identity)
        ).to.eql(
          2
        );
        expect(
          safeDivideCC(4,0)(identity)
        ).to.be(
          null
        );
        next();
      });
      it('even', (next) => {
        var even = (n) => {
          return (n % 2) === 0;
        };
        expect(
          even(3 * Cont.callCC((k) => {
            return k(1 + 2);
          }))
        ).to.eql(
          false
        );
        next();
      });
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
