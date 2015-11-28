"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var base = require('../lib/kansuu-base.js');
var math = require('../lib/kansuu-math.js');

describe("'combinator' example", () => {
  it('temp', (next) => {
	var not = (predicate) => {
	  return (data) => {
		return ! predicate(data);
	  };
	};
	var and = (predicate1) => {
      return (predicate2) => {
		return (data) => {
		  return predicate1(data) && predicate2(data);
		};
	  };
	};
	var or = (predicate1) => {
      return (predicate2) => {
		return (data) => {
		  return predicate1(data) || predicate2(data);
		};
      };
	};
	var within = (lower) => {
	  return (upper) => {
		return (data) => {
		  return (extractor) => {
			// return __.and(math.isMoreThan(lower))(math.isLessThan(upper))(extractor(data));
			return seq(extractor, math.isMoreThan(lower))(extractor, math.isLessThan(upper))(data);
		  };
		};
	  };
	};
	var seq = (firstExtractor, firstPredicate) => {
		return (nextExtractor, nextPredicate) => {
		  return (data) => {
			var firstResult = firstPredicate(firstExtractor(data))
			if(! firstResult) {
			  return false;
			} else {
			  return nextPredicate(nextExtractor(data));
			}
		  }
		};
	};
	var alt = (firstExtractor, firstPredicate) => {
		return (nextExtractor, nextPredicate) => {
		  return (data) => {
			var firstResult = firstPredicate(firstExtractor(data))
			if(firstResult) {
			  return true;
			} else {
			  return nextPredicate(nextExtractor(data));
			}
		  }
		};
	};
  	var data = {
  	  temp: 24,
  	  time: new Date("2013/2/15 17:57:27")
  	};
    expect(((_) => {
	  var getTemp = (data) => {
		return __.objects.get('temp')(data);
	  };
	  var getHour = (data) => {
		return __.objects.get('time')(data).getHours();
	  };
	  return seq(getTemp, math.isMoreThan(20))(getHour, __.equal(17))(data)
    })()).to.eql(
  	  true
  	)
    expect(((_) => {
	  var getTemp = (data) => {
		return __.objects.get('temp')(data);
	  };
	  var getHour = (data) => {
		return __.objects.get('time')(data).getHours();
	  };
	  return alt(getTemp, math.isMoreThan(30))(getHour, __.equal(17))(data)
    })()).to.eql(
  	  true
  	)
    expect(
	  within(20)(30)(__.objects.get('temp')(data))(__.id)
    ).to.eql(
  	  true
  	)
    expect(
	  within(20)(30)(data)(__.objects.get('temp'))
    ).to.eql(
  	  true
  	)
    expect(
	  within(20)(30)(data)((data) => {
		return __.objects.get('temp')(data)
	  })
    ).to.eql(
  	  true
  	)
    next();
  });
});
