"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Env = require('../../examples/interpreter.js').env,
  ID = require('../../lib/kansuu.js').monad.identity,
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu-monad.js').list,
  Pair = require('../../lib/kansuu.js').pair,
  Parser = require('../../lib/kansuu.js').monad.parser;

describe("Monadic Parser", () => {
  var abc = List.fromString("abc");
  describe("parse", (next) => {
    it("Parser#zero", (next) => {
      var input = List.fromString("abc");
      expect(
        List.isEmpty(
          Parser.parse(Parser.zero)(input)
        )
      ).to.eql(
        true 
      );
      next();
    });
    it("Parser#unit", (next) => {
      expect(
        Pair.left(List.head(
          Parser.parse(Parser.unit(1))(abc)
        ))
      ).to.eql(
        1 
      );
      // expect(
      //   PP.print(Parser.parse(Parser.unit(1))(abc))
      // ).to.eql(
      //   '[(1,[a,b,c,nil]),nil]'
      // );
      next();
    });
    it("item", (next) => {
      expect(
        List.isEmpty(
          Parser.item(List.empty())
        )
      ).to.eql(
        true 
      );
      expect(
        Pair.left(List.head(
            Parser.item(List.fromString("abc"))))
      ).to.eql(
        'a'
      );
      // expect(
      //   PP.print(Parser.item(List.fromString("abc")))
      // ).to.eql(
      //   '[(a,[b,c,nil]),nil]'
      // );
      next();
    });
  });
  describe("fmap", (next) => {
    // it("toUpper", (next) => {
    //   var input = List.fromString("abc");
    //   var toUpper = (s) => {
    //     return s.toUpperCase();
    //   };
    //   expect(
    //     PP.print(
    //       Parser.parse(Parser.fmap(toUpper)(Parser.item))(input)
    //     )
    //   ).to.eql(
    //     '[(A,[b,c,nil]),nil]'
    //   );
    //   next();
    // });
  });
  describe("monad", (next) => {
    // it("three", (next) => {
    //   var input = List.fromString("abcdef");
    //   var three = Parser.flatMap(Parser.item)((x) => {
    //     return Parser.flatMap(Parser.item)((_) => {
    //       return Parser.flatMap(Parser.item)((z) => {
    //         return Parser.unit(Pair.cons(x,z));
    //       });
    //     });
    //   });
    //   expect(
    //     PP.print(
    //       three(input)
    //     )
    //   ).to.eql(
    //     '[((a,c),[d,e,f,nil]),nil]'
    //   );
    //   next();
    // });
    // it("flapMap", (next) => {
    //   var input = List.fromString("  +  ");
    //   var add_or_subtract = Parser.alt(Parser.symbol(List.fromString("+")), Parser.symbol(List.fromString("-")));
    //   var parser = Parser.flatMap(add_or_subtract)((operator) => {
    //     return Parser.unit(operator);
    //   });
    //   expect(
    //     PP.print(
    //       Parser.parse(parser)(input)
    //     )
    //   ).to.eql('[(+,[]),nil]');
    //   next();
    // });
  });
  describe("alternative", (next) => {
    it("alt", (next) => {
      var input = List.fromString("abc");
      expect(
        Pair.left(List.head(
          Parser.parse(
            Parser.alt(Parser.item, Parser.unit("d"))
          )(input)
        ))
      ).to.eql(
        'a'
      );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.alt(Parser.item, Parser.unit("d"))
      //     )(input)
      //   )
      // ).to.eql(
      //   '[(a,[b,c,nil]),nil]'
      // );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.alt(Parser.empty, Parser.unit("d"))
      //     )(input)
      //   )
      // ).to.eql(
      //   '[(d,[a,b,c,nil]),nil]'
      // );
      next();
    });
  });
  describe("派生したパーサー", (next) => {
    it("digit", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.digit()
            )(List.fromString("123"))
          )
        )
      ).to.eql(
        '1'
      );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.digit()
      //     )(List.fromString("123"))
      //   )
      // ).to.eql(
      //   '[(1,[2,3,nil]),nil]'
      // );
      next();
    });
    it("letter", (next) => {
      expect(
        Pair.left(
          List.head(
          Parser.parse(
            Parser.letter()
          )(List.fromString("abc"))
        ))
      ).to.eql(
        'a'
      );
      expect(
        Pair.left(
          List.head(
          Parser.parse(
            Parser.letter()
          )(List.fromString("ABC"))
        ))
      ).to.eql(
        'A'
      );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.alphanum()
      //     )(List.fromString("123"))
      //   )
      // ).to.eql(
      //   '[(1,[2,3,nil]),nil]'
      // );
      next();
    });
    it("alphanum", (next) => {
      expect(
        Pair.left(
          List.head(
          Parser.parse(
            Parser.alphanum()
          )(List.fromString("123"))
        ))
      ).to.eql(
        '1'
      );
      // expect(
      //   List.toString(Pair.left(List.head(
      //     Parser.parse(
      //       Parser.alphanum()
      //     )(List.fromString(" def"))
      //   )))
      // ).to.eql(
      //   '1'
      // );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.alphanum()
      //     )(List.fromString("123"))
      //   )
      // ).to.eql(
      //   '[(1,[2,3,nil]),nil]'
      // );
      next();
    });
    it("char", (next) => {
      expect(
        Pair.left(
          List.head(
          Parser.parse(
            Parser.char("a")
          )(List.fromString("a"))
        ))
      ).to.eql(
        'a'
      );
      next();
    });
    it("chars", (next) => {
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.chars(List.fromString("abc"))
            )(List.fromString("abcdef"))
          )
        ))
      ).to.eql(
        "abc"
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.chars(List.fromString("#t"))
            )(List.fromString("#t"))
          )
        ))
      ).to.eql(
        '#t'
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.chars(List.fromString("hello"))
            )(List.fromString("hello there"))
          )
        ))
      ).to.eql(
        'hello'
      );
      next();
    });
    it("word", (next) => {
      const input = List.fromString("Yes!");
      expect(
        List.length(Parser.parse(Parser.word())(input))
      ).to.eql(
        1 
        // 4 
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(Parser.word())(input)
          )
        ))
      ).to.eql(
        'Yes' 
      );
      next();
    });
    it("string", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.string()
            )(List.fromString("\"abc\""))
          )
        )
      ).to.eql(
        "abc" 
      );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.string()
      //     )(List.fromString("\"abc\""))
      //   )
      // ).to.eql(
      //   '[(abc,[]),nil]'
      // );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.string()
      //     )(List.fromString("  \"abc\"  "))
      //   )
      // ).to.eql(
      //   '[(abc,[]),nil]'
      // );
      // expect(
      //   PP.print(
      //     Parser.parse(
      //       Parser.string()
      //     )(List.fromString("  \"  abc  \"  "))
      //   )
      // ).to.eql(
      //   '[(  abc  ,[]),nil]'
      // );
      next();
    });
  });
  describe("manyパーサ", (next) => {
    it("many digit", (next) => {
      expect(
        List.toString(Pair.left(List.head(
          Parser.parse(
            Parser.many(Parser.digit())
          )(List.fromString("123abc"))
        )))
      ).to.eql(
        '123'
        // '[([1,2,3,nil],[a,b,c,nil]),nil]'
      );
      expect(
        List.toString(Pair.left(List.head(
          Parser.parse(
            Parser.many(Parser.digit())
          )(List.fromString("abc"))
        )))
      ).to.eql(
        ''
      );
      next();
    });
    // it("some digit", (next) => {
    //   expect(
    //     PP.print(
    //       Parser.parse(
    //         Parser.some(Parser.digit())
    //       )(List.fromString("abc"))
    //     )
    //   ).to.eql(
    //     '[]'
    //   );
    //   next();
    // });
  });
  describe("chainパーサ", (next) => {
    it("chainl1", (next) => {
      // nat :: Parser Int
      // nat = chainl1 [ord x - ord ’0’ | x <digit] op
      //         where
      //            op m n = 10*m + n
      const nat = () => {
        const _op = () => {
          return Parser.unit(
            (m) => {
              return (n) => {
                return 10 * m + n
              };
            });
        };
        const _digit = () => {
          return Parser.flatMap(Parser.digit())(n => {
            return Parser.unit(parseInt(n,10)); 
          })
        };
        return Parser.chainl1(_digit, _op);
      };
      expect(
        Pair.left(List.head(
          Parser.parse(nat())(List.fromString("123"))
        ))
      ).to.eql(
        123
        // '[(123,[]),nil]'
      );
      next();
    });
  });
  describe("sep parser", (next) => {
    it("sepby1", (next) => {
      //  parseTest (sepBy word (char ',')) "abc,def,ghi" 
      //              where word = many1 letter
      // ["abc","def","ghi"]
      const sep = Parser.char(","); 
      const word = Parser.many1(Parser.letter());
      const words = Pair.left(List.head(
        Parser.parse(
          Parser.sepBy1(word)(sep)
        )(List.fromString("abc,def,ghi"))
      ));
      expect(
        List.toString(List.head(words))
      ).to.eql(
        "abc"
      );
      expect(
        List.toString(List.head(List.tail(words)))
      ).to.eql(
        "def"
      );
      expect(
        List.toString(List.head(List.tail(List.tail(words))))
      ).to.eql(
        "ghi"
      );
      next();
    });
    it("bracket", (next) => {
      const open = Parser.char("("); 
      const close = Parser.char(")"); 
      expect(
        List.toString(Pair.left(List.head(
          Parser.parse(
            Parser.bracket(open,Parser.ident, close)
          )(List.fromString("(identifier)"))
        )))
      ).to.eql(
        "identifier"
      );
      next();
    });
  });
  it("ident", (next) => {
    expect(
      List.toString(Pair.left(List.head(
        Parser.parse(
          Parser.ident()
        )(List.fromString("abc def"))
      )))
    ).to.eql(
      "abc"
      // '[(Symbol(abc),[ ,d,e,f,nil]),nil]'
    );
    next();
  });
  it("nat", (next) => {
    expect(
      Pair.left(List.head(
        Parser.parse(
          Parser.nat()
        )(List.fromString("123"))
      ))
    ).to.eql(
      123
      // '[(123,[]),nil]'
    );
    next();
  });
  it("int", (next) => {
    expect(
      Pair.left(List.head(
        Parser.parse(
          Parser.int(Parser)
        )(List.fromString("-123 abc"))
      ))
    ).to.eql(
      -123
      // '[(-123,[a,b,c,nil]),nil]'
    );
    expect(
      Pair.left(List.head(
        Parser.parse(
          Parser.int(Parser)
        )(List.fromString("123 abc"))
      ))
    ).to.eql(
      123
      // '[(123,[a,b,c,nil]),nil]'
    );
    next();
  });
  // it("float", (next) => {
  //   expect(
  //     PP.print(
  //       Parser.parse(
  //         Parser.float.call(Parser)
  //       )(List.fromString("0.1"))
  //     )
  //   ).to.eql(
  //     '[(0.1,[]),nil]'
  //   );
  //   expect(
  //     PP.print(
  //       Parser.parse(
  //         Parser.float.call(Parser)
  //       )(List.fromString("0.123"))
  //     )
  //   ).to.eql(
  //     '[(0.123,[]),nil]'
  //   );
  //   expect(
  //     PP.print(
  //       Parser.parse(
  //         Parser.float.call(Parser)
  //       )(List.fromString("1.1"))
  //     )
  //   ).to.eql(
  //     '[(1.1,[]),nil]'
  //   );
  //   expect(
  //     PP.print(
  //       Parser.parse(
  //         Parser.float.call(Parser)
  //       )(List.fromString("-1.1"))
  //     )
  //   ).to.eql(
  //     '[(-1.1,[]),nil]'
  //   );
  //   next();
  // });
  it("spaces", (next) => {
    expect(
      Pair.isEmpty(Pair.left(List.head(
        Parser.parse(
          Parser.spaces()
        )(List.fromString("  abc"))
      )))
    ).to.eql(
      true
    );
    next();
  });
  it("lineComment", (next) => {
    expect(
      Pair.isEmpty(Pair.left(List.head(
        Parser.parse(
          Parser.lineComment("//")
        )(List.fromString("// this is line comment"))
      )))
    ).to.eql(
      true 
    );
    next();
  });
  describe("token parser", (next) => {
    it("natural", (next) => {
      expect(
        Pair.left(List.head(
          Parser.parse(
            Parser.natural()
          )(List.fromString("   123   "))
        ))
      ).to.eql(
        123
        // '[(123,[]),nil]'
      );
      next();
    });
    it("integer", (next) => {
      expect(
        Pair.left(List.head(
          Parser.parse(
            Parser.integer()
          )(List.fromString("   -123   "))
        ))
      ).to.eql(
        -123
        // '[(-123,[]),nil]'
      );
      next();
    });
    it("numeric", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(Parser.numeric())(List.fromString("   -123   "))
          )
        )
      ).to.eql(
        -123 
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.numeric()
            )(List.fromString("   0.123   "))
          )
        )
      ).to.eql(
        0.123
      );
      next();
    });
    // it("boolean", (next) => {
    //   expect(
    //     Pair.left(
    //       List.head(
    //         Parser.parse(
    //           Parser.boolean()
    //         )(List.fromString("  #t  "))
    //       )
    //     )
    //   ).to.eql(
    //     true 
    //   );
    //   expect(
    //     Pair.left(
    //       List.head(
    //         Parser.parse(
    //           Parser.boolean()
    //         )(List.fromString("  #f  "))
    //       )
    //     )
    //   ).to.eql(
    //     false 
    //   );
    //   // expect(
    //   //   PP.print(
    //   //     Parser.parse(
    //   //       Parser.boolean()
    //   //     )(List.fromString("  #t  "))
    //   //   )
    //   // ).to.eql(
    //   //   '[(true,[]),nil]'
    //   // );
    //   next();
    // });
    it("symbol", (next) => {
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.symbol(List.fromString("+"))
            )(List.fromString("  +  "))
          )))
      ).to.eql(
        '+'
        // '[(+,[]),nil]'
      );
      next();
    });
    it("identifier", (next) => {
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.identifier([])
            )(List.fromString("   abc"))
          )))
      ).to.eql(
        'abc'
        // '[(Symbol(abc),[]),nil]'
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.identifier(["lambda"])
            )(List.fromString("anonymous function"))
          )))
      ).to.eql(
        'anonymous'
        // '[(+,[]),nil]'
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.identifier(["lambda"])
            )(List.fromString("lambda function"))
          )))
      ).to.eql(
        ''
        // '[(+,[]),nil]'
      );
      expect(
        List.toString(Pair.left(
          List.head(
            Parser.parse(
              Parser.identifier(["lambda"])
            )(List.fromString("lam "))
          )))
      ).to.eql(
        'lam'
        // '[(+,[]),nil]'
      );
      next();
    });
  });
});
