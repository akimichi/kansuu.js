  // // 'objects' module
  // // ==============
  // objects: {
  //   empty: {
  //   },
  //   unit: (key, value) => {
  //     var self = this;
  //     return self.objects.set.call(self,key)(value)(self.objects.empty);
  //     // return self.tap(self.objects.empty)((obj) => {
  //     //    obj[key] = value;
  //     // });
  //   },
  //   set: (key) => {
  //     var self = this;
  //     return (value) => {
  //       return (obj) => {
  //         expect(obj).to.an('object');
  //         return self.tap.call(self,obj)((target) => {
  //           target[key] = value;
  //         });
  //       };
  //     };
  //   },
  //   get: (key) => {
  //     var self = this;
  //     return (obj) => {
  //       expect(obj).to.an('object');
  //       return obj[key];
  //     };
  //   },
  //   isEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     var hasOwnProperty = Object.prototype.hasOwnProperty;
  //     for(var key in obj){
  //       if(hasOwnProperty.call(obj, key))
  //         return false;
  //     }
  //   },
  //   isNotEmpty: (obj) => {
  //     var self = this;
  //     expect(obj).to.an('object');
  //     return self.not.call(self,self.objects.isEmpty(obj));
  //   },
  // },
  //
  // record:{
  //   empty: function(_){
  //     var self = this;
  //     return self.monad.maybe.nothing;
  //   },
  //   extend: function(record){
  //     expect(record).to.a('function');
  //     var self = this;
  //     return function(key){
  //       return function(value){
  //         return function(lookupKey){
  //           if(lookupKey === key){
  //             return self.monad.maybe.unit.bind(self)(value);
  //           } else {
  //             return record(lookupKey);
  //           }
  //         };
  //       };
  //     };
  //   },
  //   lookup: function(record){
  //     return function(key){
  //       return record(key);
  //     };
  //   },
  // }, /* end of 'record' module */

