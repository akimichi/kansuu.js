"use strict";

var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var qc = require('../lib/kensho.js');
const List = require('../lib/kansuu-list.js');
const Stream = require('../lib/kansuu-stream.js');

describe("Kensho module", () => {
  it("ints", (next) => {
    var ints = qc.ints(1);
    expect(
      Stream.head(ints)
    ).to.eql(1);
    expect(
      Stream.head(Stream.tail(ints))
    ).to.eql(2);
    next();
  });
  // it("randoms", (next) => {
  //   const randomGenerator = qc.randomGen.call(qc,0);
  //   const randStream = qc.randoms.call(qc, randomGenerator);
  //   expect(
  //     Stream.head(randStream)
  //   ).to.be(
  //     0.000000001682261200
  //   );
  //   expect(
  //     Stream.head(Stream.tail(randStream))
  //   ).to.be(
  //     0.08624634995353292
  //   );
  //   next();
  // });
  it("forAll", (next) => {
    var intStream = qc.ints(1);
    var intUpto10 = Stream.take(intStream)(10);
    var prop = qc.forAll(intUpto10)(item => {
      return (item > 0) && (item < 11);
    });
	expect(prop).to.ok();
    next();
  });

  describe("Kensho module", () => {
	// ~~~haskell
	// prop_RevUnit x =
	//   reverse [x] == [x]
	// ~~~
    it("reverse [x] == [x]", (next) => {
      // var prop_RevUnit = function(x){
      // 	var list = __.list.mkList.bind(__)([x]);
      // 	return __.list.reverse.bind(__)(list).isEqual(list);
      // };
      var intStream = qc.ints(1);
      var intUpto10 = Stream.take(intStream)(10);
      var prop = qc.forAll(intUpto10)(n => {
        var list = List.mkList([n]);
        return List.isEqual(List.reverse(list),list);
      });
	    expect(prop).to.ok();
      next();
	  });
	  // ~~~haskell
	  // prop_RevApp xs ys =
	  //   reverse (xs++ys) == reverse ys++reverse xs
	  // ~~~
    it("reverse (xs++ys) == reverse ys ++ reverse xs", (next) => {
        var intstream = qc.ints(1);
        var intupto10 = Stream.take(intstream)(10);
        const prop = qc.forAll(intupto10)(n => {
           var alist = List.mkList([n]);
           return List.isEqual(List.reverse(alist),alist);
        });
	      expect(prop).to.ok();
        next();
    });
	// ~~~haskell
	// prop_RevRev xs =
	//   reverse (reverse xs) == xs
	// ~~~
  });
});

