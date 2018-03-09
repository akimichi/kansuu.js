"use strict";

const expect = require('expect.js'),
  __ = require('../lib/kansuu.js'),
  string = require('../lib/kansuu.js').string,
  Array = require('../lib/kansuu-array.js'),
  Pair = require('../lib/kansuu-pair.js'),
  math = require('../lib/kansuu-math.js');

describe("array", () => {
  it("Array#flatMap", (next) => {
    /*
    scala> val nestedNumbers = List(List(1, 2), List(3, 4))
    scala> nestedNumbers.flatMap(x => x.map(_ * 2))
    res0: List[Int] = List(2, 4, 6, 8)
    */
    const nestedArray = [[1,2],[3,4]];
    expect(
      Array.flatMap(nestedArray)(x => {
        return Array.map(x)(n => {
          return n * 2;
        });
      })
    ).to.eql(
      [2,4,6,8]
    )
    expect(
      Array.flatMap([[],[2,3]])(x => {
        return Array.map(x)(n => {
          return n * 2;
        });
      })
    ).to.eql(
      [4,6]
    )
    next();
  });
  it("'cons' should construct a list", (next) => {
    expect(
      Array.cons(1,[])
    ).to.eql(
      [1]
    );
    expect(
      Array.cons("a",["b","c"])
    ).to.eql(
      ["a","b","c"]
    );
    next();
  });
  it("fromString", (next) => {
    expect(
      Array.fromString("abc")
    ).to.eql(
      ['a','b','c'] 
    );
    next();
  });
  it("isEmpty", (next) => {
    expect(
      Array.isEmpty([])
    ).to.eql(
      true 
    );
    // expect(
    //   Array.isEmpty({})
    // ).to.eql(
    //   true 
    // );
    next();
  });
  it("'Array#snoc' should construct a list", (next) => {
    expect(
      Array.snoc(1,[])
    ).to.eql(
      [1]
    );
    expect(
      Array.snoc("a",["b","c"])
    ).to.eql(
      ["b","c", "a"]
    );
    next();
  });
  it("'Array#push'", (next) => {
    expect(
      Array.push([], 1)
    ).to.eql(
      [1]
    );
    expect(
      Array.snoc("a",["b","c"])
    ).to.eql(
      ["b","c", "a"]
    );
    next();
  });
  it("'head' should return the 1st element", (next) => {
    expect(Array.head([0,1,2,3])).to.eql(0);
    next();
  });
  it("'tail' should return the tail element", (next) => {
    expect(Array.tail([0,1,2,3])).to.eql([1,2,3]);
    expect(Array.tail([])).to.eql([]);
    next();
  });
  it("Array#elem", (next) =>  {
    expect(
      Array.elem([1,2,3])(1)
    ).to.eql(
      true
    );
    expect(
      Array.elem([1,2,3])(0)
    ).to.eql(
      false
    );
    next();
  });
  it("Array#concat", (next) =>  {
    var xs = [0,1];
    var ys = [2,3];
    expect(
      Array.concat(xs,ys)
    ).to.eql(
      [0,1,2,3]
    );
    expect(xs).to.eql([0,1]);
    expect(ys).to.eql([2,3]);
    next();
  });
  it("Array#join", (next) =>  {
    expect(
      Array.join([[]])
    ).to.eql(
      []
    );
    expect(
      Array.join([[1]])
    ).to.eql(
      [1]
    );
    expect(
      Array.join([["a"],["b"],["c"]])
    ).to.eql(
      ["a","b","c"]
    );
    // expect(
    //   Array.flatten(["a","b","c"])
    // ).to.eql(
    //   ["a","b","c"]
    // );
    expect(
      Array.join([[1,2,3],[4],[]])
    ).to.eql(
      [1,2,3,4]
    );
    next();
  });
  it("'reverse' is immutable", (next) =>  {
    var array = [0,1,2];
    expect(Array.reverse(array)).to.eql([2,1,0]);
    expect(array).to.eql([0,1,2]);
    next();
  });
  it("'init'は配列の末尾より先方の要素をとりだす ", (next) =>  {
    var anArray = [0,1,2];
    expect(Array.init(anArray)).to.eql([0,1]);
    expect(anArray).to.eql([0,1,2]);
    expect(Array.init([0])).to.eql([]);
    next();
  });
  it("'take'", (next) =>  {
    var array = [0,1,2];
    expect(Array.take(array)(1)).to.eql([0]);
    expect(Array.take(array)(2)).to.eql([0,1]);
    expect(Array.take(array)(3)).to.eql([0,1,2]);
    expect(Array.take(array)(4)).to.eql([0,1,2]);
    expect(Array.take(array)(0)).to.eql([]);
    expect(array).to.eql([0,1,2]);
    next();
  });
  it("'drop'", (next) =>  {
    var array = [0,1,2];
    expect(Array.drop(array)(1)).to.eql([1,2]);
    expect(Array.drop(array)(2)).to.eql([2]);
    expect(Array.drop(array)(0)).to.eql(array);
    expect(array).to.eql([0,1,2]);
    next();
  });
  describe("'map'", () => {
    it("'map [number] double'", (next) =>  {
      var array = [0,1,2];
      var double = function(n){
        return 2 * n;
      };
      expect(
        Array.map(array)(double)
      ).to.eql(
        [0,2,4]
      );
      expect(array).to.eql([0,1,2]);
      next();
    });
    it("'map id == id'", (next) =>  {
      const __ = require('../lib/kansuu.js');
      var sequence = [0,1,2];
      expect(
        Array.map(sequence)(__.id)
      ).to.eql(
        __.id(sequence)
      );
      next();
    });
    // it 'map (f . g) == map f . map g', ->
    //   (expect fj.map ary, fj.compose(square, step1)).toEqual fj.compose(fj.flip(fj.map)(square), fj.flip(fj.map)(step1))(ary)
  });
  it("'splitAt'", (next) =>  {
    var array = [0,1,2,3];
    expect(
      Array.splitAt(array)(2)
    ).to.eql(
      [ [ 0, 1 ], [ 2, 3 ] ]
    );
    next();
  });
  it("'takeWhile'", (next) =>  {
    var list = [2,4,6,1,5,6];
    var even = (n) => {
      return 0 === (n % 2);
    };
    expect(Array.takeWhile(list)(even)).to.eql([2,4,6]);
    expect(Array.takeWhile([2,4,1,3])(n => {
      return n > 1;
    })).to.eql([2,4]);
    next();
  });
  it("'before'", (next) =>  {
    expect(
      Array.before([1,2,3,0,4,5,6])(0)
    ).to.eql(
      [1,2,3]
    );
    next();
  });
  it("'after'", (next) =>  {
    expect(
      Array.after([1,2,3,0,4,5,6])(0)
    ).to.eql(
      [4,5,6]
    );
    next();
  });
  it("'span'", (next) =>  {
    var isPositive = function(n){
      return n > 0;
    };
    expect(
      Array.span(isPositive)([])
    ).to.eql(
      [[],[]] 
    );
    // span (< 3) [1,2,3,4,1,2,3,4] == ([1,2],[3,4,1,2,3,4])
    expect(
      Array.span(function(n){ return n < 3;})([1,2,3,4,1,2,3,4])
    ).to.eql(
      [[1,2],[3,4,1,2,3,4]]
      // Pair.mkPair([1,2])([3,4,1,2,3,4])
    );
    // span (< 9) [1,2,3] == ([1,2,3],[])
    expect(
      Array.span(math.isLessThan(9))([1,2,3])
    ).to.eql(
      [[1,2,3],[]]
      //Pair.mkPair([1,2,3])([])
    );
    // span (< 0) [1,2,3] == ([],[1,2,3])
    expect(
      Array.span(math.isLessThan(0))([1,2,3])
    ).to.eql(
      [[],[1,2,3]]
      //]Pair.mkPair([])([1,2,3])
    );
    next();
  });
  it("'breaks'", (next) =>  {
    // break (3==) [1,2,3,4,5] == ([1,2],[3,4,5])
    expect(
      Array.breaks(math.isEqual(3))([1,2,3,4,5])
    ).to.eql(
      [[ 1, 2 ], [ 3, 4, 5 ]]
      // { type: 'pair', left: [ 1, 2 ], right: [ 3, 4, 5 ] }
    );
    // break (> 3) [1,2,3,4,1,2,3,4] == ([1,2,3],[4,1,2,3,4])
    expect(
      Array.breaks(math.isMoreThan(3))([1,2,3,4,1,2,3,4])
    ).to.eql(
      [[ 1, 2, 3 ],[ 4, 1, 2, 3, 4 ]]
      // { type: 'pair',
      //   left: [ 1, 2, 3 ],
      //   right: [ 4, 1, 2, 3, 4 ]
      // }
    );
    // break (< 9) [1,2,3] == ([],[1,2,3])
    expect(
      Array.breaks(math.isLessThan(9))([1,2,3])
    ).to.eql(
      [[ ], [ 1, 2, 3 ]]
      // { type: 'pair',
      //   left: [ ],
      //   right: [ 1, 2, 3 ]
      // }
    );
    // break (> 9) [1,2,3] == ([1,2,3],[])
    expect(
      Array.breaks(math.isMoreThan(9))([1,2,3])
    ).to.eql(
        [[ 1, 2, 3 ],[ ]]
      // { type: 'pair',
      //   left: [ 1, 2, 3 ],
      //   right: [ ]
      // }
    );
    next();
  });
  describe("'lines'", () =>  {
    it("'Array.lines'", (next) =>  {
      // lines "hello world\nit's me,\neric\n"
      // ["hello world", "it's me,", "eric"]
      expect(
        Array.lines( "hello world\nit's me,\neric\n")
      ).to.eql(
        ['hello world',
          'it\'s me,',
          'eric'] 
      );
      next();
    });
    it("Array#split", (next) =>  {
      expect(
        "hello world\nit's me,\neric\n".split("\n")
      ).to.eql(
        [
          'hello world',
          'it\'s me,',
          'eric',
          ''
        ] 
      );
      next();
    });
  });
  it("Array.unlines", (next) =>  {
    expect(
      Array.unlines(["a","b","c"])
    ).to.eql(
      "a\nb\nc\n"  
    );
    next();
  });
  it("'dropWhile'", (next) =>  {
    var list = [2,4,6,1,5,6];
    var even = function(n){
      return 0 === (n % 2);
    };
    expect(Array.dropWhile(list)(even)).to.eql([1,5,6]);
    expect(Array.dropWhile([2,4,1,3])(function(n){
      return n > 1;
    })).to.eql([1,3]);
    expect(Array.dropWhile([2,3,4])(function(n){
      return n > 1;
    })).to.eql([ ]);
    next();
  });
  it("'zip'", (next) =>  {
    var listX = [0,1,2,3,4];
    var listY = ["h","a","l","l","o"];
    expect(Array.zip(listX)(listY)).to.eql([[0,'h'],[1,'a'],[2,'l'],[3,'l'],[4,'o']]);
    next();
  });
  describe("Array#flatten", () => {
    it("flatten [[1]]", (next) =>  {
      expect(
        Array.flatten([[1]])
      ).to.eql(
        [1] 
      )
      next();
    });
    it("flatten []", (next) =>  {
      expect(
        Array.flatten([])
      ).to.eql(
        [] 
      )
      next();
    });
  });
  describe("folding functions", () => {
    it("'reduce'", (next) => {
      var list = [1,2,3];
      expect(
        Array.reduce(list)(0)(item =>{
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.be(
        6
      );
      next();
    });
    it("Array#foldr", (next) => {
      const sum = (anArray) => {
        const add = (x) => {
          return (y) => {
            return x + y;
          };
        };
        return Array.foldr(anArray)(0)(add);
      };
      expect(
        sum([1,2,3])
      ).to.eql(
        6
      );
      const product = (anArray) => {
        const multiply = (x) => {
          return (y) => {
            return x * y;
          };
        };
        return Array.foldr(anArray)(1)(multiply);
      };
      expect(
        product([1,2,3,4])
      ).to.eql(
        24 
      );
      const reverse = (anArray) => {
        const snoc = __.curry(Array.snoc);
        // const snoc = (value) => {
        //   return (anArray) => {
        //     return Array.concat(anArray,[value]);
        //   };
        // };
        return Array.foldr(anArray)(Array.empty)(snoc);
      };
      expect(
        reverse([1,2,3,4])
      ).to.eql(
        [4,3,2,1] 
      );
      const stringConcat = (arrayOfString) => {
        return Array.foldr(arrayOfString)("")(item => {
          return (accumulator) => {
            return `${item}${accumulator}`
          };
        });
      };
      expect(
        stringConcat(["a","b","c"])
      ).to.eql(
        'abc'
      );
      next();
    });
    it("'foldr1'", (next) => {
      var anArray = [1,2,3];
      expect(
        Array.foldr1(anArray)(item =>{
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.be(
        6
      );
      expect(
        Array.foldr1([1])(item =>{
          return (accumulator) => {
            return item + accumulator;
          };
        })
      ).to.be(
        1
      );
      const succ = (n) => {
        return n + 1;
      };
      expect(
        Array.foldr1([3,4])(item =>{
          return (accumulator) => {
            return item * accumulator; 
          };
        })
      ).to.be(
        12
      );
      expect(
        Array.foldr1([3])(item =>{
          return (accumulator) => {
            return item * accumulator; 
          };
        })
      ).to.be(
        3
      );
      expect(
        Array.foldr1([1,2,3,4,5])(x =>{
          return (y) => {
            return 2 * x + y;
          };
        })
      ).to.be(
        25 
      );
      next();
    });
    it("'foldl'", (next) => {
      expect(
        Array.foldl([1,2,3])(0)(n => {
          return (accumulator) => {
            return n + accumulator;
          };
        })
      ).to.eql(
        6
      );
      const sum = (anArray) => {
        return Array.foldl(anArray)(0)(n => {
          return (m) => {
            return n + m;
          };
        });
      };
      expect(
        sum([1,2,3])
      ).to.eql(
        6
      );
      expect(
        sum([0])
      ).to.eql(
        0
      );
      next();
    });
    it("'foldl1'", (next) => {
      const sum = (anArray) => {
        return Array.foldl1(anArray)(item => {
          return (accumulator) => {
            return item + accumulator; 
          };
        })
      };
      expect(
        sum([0])
      ).to.eql(
        0
      );
      expect(
        sum([1,2,3])
      ).to.eql(
        6
      );
      // Prelude> let f x y = 2 * x + y
      // Prelude> foldl1 f [1..5]
      // 57
      expect(
        Array.foldl1([1,2,3,4,5])(x => {
          return (y) => {
            return 2 * x + y;
          };
        })
      ).to.eql(
        57 
      );
      next();
    });
    it("'last' uses compose", (next) =>  {
      var array = [0,1,2];
      expect(
        Array.last(array)
      ).to.eql(
        2
      );
      expect(array).to.eql([0,1,2]);
      expect(
        Array.last([0])
      ).to.eql(
        0
      );
      next();
    });
    it("'and'", (next) => {
      expect(
        Array.and([true]) 
      ).to.eql(
        true 
      );
      expect(
        Array.and([false]) 
      ).to.eql(
        false 
      );
      expect(
        Array.and([true,false]) 
      ).to.eql(
        false 
      );
      next();
    });
    it("'or'", (next) => {
      expect(
        Array.or([true]) 
      ).to.eql(
        true 
      );
      expect(
        Array.or([false]) 
      ).to.eql(
        false 
      );
      expect(
        Array.or([true,false]) 
      ).to.eql(
        true 
      );
      next();
    });
    it("'all'", (next) => {
      expect(
        Array.all([1,2,3])(n => {
          return n > 0;
        })
      ).to.eql(
        true 
      );
      expect(
        Array.all([1,2,-3])(n => {
          return n > 0;
        })
      ).to.eql(
        false 
      );
      next();
    });
    it("'any'", (next) => {
      expect(
        Array.any([-1,-2,3])(n => {
          return n > 0;
        })
      ).to.eql(
        true 
      );
      expect(
        Array.all([1,2,3])(n => {
          return n < 0;
        })
      ).to.eql(
        false 
      );
      next();
    });
  });

  describe("filter", () => {
    it("'単純なフィルター'", (next) =>  {
      const __ = require('../lib/kansuu.js');

      const even = (n) => {
        return (n % 2) === 0;
      };
      expect(
        Array.filter([1,2,3,4,5])(even)
      ).to.eql(
        [ 2, 4]
      );
      expect(
        Array.filter([1,2,3,4,5])(function(n){
          return n > 3;
        })
      ).to.eql(
        [4,5]
      );
      const odd = __.not(even);
      // var odd = (n) => {
      //   return __.not(even(n));
      //   //return Array.not(even)(n);
      // };
      expect(
        Array.filter([1,2,3])(odd)
      ).to.eql(
        [1,3]
      );
      next();
    });
    it("先頭に#のある行を除去する", (next) =>  {
      const __ = require('../lib/kansuu.js');

      const lines = [
        "# 処方新規入力画面",
        "",
        "[",
        "  {",
        `    medical_class         : "210",`, 
        `    department_code       : "01",`,  
        `    drug_code             : "",`,  
        `    amount                : "",`,  
        `    yoho_code             : "",`,    
        `    duration              : "7",`,   
        "  }",
        "]",
      ];
      const condition = (line) => {
        if(string.head(line) === "#" ) {
          return false;
        } else  {
          return true;
        }
      };
      expect(
        Array.filter(lines)(condition)
      ).to.eql(
        ["",
          "[",
          "  {",
          `    medical_class         : "210",`, 
          `    department_code       : "01",`,  
          `    drug_code             : "",`,  
          `    amount                : "",`,  
          `    yoho_code             : "",`,    
          `    duration              : "7",`,   
          "  }",
          "]",
        ]
      );
      next();
    });
    // it('は複雑な条件をフィルターできる', (next) => {
    //   var one = function(n){
    //     return n === 1;
    //   };
    //   var two = function(n){
    //     return n === 2;
    //   };
    //   var list = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    //   var multipleOf2 = function(n){
    //     return 0 === (n % 2);
    //   };
    //   var multipleOf3 = function(n){
    //     return 0 === (n % 3);
    //   };
    //   expect(
    //     Array.filter(list)(__.andify(multipleOf2)(multipleOf3))
    //   ).to.eql(
    //     [6,12]
    //   );
    //   next();
    // });
  });
});
