"use strict";

var util = require('util');
var expect = require('expect.js');
var __ = require('../lib/kansuu.js');
var math = require('../lib/kansuu-math.js');
var seedrandom = require('seedrandom');
var Random = require("random-js");
var rng = Random.engines.mt19937();

describe("'monad' module", function() {
  describe("'list' monad", function() {
    var unit = __.monad.list.unit.bind(__);
    var toArray = __.list.toArray.bind(__);
    var mkList = __.list.mkList.bind(__);
    var empty = __.list.empty;

    it("'list#flatMap'", (next) => {
      this.timeout(6000);
      var flatMap = __.monad.list.flatMap.bind(__);
      var list = mkList([3,4,5]);
      expect(
        toArray(flatMap(list)(function (x){
          return mkList([x, -x]);
        }))
      ).to.eql(
        [3,-3,4,-4,5,-5]
      );
      expect(
        toArray(flatMap(mkList([1,2,3]))(function (x){
          return flatMap(mkList([10,20,30]))(function (y){
            return unit(__.pair.mkPair.call(__, x)(y));
          });
        }))
      ).to.eql(
        [
          __.pair.mkPair.call(__, 1)(10),
          __.pair.mkPair.call(__, 1)(20),
          __.pair.mkPair.call(__, 1)(30),
          __.pair.mkPair.call(__, 2)(10),
          __.pair.mkPair.call(__, 2)(20),
          __.pair.mkPair.call(__, 2)(30),
          __.pair.mkPair.call(__, 3)(10),
          __.pair.mkPair.call(__, 3)(20),
          __.pair.mkPair.call(__, 3)(30)
        ]
      );
      next();
    });
    it("'list#flatten'", function(next) {
      expect(
        toArray(__.monad.list.flatten.call(__, unit(unit(2))))
      ).to.eql(
        [2]
      );
      next();
    });
    describe("monad laws on list", function() {
      var flatMap = __.monad.list.flatMap.bind(__);
      var unit = __.monad.list.unit.bind(__);

      it("flatMap(m)(unit) == m", function(next){
        var list = unit(2);
        expect(
          toArray(flatMap(list)(unit))
        ).to.eql(
          toArray(list)
        );
        next();
      });
      it("flatMap(unit(v))(f) == f(v)", function(next){
        var list = unit(2);
        var square = (n) => {
          return unit(n * n);
        };
        expect(
          toArray(flatMap(list)(square))
        ).to.eql(
          toArray(square(2))
        );
        next();
      });
      it("flatMap(flatMap(m)(g))(h) == flatMap(m)(\\x => flatMap(g(x))(h))", function(next){
        var list = unit(2);
        var square = function(n){
          return unit(n * n);
        };
        var negate = function(n){
          return unit(- n);
        };
        expect(
          toArray(flatMap(flatMap(list)(square))(negate))
        ).to.eql(
          toArray(flatMap(list)(function(x){
            return flatMap(square(x))(negate);
          }))
        );
        next();
      });
    });
  });
});
