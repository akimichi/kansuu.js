"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  math = require('../../lib/kansuu.js').math,
  List = require('../../lib/kansuu.js').monad.list,
  Cont = require('../../lib/kansuu.js').monad.cont,
  Pair = require('../../lib/kansuu-pair.js');

describe("'Cont' monad module", () => {

  describe("Cont#unit", () => {
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
        square3(Cont.stop)
      ).to.eql(
        9
      );
      next();
    });
  });
  describe("Cont#flatMap", () => {
    const Cont = require('../../lib/kansuu.js').monad.cont;
    it('Cont.flatMapで算術演算を組み合わせる例', (next) => {
      const addCPS = (n,m) => {
        const add = (n,m) => {
          return n + m;
        };
        return Cont.unit(add(n,m)); 
      };
      expect(
        addCPS(2,3)(Cont.stop)
      ).to.eql(
        5
      );
      const multiplyCPS = (n,m) => {
        const multiply = (n,m) => {
          return n * m;
        };
        return Cont.unit(multiply(n,m)); 
      };
      const subtractCPS = (n,m) => {
        const subtract = (n,m) => {
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
        })(Cont.stop)
      ).to.eql(
        15
      );
      next();
    });

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
        squareCPS(2)(Cont.stop)
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
        safeDivideCC(4,2)(Cont.stop)
      ).to.eql(
        2
      );
      expect(
        safeDivideCC(4,0)(Cont.stop)
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
