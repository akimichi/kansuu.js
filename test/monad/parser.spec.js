"use strict";

const expect = require('expect.js'),
  __ = require('../../lib/kansuu.js'),
  base = require('../../lib/kansuu-base.js'),
  Array = require('../../lib/kansuu-array.js'),
  Env = require('../../examples/interpreter.js').env,
  ID = require('../../lib/kansuu.js').monad.identity,
  Maybe = require('../../lib/kansuu.js').monad.maybe,
  List = require('../../lib/kansuu-monad.js').list,
  Pair = require('../../lib/kansuu.js').pair,
  Parser = require('../../lib/kansuu.js').monad.parser;

describe("Monadic Parser", () => {
  var abc = List.fromString("abc");
  describe("parse", (next) => {
    it("Parser#itemは先頭の一文字を取得する", (next) => {
      expect(
        Parser.item("")
      ).to.eql(
        [] 
      );
      expect(
        Parser.item("abc")
      ).to.eql(
        [{value:'a', remaining: 'bc'}]
      );
      next();
    });
    it("Parser#zeroは、何もしない", (next) => {
      expect(
        Parser.parse(Parser.zero)("abc")
      ).to.eql(
        [] 
      );
      next();
    });
    it("Parser#unitは、入力にはなにもせず、結果に値を格納する", (next) => {
      expect(
        Parser.parse(Parser.unit(1))("abc")
      ).to.eql(
        [{value:1, remaining: 'abc'}]
      );
      next();
    });
    describe("Parser#append", () => {
      it("Parser#appendは、パースの論理和を意味する", (next) => {
        const all_or_nothing = 
        expect(
          Parser.parse(Parser.letter())("letter")
        ).to.eql(
          [{value:'l', remaining: 'etter'}]
        );
        expect(
          Parser.letter()("ABC")
        ).to.eql(
          [{value:'A', remaining: 'BC'}]
        );
        next();
      });
      it("Parser#letterは、アルファベット文字を文字だけ認識する", (next) => {
        expect(
          Parser.parse(Parser.letter())("letter")
        ).to.eql(
          [{value:'l', remaining: 'etter'}]
        );
        expect(
          Parser.letter()("ABC")
        ).to.eql(
          [{value:'A', remaining: 'BC'}]
        );
        next();
      });
      it("alphanum", (next) => {
        expect(
          Parser.alphanum()("123")
        ).to.eql(
          [{value:'1', remaining: '23'}]
        );
        next();
      });
    });
    describe("Parser#sat", () => {
      it("anyCharは、空白、改行、タブ以外の全ての一文字にマッチする", (next) => {
        expect(
          Parser.anyChar()("ア")
        ).to.eql(
          [{value:'ア', remaining: ''}]
        );
        next();
      });
      it("anyStringは、空白、改行、タブ以外の全ての文字列にマッチする", (next) => {
        expect(
          Parser.anyString()("アイウエオ")
        ).to.eql(
          [{value:'アイウエオ', remaining: ''}]
        );
        expect(
          Parser.anyString()("example.address@mail.com")
        ).to.eql(
          [{value:'example.address@mail.com', remaining: ''}]
        );
        next();
      });
      it("charは、指定した一文字だけを認識する", (next) => {
        expect(
          Parser.char("a")("a")
        ).to.eql(
          [{value:'a', remaining: ''}]
        );
        next();
      });
      it("charsは指定した文字列を認識する", (next) => {
        expect(
          Parser.chars("abc")("abcdef")
        ).to.eql(
          [{value:"abc", remaining: 'def'}]
        );
        // expect(
        //   List.toString(Pair.left(
        //     List.head(
        //       Parser.parse(
        //         Parser.chars(List.fromString("#t"))
        //       )(List.fromString("#t"))
        //     )
        //   ))
        // ).to.eql(
        //   '#t'
        // );
        // expect(
        //   List.toString(Pair.left(
        //     List.head(
        //       Parser.parse(
        //         Parser.chars(List.fromString("hello"))
        //       )(List.fromString("hello there"))
        //     )
        //   ))
        // ).to.eql(
        //   'hello'
        // );
        next();
      });
      it("lower", (next) => {
        expect(
          Parser.lower("a")("a")
        ).to.eql(
          [{value:'a', remaining: ''}]
        );
        next();
      });
      it("Parser#upper", (next) => {
        expect(
          Parser.upper("a")("a")
        ).to.eql(
          []
        );
        next();
      });
    });
  });
  describe("fmap", (next) => {
    it("toUpper", (next) => {
      var toUpper = (s) => {
        return s.toUpperCase();
      };
      expect(
        Parser.parse(Parser.fmap(toUpper)(Parser.item))("abc")
      ).to.eql(
        [{value:'A', remaining: 'bc'}]
      );
      next();
    });
  });
  describe("alternative", (next) => {
    it("alt", (next) => {
      expect(
        Parser.alt(Parser.item, Parser.unit("d"))("abc")
      ).to.eql(
        [{value:'a', remaining: 'bc'}]
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
        Parser.digit()("123")
      ).to.eql(
        [{value:'1', remaining: '23'}]
      );
      next();
    });
    it("word", (next) => {
      expect(
        Array.length(Parser.parse(Parser.word())("Yes!"))
      ).to.eql(
        1 
        // 4 
      );
      expect(
        Parser.parse(Parser.word())("Yes!")
      ).to.eql(
        [{value:"Yes", remaining: '!'}]
      );
      expect(
        Parser.parse(Parser.word())("ab,c")
      ).to.eql(
        [{value:"ab", remaining: ',c'}]
      );
      next();
    });
    it("Parser#ident", (next) => {
      expect(
        Parser.parse(Parser.ident())("abc def")
      ).to.eql(
        [{value:"abc", remaining: ' def'}]
      );
      expect(
        Parser.parse(Parser.ident())("xyz")
      ).to.eql(
        [{value:"xyz", remaining: ''}]
      );
      next();
    });
    it("string", (next) => {
      expect(
        Parser.parse(Parser.string())("\"abc\"")
      ).to.eql(
        [{value:"abc", remaining: ''}]
      );
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
    it("manyの用法", (next) => {
      expect(
        Parser.parse(
          Parser.flatMap(Parser.many(Parser.alphanum()))(xs => {
            console.log(xs)
            return Parser.unit(Array.foldl1(xs)(x => {
              return (accumulator) => {
              return x + accumulator;
              };
            }));
          })
        )("123abc")
      ).to.eql(
        [{value:"123abc", remaining: ''}]
      );
      next();
    });
    it("many digit", (next) => {
      expect(
        Parser.parse(
          Parser.many(Parser.digit())
        )("123abc")
      ).to.eql(
        [{value:"123", remaining: 'abc'}]
      );
      expect(
        Parser.parse(
          Parser.many(Parser.digit())
        )("abc")
      ).to.eql(
        [{value: [], remaining: 'abc'}]
      );
      next();
    });
    it("many1 digit", (next) => {
      expect(
        Parser.parse(
          Parser.many1(Parser.digit())
        )("123abc")
      ).to.eql(
        [{value:"123", remaining: 'abc'}]
      );
      expect(
        Parser.parse(
          Parser.flatMap(Parser.many1(Parser.digit()))(digits => {
            return Parser.unit(digits);
          })
        )("123abc")
      ).to.eql(
        [{value:"123", remaining: 'abc'}]
      );
      next();
    });
    it("digits", (next) => {
      expect(
        Parser.parse(
          Parser.digits()
        )("1")
      ).to.eql(
        [{value:"1", remaining: ''}]
      );
      expect(
        Parser.parse(
          Parser.digits()
        )("abc")
      ).to.eql(
        [] 
      );
      expect(
        Parser.parse(
          Parser.digits()
        )("123abc")
      ).to.eql(
        [{value:"123", remaining: 'abc'}]
      );
      expect(
        Parser.parse(
          Parser.flatMap(Parser.digits())(digits => {
            return Parser.unit(digits);
          })
        )("123abc")
      ).to.eql(
        [{value:"123", remaining: 'abc'}]
      );
      next();
    });
    it("hex", (next) => {
      expect(
        Parser.parse(
          Parser.hex()
        )("123abc")
      ).to.eql(
        [{value:"123abc", remaining: ''}]
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
        Parser.parse(nat())("123")
      ).to.eql(
        [{value:123, remaining: ''}]
      );
      next();
    });
    it("nat", (next) => {
      expect(
        Parser.nat()("123")
      ).to.eql(
        [{value:123, remaining: ''}]
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
      expect(
        Parser.parse(
          Parser.sepBy1(Parser.word())(sep)
        )("abc,def,ghi")
      ).to.eql(
        [{value:["abc","def","ghi"], remaining: ''}]
      );
      next();
    });
    it("bracket", (next) => {
      const open = Parser.char("("); 
      const close = Parser.char(")"); 
      expect(
        Parser.parse(
          Parser.bracket(open,Parser.ident, close)
        )("(identifier)")
      ).to.eql(
        [{value:"identifier", remaining: ''}]
      );
      next();
    });
  });
  it("int", (next) => {
    expect(
      Parser.parse(Parser.int())("-123 abc")
    ).to.eql(
      [{value:-123, remaining: ' abc'}]
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
      Parser.parse(
        Parser.spaces()
      )("  abc")
    ).to.eql(
      [{value:undefined, remaining: 'abc'}]
    );
    next();
  });
  it("lineComment", function(next){
    this.timeout(5000);
    expect(
      Parser.parse(
        Parser.lineComment("//")
      )("// this is line comment")
    ).to.eql(
      [{value:undefined, remaining: ''}]
    );
    next();
  });
  describe("token parser", (next) => {
    it("natural", (next) => {
      expect(
        Parser.parse(
          Parser.natural()
        )("   123   ")
      ).to.eql(
        [{value:123, remaining: ''}]
      );
      next();
    });
    it("integer", (next) => {
      expect(
        Parser.parse(
          Parser.integer()
        )("   -123   ")
      ).to.eql(
        [{value:-123, remaining: ''}]
      );
      next();
    });
    it("numeric", function(next) {
      this.timeout(9000);
      expect(
        Parser.parse(Parser.numeric())("   -123   ")
      ).to.eql(
        [{value:-123, remaining: ''}]
      );
      expect(
        Parser.parse(
          Parser.numeric()
        )("   0.123   ")
      ).to.eql(
        [{value:0.123, remaining: ''}]
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
        Parser.parse(
          Parser.symbol("+")
        )("  +  ")
      ).to.eql(
        [{value:'+', remaining: ''}]
      );
      next();
    });
    it("identifier", (next) => {
      expect(
        Parser.parse(
          Parser.identifier([])
        )("   abc")
      ).to.eql(
        [{value:'abc', remaining: ''}]
      );
      // expect(
      //   List.toString(Pair.left(
      //     List.head(
      //       Parser.parse(
      //         Parser.identifier(["lambda"])
      //       )(List.fromString("anonymous function"))
      //     )))
      // ).to.eql(
      //   'anonymous'
      //   // '[(+,[]),nil]'
      // );
      // expect(
      //   List.toString(Pair.left(
      //     List.head(
      //       Parser.parse(
      //         Parser.identifier(["lambda"])
      //       )(List.fromString("lambda function"))
      //     )))
      // ).to.eql(
      //   ''
      //   // '[(+,[]),nil]'
      // );
      // expect(
      //   List.toString(Pair.left(
      //     List.head(
      //       Parser.parse(
      //         Parser.identifier(["lambda"])
      //       )(List.fromString("lam "))
      //     )))
      // ).to.eql(
      //   'lam'
      //   // '[(+,[]),nil]'
      // );
      next();
    });
  });
});
