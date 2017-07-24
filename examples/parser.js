"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 Pair = require('../lib/kansuu-pair.js'),
 List = require('../lib/kansuu-list.js');

// ### 恒等モナド
const ID = {
  unit: (value) => {
    return value;
  },
    flatMap: (instance) => {
      return (transform) => {
        expect(transform).to.a('function');
        return transform(instance);
      };
    }
};

// pure :: a -> Parser a
const pure = (v) => {
  return (input) => {
    return List.cons(Pair.cons(v,input),
      List.empty());
  };
}; 
// <*> :: Parser (a -> b) -> Parser a -> Parser b
// pg <*> px = P (\input -> case parse pg input of
//                          [] -> []
//                          [(g,out)] -> parse (fmap g px) out)
const apply = (pg) => {
  return (px) => {
    return (input) => {
      return __.match(parse(pg)(input),{
        empty: () => {
          return List.empty();
        },
        cons: (pair,_) => {
          return Pair.match(pair,{
            cons: (g, out) => {
              return parse(fmap(g)(px))(out);
            }
          });
        }
      });
    };
  };
};
// flatMap :: Parser a -> (a -> Parser b) -> Parser b
const flatMap = (parser) => {
  return (f) => {
    return (input) => {
      return __.match(parse(parser)(input),{
        empty: () => {
          return List.empty();
        },
        cons: (pair,_) => {
          return __.match(pair,{
            cons: (v, out) => {
              return parse(f(v))(out);
            }
          });
        }
      });
    };
  };
};

// fmap :: (a -> b) -> Parser a -> Parser b
const fmap = (f) => {
  return (parserA) => {
    return (input) => {
      return __.match(parse(parserA)(input),{
        empty: () => {
          return List.empty();
        },
        cons: (pair,_) => {
          return __.match(pair,{
            cons: (v, out) => {
              return List.cons(Pair.cons(f(v), out),
                List.empty());
            }
          });
        }
      });
    };
  };
};

// parse :: Parser a -> String -> [(a,String)]
// parse parser input = parser(input)
const parse = (parser) => {
  return (input) => {
    return parser(input);
  };
};

// empty :: Parser a
const empty = (input) => {
  return List.empty();
};
// item :: Parser String
const item = (input) => {
  return __.match(input,{
    empty: (_) => {
      return List.empty();
    },
    cons: (head, tail) => {
      return List.cons(Pair.cons(head, tail),
        List.empty()); 
    }
  });
};
// sat :: (String -> Bool) -> Parser String
const sat = (predicate) => {
  return flatMap(item)((x) => {
    if(predicate(x) === true) {
      return pure(x);
    } else {
      return empty;
    }
  });
};
// alt :: Parser a -> Parser a -> Parser b
const alt = (parserA,parserB) => {
  return (input) => {
    return __.match(parse(parserA)(input),{
      empty: () => {
        return parse(parserB)(input);
      },
      cons: (pair,_) => {
        return __.match(pair,{
          cons: (v, out) => {
            return List.cons(Pair.cons(v,out),
              List.empty(0));
          }
        });
      }
    });
  };
};
// many :: f a -> f [a]
const many = (x) => {
  return alt(some(x),pure(List.empty()));
};
// some :: f a -> f [a]
const some = (x) => {
  return flatMap(x)((a) => {
    return flatMap(many(x))((b) => {
      return pure(List.cons(a,b));
    });
  }); 
};

