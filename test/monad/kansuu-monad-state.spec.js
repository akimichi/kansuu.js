"use strict";

// var util = require('util');
// var expect = require('expect.js');
// var __ = require('../lib/kansuu.js');
// var math = require('../lib/kansuu-math.js');
// var seedrandom = require('seedrandom');
// var Random = require("random-js");
// var rng = Random.engines.mt19937();

// describe("'monad' module", function() {
//   var unit = __.monad.state.unit.bind(__);
//   var flatMap = __.monad.state.flatMap.bind(__);
//   describe("'state' monad", function() {
//     it("'state#unit'", (next) => {
//       expect(
//         unit(1)()
//       ).to.eql(
//         1
//       );
//       next();
//     });
//     // it("'state#flatMap'", (next) => {
//     //   var fs = require('fs');
//     //   var write = (path, content) => {
//     //     return () => {
//     //       fs.writeFileSync(path,content);
//     //       return content;
//     //     };
//     //   };
//     //   var read = (path) => {
//     //     return () => {
//     //       return fs.readFileSync(path,'utf8');
//     //     };
//     //   };
//     //   var path = "test/resource/state.txt";
//     //   expect(
//     //    flatMap(read(path))((content) => {
//     //      return flatMap(write(path, "What a wonderful world!"))(() => {
//     //        return null;
//     //      });
//     //    })
//     //   ).to.eql(
//     //     1
//     //   );
//     //   next();
//     // });
//   });
// });

//   //   describe("stack example", function() {
//   //     var pop = (stack) => {
//   //       __.list.censor(stack);
//   //       return __.pair.cons.call(__, stack.head)(stack.tail);
//   //     };
//   //     var push = (value) => {
//   //       return (stack) => {
//   //         var runState = (s) => {
//   //           var newStack =__.pair.cons.call(__, null)(__.list.cons.call(__, value)(s.state));
//   //         };
//   //         return __.monad.state.state.call(__,value)(stack)(runState);
//   //       };
//   //     };
//   //     it("'stack manipulation'", (next) => {
//   //       var unit = __.monad.state.unit.bind(__);
//   //       var flatMap = __.monad.state.flatMap.bind(__);
//   //       // var computation = flatMap(push(3))(function(stack1){
//   //       //   return flatMap(pop())(function(stack2){
//   //       //     return unit(stack2);
//   //       //   });
//   //       // });
//   //       // var computation = (stackState) => {
//   //       //   return flatMap(stackState)(push(3))
//   //       //                             ))(pop);
//   //       // };
//   //       expect(
//   //         flatMap(push(3))(function(stack){
//   //           return unit()(stack);
//   //         })(__.list.empty)
//   //       ).to.eql(
//   //         self.pair.mkPair.call(self, 3)(__.list.empty)
//   //       );
//   //       next();
//   //     });
//   //   });
//   // });
