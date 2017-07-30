"use strict";

const expect = require('expect.js'),
 __ = require('../lib/kansuu.js'),
 ID = require('../lib/kansuu-monad.js').identity,
 Pair = require('../lib/kansuu-pair.js'),
 List = require('../lib/kansuu-monad.js').list;

// ### 恒等モナド
// const ID = {
//   unit: (value) => {
//     return value;
//   },
//   flatMap: (instance) => {
//     return (transform) => {
//       expect(transform).to.a('function');
//       return transform(instance);
//     };
//   }
// };

// empty :: Parser a
const empty = (input) => {
  return List.empty();
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
          return Pair.match(pair,{
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
      return List.match(parse(parserA)(input),{
        empty: () => {
          return List.empty();
        },
        cons: (pair,_) => {
          return Pair.match(pair,{
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


// item :: Parser String
const item = (input) => {
  return List.match(input,{
    empty: (_) => {
      return List.empty();
    },
    cons: (head, tail) => {
      return List.cons(
        Pair.cons(head, tail),List.empty()
      ); 
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
        return Pair.match(pair,{
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
//
// chars :: List[Char] -> Parser String 
const chars = (strAsString) => { 
  return List.match(strAsString,{
    empty: () => {
      return pure(List.empty());
      // return pure("");
    },
    cons: (x,xs) => {
      return flatMap(char(x))(x => {
        return flatMap(chars(xs))(xs => {
          return pure(List.cons(x,xs));
          // return pure(x + List.toString(xs)); 
        });
      });
    }
  }); 
};

const ident = () => {
  return flatMap(lower())((x) => {
    return flatMap(many(alphanum()))((xs) => {
      return pure(List.cons(x,xs));
      // return pure(Symbol(List.toString(List.cons(x,xs))));
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
const numeric = () => {
  // return token(alt(float(), int()));
  // const toExp = (value) => {
  //   return exp.num(value);
  // };
  // return fmap(toExp)(token(alt(float(), int())));
  return flatMap(token(alt(float(), int())))(numericValue => {
    return pure(numericValue);
  });
};


const symbol = (xs) => {
  return token(chars(xs));
};

const boolean = () => {
  const t = List.fromString("#t");
  const f = List.fromString("#f");
  return flatMap(token(alt(chars(t), chars(f))))(vs => {
    if(List.isEqual(vs,t)) {
      return pure(true);
    } else if(List.isEqual(vs,f)) {
      return pure(false);
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
    flatMap(quote)((_) => {
      return flatMap(stringContent())(content => {
        return flatMap(quote)((_) => {
          return pure(content);
        });
      });
    })
  );
};




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