// digit :: Parser String 
const digit = () => { 
  var isDigit = (x) => {
    return !isNaN(x);
  };
  return sat(isDigit);
};
// lower :: Parser String 
const lower = () => { 
  var isLower = (x) => {
    if(x.match(/^[a-z]/)){
      return true;
    } else {
      return false;
    } 
  };
  return sat(isLower);
};
// upper :: Parser String 
const upper = () => { 
  var isUpper = (x) => {
    if(x.match(/^[A-Z]/)){
      return true;
    } else {
      return false;
    } 
  };
  return sat(isUpper);
};
// letter :: Parser Char
const letter = () => { 
  var isAlpha = (x) => {
    if(x.match(/^[a-zA-Z]/)){
      return true;
    } else {
      return false;
    } 
  };
  return sat(isAlpha);
};
// alphanum :: Parser Char
// > Parses a letter or digit (a character between '0' and '9'). Returns the parsed character.
const alphanum = () => { 
  var isAlphaNum = (x) => {
    if(x.match(/^[a-zA-Z0-9]/)) {
      return true;
    } else {
      return false;
    } 
  };
  return sat(isAlphaNum);
};
// char :: Char -> Parser Char
const char = (x) => { 
  var isX = (input) => {
    if(x === input){
      return true;
    } else {
      return false;
    }
  };
  return sat(isX);
};
// chars :: String -> Parser String 
const chars = (str) => { 
  return __.match(str,{
    empty: () => {
      return pure(List.empty());
    },
    cons: (x,xs) => {
      return flatMap(char(x))((_) => {
        return flatMap(chars(xs))((_) => {
          return pure(List.toString(List.cons(x,xs)));
        });
      });
    }
  }); 
};

