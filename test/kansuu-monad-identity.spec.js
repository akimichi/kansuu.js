"use strict";

// var util = require('util');
// var expect = require('expect.js');
// var __ = require('../lib/kansuu.js');
// var math = require('../lib/kansuu-math.js');
// var seedrandom = require('seedrandom');
// var Random = require("random-js");
// var rng = Random.engines.mt19937();

// describe("'monad' module", function() {
//   describe("'identity' monad", () => {
//     var unit = __.monad.identity.unit.bind(__);
//     var flatMap = __.monad.identity.flatMap.bind(__);
//     it("identity#flatMap", (next) => {
//       var instance = unit(1);
//       expect(
//         flatMap(instance)((n) => {
//           return unit(n * 2);
//         })
//       ).to.eql(
//         unit(2)
//       );
//       expect(
//         flatMap(instance)((n) => {
//           return flatMap(unit(n * 2))((m) => {
//             return unit(m * 3);
//           });
//         })
//       ).to.eql(
//         unit(6)
//       );
//       expect(
//         flatMap(instance)((n) => {
//           return flatMap(unit(n))((m) => {
//             return unit(m * n);
//           });
//         })
//       ).to.eql(
//         unit(1)
//       );
//       next();
//     });
//   });
// });
