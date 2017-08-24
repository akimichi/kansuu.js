"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  math = require('../../lib/kansuu.js').math,
  List = require('../../lib/kansuu.js').monad.list,
  Cont = require('../../lib/kansuu.js').monad.cont,
  Pair = require('../../lib/kansuu-pair.js');

describe("'Cont' monad module", () => {
  describe("Cont monad and state transition", () => {
    it('mainLevel', (next) => {
      var initialSession = {
        count: 0
      };
      const mainLevel = (session) => {
        const main = (session) => {
          session.count = session.count + 1;
          return session;
        };
        return Cont.unit(main(session));
      };
      expect(
        mainLevel(initialSession)(Cont.stop).count
      ).to.eql(
        1
      );
      next();
    });
    it('mainLevelとcont', (next) => {
      var initialSession = {
        count: 0
      };
      const mainLevel = (session) => {
        return (cont) => {
          const main = (session) => {
            session.count = session.count + 1;
            return session; 
          };
          return Cont.unit(main(session))(cont);
        };
      };
      expect(
        mainLevel(initialSession)(Cont.stop).count
      ).to.eql(
        1
      );
      next();
    });
    it('mainLevelとsubLevel', (next) => {
      var initialSession = {
        count: 0
      };
      const mainLevel = (session) => {
        return (cont) => {
          const mainBody = (session) => {
            session.count = session.count + 1;
            return session; 
          };
          return subLevel(mainBody(session))(cont);
        };
      };
      const subLevel = (session) => {
        return (cont) => {
          const subBody = (session) => {
            session.count = session.count + 1;
            return session;
          };
          return Cont.unit(subBody(session))(cont);
        };
      };
      expect(
        mainLevel(initialSession)(Cont.stop).count
      ).to.eql(
        2
      );
      next();
    });
  });
  describe("Cont#unit", () => {
    it('square', (next) => {
      // ~~~haskell
      // square :: Int -> ((Int -> r) -> r)
      // square x = \k -> k (x * x)
      // ~~~
      const square = (n) => {
        return n * n;
      };
      const square3 = Cont.unit(square(3)); 
      expect(
        square3(Cont.stop)
      ).to.eql(
        9
      );
      const squareCPS = Cont.unit(square);
      expect(
        squareCPS(Cont.stop)(4)
      ).to.eql(
        16 
      );
      next();
    });
  });
  describe("Cont#flatMap", () => {
    it('loopを回数分だけ実行する', (next) => {
      const loop = (n) => {
        const body = (n) => {
          return n-1; 
        };
        return Cont.flatMap(Cont.unit(body(n)))(result => {
          if(result === 0){
            return Cont.unit(result);
          } else {
            return loop(result);
          }
        });
        // return (cont) => {
        //   const body = (n) => {
        //     return n-1; 
        //   };
        //   return Cont.flatMap(Cont.unit(body(n)))(mainResult => {
        //     if(mainResult === 0){
        //       return Cont.unit(mainResult);
        //     } else {
        //       return loop(mainResult);
        //     }
        //   })(cont);
        // };
      };
      expect(
        loop(3)(Cont.stop)
      ).to.eql(
        0
      );
      next();
    });
    it('mainLevelとsubLevel', (next) => {
      var initialSession = {
        count: 0
      };
      const mainLevel = (session) => {
        const mainBody = (session) => {
          session.count = session.count + 1;
          return session; 
        };
        return Cont.flatMap(Cont.unit(mainBody(session)))(mainResult => {
          return subLevel(mainResult);
        });
        // return (cont) => {
        //   const mainBody = (session) => {
        //     session.count = session.count + 1;
        //     return session; 
        //   };
        //   return Cont.flatMap(Cont.unit(mainBody(session)))(mainResult => {
        //     return subLevel(mainResult);
        //   })(cont);
        // };
      };
      const subLevel = (session) => {
        const subBody = (session) => {
          session.count = session.count + 1;
          return session;
        };
        return Cont.unit(subBody(session));
        // return (cont) => {
        //   const subBody = (session) => {
        //     session.count = session.count + 1;
        //     return session;
        //   };
        //   // return subBody(session)(cont);
        //   return Cont.unit(subBody(session));
        // };
      };
      expect(
        mainLevel(initialSession)(Cont.stop).count
      ).to.eql(
        2
      );
      next();
    });
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
