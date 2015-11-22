"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'stream' monad", () => {
  var unit = __.monad.stream.unit.bind(__);
  var empty = __.monad.stream.empty.bind(__);
  var cons = __.monad.stream.cons.bind(__);
  var head = __.monad.stream.head.bind(__);
  var tail = __.monad.stream.tail.bind(__);
  var get = __.monad.maybeMonad.get.bind(__);
  var toArray = __.monad.stream.toArray.bind(__);
  var take = __.monad.stream.take.bind(__);

  it("stream#unit", (next) => {
    var stream = unit(1);
    __.algebraic.match(head(unit(1)),{
      nothing: () => {
        expect().fail();
      },
      just: (value) => {
        expect(value).to.eql(1);
      }
    });
    
    expect(
      get(head(unit(1)))
    ).to.eql(
      1
    );
    next();
  });
  it("stream#cons", (next) => {
    var stream = cons(1, (_) => {
	  return cons(2,(_) => {
		return empty();
	  });
	});
    expect(
      get(head(stream))
    ).to.eql(
      1
    );
    next();
  });
  it("stream#tail", (next) => {
	// stream = [1,2]
    var stream = cons(1, (_) => {
	  return cons(2,(_) => {
		return empty();
	  });
	});
    expect(
      tail(stream)
    ).to.a("function");

	__.algebraic.match(tail(stream),{
      nothing: (_) => {
		expect().fail();
	  },
      just: (tail) => {
		__.algebraic.match(tail,{
		  empty: (_) => {
			expect().fail();
		  },
		  cons: (head, tailThunk) => {
			expect(head).to.eql(2);
		  }
		});
	  }
	});
    expect(
      get(head(get(tail(stream))))
    ).to.eql(
      2
    );
    next();
  });
  it("stream#toArray", (next) => {
    expect(
	  __.monad.stream.toArray.call(__,empty())
    ).to.eql(
	  []
	);
    expect(
	  __.monad.stream.toArray.call(__,unit(1))
    ).to.eql(
	  [1]
	);
    next();
  });
  it("stream#concat", (next) => {
    var xs = __.monad.stream.cons(1, (_) => {
      return __.monad.stream.empty();
    });
    var ysThunk = (_) => {
      return __.monad.stream.cons(2, (_) => {
        return __.monad.stream.empty();
      });
    };
    var concatenatedStream = __.monad.stream.concat.call(__,
														 xs)(ysThunk);
    expect(
      get(head(concatenatedStream))
    ).to.eql(
      1
    );
    expect(
      get(head(get(tail(concatenatedStream))))
    ).to.eql(
      2
    );
    expect(
	  __.monad.stream.toArray.call(__,concatenatedStream)
    ).to.eql(
	  [1,2]
	);
    next();
  });
  it("stream#map", (next) => {
	// stream = [1,2]
    var stream = cons(1, (_) => {
	  return cons(2,(_) => {
		return empty();
	  });
	});
	var doubled_stream = __.monad.stream.map.call(__,stream)((item) => {
	  return item * 2;
	});
    expect(
      get(head(doubled_stream))
    ).to.eql(
      2
    );
    expect(
      get(head(get(tail(doubled_stream))))
    ).to.eql(
      4
    );
    expect(
      __.monad.stream.toArray.call(__,doubled_stream)
    ).to.eql(
      [2,4]
    );
	var ones = cons(1, (_) => {
	  return ones;
	});
	var twoes = __.monad.stream.map.call(__,ones)((item) => {
	  return item * 2;
	});
    expect(
      get(head(twoes))
    ).to.eql(
      2
    );
    expect(
      get(head(get(tail(twoes))))
    ).to.eql(
      2
    );
    expect(
      get(head(get(tail(get(tail(twoes))))))
    ).to.eql(
      2
    );
    next();
  });
  it("stream#flatten", (next) => {
	// innerStream = [1,2]
    var innerStream = cons(1, (_) => {
	  return cons(2,(_) => {
	  	return empty();
	  });
	});
	// outerStream = [[1,2]]
	var outerStream = unit(innerStream);
	var flattenedStream = __.monad.stream.flatten.call(__,outerStream);
	__.algebraic.match(flattenedStream,{
	  empty: (_) => {
	  	expect().fail()
	  },
	  cons: (head,tailThunk) => {
	  	expect(head).to.eql(1)
	  }
	});
    expect(
      get(head(flattenedStream))
    ).to.eql(
      1
    );
    next();
  });
  describe("'stream#flatMap'", () => {
	var map = __.monad.stream.map.bind(__);
	var flatMap = __.monad.stream.flatMap.bind(__);
	var toArray = __.monad.stream.toArray.bind(__);
	var unit = __.monad.stream.unit.bind(__);
	var concat = __.monad.stream.concat.bind(__);
	var append = __.monad.stream.append.bind(__);
	it("一段階のflatMap", (next) => {
	  var ones = cons(1, (_) => {
		return ones;
	  });
	  var twoes = flatMap(ones)((one) => {
	  	expect(one).to.a('number');
	  	return unit(one * 2);
	  });
	  expect(
        get(head(twoes))
	  ).to.eql(
        2
	  );
	  next();
	});
	it("二段階のflatMap", (next) => {
	  /*
scala> val nestedNumbers = List(List(1, 2), List(3, 4))
scala> nestedNumbers.flatMap(x => x.map(_ * 2))
res0: List[Int] = List(2, 4, 6, 8)
	   */
	  var innerStream12 = cons(1, (_) => {
	  	return cons(2,(_) => {
	  	  return empty();
	  	});
	  });
	  var innerStream34 = cons(3, (_) => {
	  	return cons(4,(_) => {
	  	  return empty();
	  	});
	  });
	  // nestedStream = [[1,2],[3,4]]
	  var nestedStream = cons(innerStream12, (_) => {
	  	return cons(innerStream34,(_) => {
	  	  return empty();
	  	});
	  });
	  var flattenedStream = flatMap(nestedStream)((innerStream) => {
	  	return flatMap(innerStream)((n) => {
	  	  expect(n).to.a('number');
	  	  return unit(n * 2);
	  	});
	  });
	  expect(
        get(head(flattenedStream))
	  ).to.eql(
        2
	  );
	  expect(
	  	toArray(flattenedStream)
	  ).to.eql(
	  	[2,4,6,8]
	  );
	  next();
	});
  });
  it("'stream#constant'", (next) => {
	var ones = __.monad.stream.constant.call(__, 1);
	expect(
      get(head(ones))
	).to.eql(
      1
	);
	expect(
      get(head(get(tail(ones))))
	).to.eql(
      1
	);
	next();
  });
  it("'stream#fromList'", (next) => {
    var list = __.monad.list.fromArray.call(__, [1,2,3]);
    var stream = __.monad.stream.fromList.call(__, list);
    expect(
      get(head(stream))
    ).to.eql(
      1
    );
    expect(
      get(head(get(tail(stream))))
    ).to.eql(
      2
    );
    next();
  });
  it("'stream#take'", (next) => {
    var list = __.monad.list.fromArray.call(__, [1,2,3,4]);
	var stream = __.monad.stream.fromList.call(__, list);
	var take = __.monad.stream.take.bind(__);
    expect(
      toArray(take(stream)(1))
    ).to.eql(
      [1]
    );
    expect(
      toArray(take(stream)(3))
    ).to.eql(
      [1,2,3]
    );
	var intgersFrom = (n) => {
	  return __.monad.stream.cons.call(__, n, (_) => {
		return intgersFrom(n + 1);
	  });
	};
    expect(
      toArray(take(intgersFrom(1))(5))
    ).to.eql(
      [1,2,3,4,5]
    );
	
    next();
  });
  it("'stream#cycle'", (next) => {
    var list = __.monad.list.fromArray.call(__, [1,2]);
	var lazyList = __.monad.stream.fromList.call(__, list);
	var cycles = __.monad.stream.cycle.call(__, lazyList);
    expect(
      get(head(cycles))
    ).to.eql(
      1
    );
    expect(
      toArray(take(cycles)(5))
    ).to.eql(
      [1,2,1,2,1]
    );
    next();
  });
  it("'stream#filter'", (next) => {
	var filter = __.monad.stream.filter.bind(__);
	var take = __.monad.stream.take.bind(__);
	var toArray = __.monad.stream.toArray.bind(__);
	var intgersFrom = (n) => {
	  return __.monad.stream.cons.call(__, n, (_) => {
		return intgersFrom(n + 1);
	  });
	};
    var even = (n) => {
      return 0 === (n % 2);
    };
    expect(
      toArray(filter(take(intgersFrom(1))(10))(even))
    ).to.eql(
      [2,4,6,8,10]
    );
    next();
  });
  it("'stream#foldr'", (next) => {
	var foldr = __.monad.stream.foldr.bind(__);
	var take = __.monad.stream.take.bind(__);
	var intgersFrom = (n) => {
	  return __.monad.stream.cons.call(__, n, (_) => {
		return intgersFrom(n + 1);
	  });
	};
	var upto3 = take(intgersFrom(0))(3);
    expect(
      foldr(upto3)(0)((element) => {
		return (accumulator) => {
		  return accumulator + element;
		};
	  })
    ).to.eql(
      3
    );
    next();
  });
}); // end of stream monad