const ident = () => {
  return flatMap(lower())((x) => {
    return flatMap(many(alphanum()))((xs) => {
      return pure(Symbol(List.toString(List.cons(x,xs))));
      //return pure(List.cons(x,xs));
    });
  });
};
const nat = () => {
  var read = (xs) => {
    var list2str = (xs) => {
      return List.foldr(xs)("")((x) => {
        return (accumulator) => {
          return x + accumulator;
        };
      });
    };
    return parseInt(list2str(xs),10);
  };
  return flatMap(some(digit()))(xs => {
    return pure(read(xs));
  });
};
const space = () => {
  var isSpace = (x) => {
    if(x.match(/^[ \t]/)) {
      return true;
    } else {
      return false;
    } 
  };
  return flatMap(many(sat(isSpace)))((_) => {
    return pure(Pair.empty());
  });
};
const int = () => {
  return alt(
    flatMap(char("-"))((_) => {
      return flatMap(nat())((n) => {
        return pure(-n);
      });
    })
    ,nat()
  );
};
const float = () => {
  var minus = char("-");
  var dot = char(".");
  return alt(
    flatMap(minus)((_) => {
      return flatMap(nat())((n) => {
        return flatMap(dot)((_) => {
          return flatMap(nat())((m) => {
            return pure(-n - m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
          });
        });
      });
    })
    ,flatMap(nat())((n) => {
      return flatMap(dot)((_) => {
        return flatMap(nat())((m) => {
          return pure(n + m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
        });
      });
    })
  );
};
// token :: Parser a -> Parser a
const token = (parser) => {
  return flatMap(space())((_) => {
    return flatMap(parser)((v) => {
      return flatMap(space())((_) => {
        return pure(v);
      });
    });
  });
};
const identifier = () => {
  return token(ident());
};
const natural = () => {
  return token(nat());
};
const integer = () => {
  return token(int());
};
const numeric = () => {
  const toExp = (value) => {
    return exp.num(value);
  };
  return fmap(toExp)(token(alt(float(), int())));
  // return flatMap(token(alt(float(), int())))(numericValue => {
  //   return pure(exp.num(numericValue));
  // });
};

const boolean = () => {
  const t = List.fromString("#t");
  const f = List.fromString("#f");
  return flatMap(token(alt(chars(t), chars(f))))(v => {
    switch(v) { 
      case "#t": 
        return pure(exp.bool(true));
        // return pure(true);
      case "#f": 
        return pure(exp.bool(false));
        // return pure(false);
    }
  });
};
const string = () => {
  const quote = char('"');
  const stringContent = () => {
    const notQuote = (x) => {
      if(x.match(/^"/)){
        return false;
      } else {
        return true;
      } 
      // if(x.match(/^[^"]+/)){
      //   return true;
      // } else {
      //   return false;
      // } 
    };
    return flatMap(many(sat(notQuote)))((xs) => {
      return pure(List.toString(xs));
    });
  };
  return token(
    flatMap(quote)((x) => {
      return flatMap(stringContent())((xs) => {
        return flatMap(quote)((_) => {
          return pure(exp.string(xs));
          // return pure(xs);
        });
      });
    })
  );
};

const symbol = (xs) => {
  return token(chars(xs));
};


// const sexp = () => {
//   const parenL = char('(');
//   const parenR = char(')');
//   flatMap(parenL)((_) => {
//     return flatMap(sexpBody())((body) => {
//       return flatMap(parenR)((_) => {
//         return pure(body);
//       });
//     });
//   )
//   return alt(
//     identifier()
//     ,alt(
//       numeric()
//       ,alt(
//         string()
//         , boolean()
//       )
//     ) 
//   );
// };

// const sexpBody = () => {
//   return flatMap(identifier())((variable) => {
//     flatMap(many(sexp))((parameters) => {
//       return   
//     })
//   );
// };

module.exports = {
  pure: pure,
  apply: apply,
  flatMap: flatMap,
  empty: empty,
  alt: alt,
  parse: parse,
  fmap: fmap,
  item: item,
  sat: sat,
  digit: digit,
  lower: lower,
  upper: upper,
  letter: letter,
  alphanum: alphanum,
  char: char,
  chars: chars,
  // stringContent: stringContent,
  string: string,
  many: many,
  some: some,
  ident: ident,
  nat: nat,
  space: space,
  int: int,
  float: float,
  token: token,
  identifier: identifier,
  natural: natural,
  integer: integer,
  numeric: numeric,
  symbol: symbol,
  boolean: boolean,
};
// const __ = require('../lib/kansuu.js');
// const List = require('../lib/kansuu-list.js');
// const Pair = require('../lib/kansuu-pair.js');
// const expect = require('expect.js');
// const hasProp = {}.hasOwnProperty;

// // succeed:: T => String => {value:T, input:String}
// const succeed = (value) => {
//   return (input) => {
//     return {value: value, input: input};
//     // return {value: value, input: input};
//   };
// };

// module.exports = {
//   // succeed:: T => String => {value:T, input:String}
//   succeed: (value) => {
//     return (input) => {
//       return {value: value, input: input};
//     };
//   },
//   // succeed:: () => String => {}
//   fail: function(){
//     return function(input){
//       return {};
//     };
//   },
//   /*
//    #@range_end(succeed_fail)
//    */
//   /*
//    #@range_begin(satisfy)
//    */
//   // satisfy:: (T=>Bool) => String => {value:T, input:String}
//   satisfy: function(predicate){
//     return function(context){
//       return function(input){
//         if(__.isEmpty(input)) {
//           return context.fail()();
//         } else {
//           var head = __.head(input);
//           var tail = __.tail(input);
//           if(predicate(head)){
//             return context.succeed(head)(tail);
//           } else {
//             return context.fail()();
//           }
//         }
//       };
//     }(this);
//   },
//   /* #@range_end(satisfy)
//   */
//   /*
//    #@range_begin(parse) */
//   // parse: 
//   parse: function(parser){
//     return function(input){
//       return parser(input);
//     };
//   },
//   /*
//    #@range_end(parse) */
//   item: function(){
//     return function(input){
//       if(__.isEmpty(input)) {
//         return [];
//       } else {
//         var head = __.head(input);
//         var tail = __.tail(input);
//         return {value: head, input: tail};
//       }
//     };
//   },
//   /* #@range_begin(char) */
//   // char: Char => {value:T, input:String}
//   char: function(ch){
//     var predicate = function(head){
//       if(ch === head){
//         return true;
//       } else {
//         return false;
//       }
//     };
//     return this.satisfy(predicate);
//   },
//   /* #@range_end(char) */
//   /* #@range_begin(string) */
//   // char: Char => {value:T, input:String}
//   string: function(string){
//     return function(context){
//       if(__.isEmpty(string)) {
//         return context.succeed('');
//       } else {
//         var head = __.head(string);
//         var tail = __.tail(string);

//         return context.seq(context.char(head),function(x){
//           return context.seq(context.string(tail),function(xs){
//             return context.succeed(x + xs);
//           });
//         });
//       }
//     }(this);
//   },
//   /* #@range_end(string) */
//   lex: function(regex){
//     return function(context){
//       var predicate = function(ch){
//         if(regex.test(ch)){
//           return true;
//         } else {
//           return false;
//         }
//       };
//       return context.satisfy(predicate);
//     }(this);
//   },
//   digit: function(){
//     return function(context){
//       return context.lex(/\d/);

//     }(this);
//   },
//   lower: function(){
//     return function(context){
//       return context.lex(/[a-z]/);
//     }(this);
//   },
//   upper: function(){
//     return function(context){
//       return context.lex(/[A-Z]/);
//     }(this);
//   },
//   letter: function(){
//     return function(context){
//       return context.lex(/[a-zA-Z]/);
//     }(this);
//   },
//   alphanum: function(){
//     return function(context){
//       return context.lex(/\w/);
//     }(this);
//   },
//   ident: function(){ // Parser String
//     return function(context){
//       return context.seq(context.lower(), function(x){
//         return context.seq(context.many(context.alphanum())(__.op["+"]), function(xs){
//           return context.succeed(x + xs);
//         });
//       });
//     }(this);
//   },
//   /* #@range_begin(space) */
//   space: function(){ // Parser ()
//     return function(context){
//       var isSpace = function(x){
//         if(x === ' '){
//           return true;
//         } else {
//           return false;
//         }
//       };
//       return context.seq(context.many(context.satisfy(isSpace))(__.op["+"]), function(dummy){
//         return context.succeed('');
//       });
//     }(this);
//   },
//   /* #@range_end(space) */
//   /* #@range_begin(token) */
//   // token:: 
//   token: function(parser){ // Parser a => Parser a
//     return function(context){
//       return context.seq(context.space(), function(_){
//         return context.seq(parser, function(v){
//           return context.seq(context.space(), function(_){
//             return context.succeed(v);
//           });
//         });
//       });
//     }(this);
//   },
//   /* #@range_end(token) */
//   identifier: function(_){
//     return function(context){
//       return context.token(context.ident());
//     }(this);
//   },
//   natural: function(_){
//     return function(context){
//       return context.token(context.nat());
//     }(this);
//   },
//   symbol: function(string){
//     return function(context){
//       return context.token(context.string(string));
//     }(this);
//   },
//   /* #@range_begin(seq) */
//   // seq:: (Parser, Parser) => Parser
//   seq: function(first, next){
//     return function(context){
//       return function(input){
//         var firstResult = context.parse(first)(input);
//         if(__.isEmpty(firstResult)) {
//           return {};
//         } else {
//           var firstValue = firstResult.value;
//           var nextInput = firstResult.input;
//           return context.parse(next(firstValue))(nextInput);
//         }
//       };
//     }(this);
//   },
//   /* #@range_end(seq) */
//   /* #@range_begin(alt) */
//   // alt:: (Parser, Parser) => Parser
//   alt: function(first, alternative){ 
//     return function(context){
//       return function(input){
//         var firstResult = context.parse(first)(input);
//         if(__.isEmpty(firstResult)) {
//           return context.parse(alternative)(input);
//         } else {
//           return firstResult;
//         }
//       };
//     }(this);
//   },
//   /* #@range_end(alt) */
//   /*
//    #@range_begin(many1)
//    */
//   // Parser a => Parser [a]
//   many1: function(parser){
//     return function(context){
//       return function(operator){
//         return context.seq(parser,function(v){
//           return context.seq(context.many(parser)(operator),function(vs){
//             return context.succeed(operator(v,vs));
//           });
//         });
//       };
//     }(this);
//   },
//   /*  #@range_end(many1) */
//   /* #@range_begin(many)  */
//   // Parser a => Parser [a]
//   many: function(parser){
//     return function(context){
//       return function(operator){
//         return context.alt(context.many1(parser)(operator),context.succeed([]));
//       };
//     }(this);
//   },
//   /* #@range_end(many)  */
//   /* #@range_begin(nat)  */
//   nat: function(){ // Parser String
//     return function(context){
//       return context.seq(context.many1(context.digit())(__.op["+"]), function(digits){
//         return context.succeed(Number(digits));
//       });
//     }(this);
//   },
//   /* #@range_end(nat)  */
// };

