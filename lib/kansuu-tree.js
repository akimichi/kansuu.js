"use strict";

const expect = require('expect.js');
const Pair = require('./kansuu-pair.js');
const List = require('./kansuu-list.js');

// 'btree' module
// ===========
//
// ~~~haskell
// type BTree a = Leaf a
//              | Fork (BTree a) (BTree a)
//
// unit x = Leaf x
// flatMap (Leaf x) = \f -> f x
// flatMap (Fork t1 t1) =
//   \f -> Fork (flatMap t1 f)
//              (flatMap t2 f)
// ~~~
const unit: (value) => {
  return cons(value, undefined);
  // return {
  //   type: 'btree',
  //   leaf: value,
  //   fork: base.nothing
  // };
};

const empty = (_) => {
  return (pattern) => {
    return pattern.empty();
  };
};

const cons = (leaf, fork) => {
  return (pattern) => {
    return pattern.cons(leaf, fork);
  };
};

const leaf = (atree) => {
  return match(atree, {
    empty: (_) => {
      return undefined;
    },
    cons: (leaf, fork) => {
      return leaf;
    }
  });
};
const fork = (atree) => {
  return match(atree, {
    empty: (_) => {
      return undefined;
    },
    cons: (leaf, fork) => {
      return fork;
    }
  });
};

// ## btree#map
// c.f."Introduction to Functional Programming using Haskell",p.184
// ~~~haskell
//  map f (Leaf x) = Leaf (f x)
//  map f (Fork xt yt) = Fork (map f xt) (map f yt)
// ~~~
map: (atree) => {
  return (transform) => {
    expect(transform).to.a('function');
    if(leaf(atree)){
      return unit(transform(leaf(atree)));
    } else {

      var leftBranch = self.pair.left(btree.fork);
      var rightBranch = self.pair.right(btree.fork);
      return {
        type: 'btree',
        leaf: base.nothing,
        fork: self.pair.mkPair.call(self,
            self.btree.map.call(self, leftBranch)(transform))(self.btree.map.call(self, rightBranch)(transform))
      };
    }
  };
};

// ## btree#mkBtree
// ~~~haskell
// mkBtree :: List a -> Btree a
// mkBtree xs =
//
// ~~~
// mkBtree: (list) => {
//   expect(list).to.not.be.empty();
//   if(self.list.length.call(self, list) === 1) {
//     return self.btree.unit.call(self, list.head);
//   } else {
//     var pair = self.list.halve.call(self, list);
//     var leftList = self.pair.left.call(self,pair);
//     var rightList = self.pair.right.call(self,pair);
//     self.list.censor.call(self,leftList);
//     self.list.censor.call(self,rightList);
//     var leftBranch = self.btree.mkBtree.call(self, leftList);
//     var rightBranch = self.btree.mkBtree.call(self, rightList);
//     return {
//       type: 'btree',
//       leaf: base.nothing,
//       fork: self.pair.mkPair.call(self,leftBranch)(rightBranch)
//     };
//   }
// },
// ## btree#flatMap
// ~~~haskell
// flatMap (Leaf x) = \f -> f x
// flatMap (Fork t1 t1) =
//   \f -> Fork (flatMap t1 f)
//              (flatMap t2 f)
// ~~~
flatMap: (btree) => {
  var self = this;
  self.btree.censor.call(self,btree);
  return (transform) => {
    expect(transform).to.a('function');
    if(self.existy(btree.leaf)){
      return transform.call(self, btree.leaf);
    } else {
      self.pair.censor.call(self,btree.fork);
      var leftBranch = self.pair.left.call(self, btree.fork);
      var rightBranch = self.pair.right.call(self, btree.fork);
      return {
        type: 'btree',
        leaf: base.nothing,
        fork: self.pair.mkPair.call(self,
            self.btree.flatMap.call(self, leftBranch)(transform))(self.btree.flatMap.call(self, rightBranch)(transform))
      };
    }
  };

},
// ## btree#size
// c.f."Introduction to Functional Programming using Haskell",p.181
// ~~~haskell
// size = length . flatten
// ~~~
size: (btree) => {
  var self = this;
  self.btree.censor.call(self,btree);
  return self.compose.call(self, self.list.length.bind(self))(self.btree.flatten.bind(self))(btree);
},
// ## btree#flatten
// ~~~haskell
//  flatten = fold wrap append
// ~~~
flatten: (btree) => {
  var self = this;
  self.btree.censor.call(self,btree);
  var wrap = (value) => {
    return self.list.cons.call(self, value)(self.list.empty);
  };
  return self.btree.fold.call(self,btree)(wrap.bind(self))(self.list.append.bind(self));
  // if(self.existy(btree.leaf)){
  //   return self.list.cons.call(self,btree.leaf)(self.list.empty);
  // } else {
  //   self.pair.censor.call(self,btree.fork);
  //   var leftBranch = self.btree.flatten.call(self, self.pair.left.call(self, btree.fork));
  //   var rightBranch = self.btree.flatten.call(self, self.pair.right.call(self, btree.fork));
  //   return  self.list.append.call(self,
  //                                 leftBranch)(rightBranch);
  // }
},
// ## btree#fold
// c.f."Introduction to Functional Programming using Haskell",p.184
// ~~~haskell
//  fold f g (Leaf x) = f x
//  fold f g (Fork xt yt) = g(fold f g xt) (fold f g yt))
// ~~~
fold: (btree) => {
  var self = this;
  self.btree.censor.call(self,btree);
  return (f) => {
    expect(f).to.a('function');
    return (g) => {
      expect(g).to.a('function');
      if(self.existy(btree.leaf)){
        return f.call(self, btree.leaf);
      } else {
        self.pair.censor.call(self,btree.fork);
        var xt = self.pair.left.call(self, btree.fork);
        var yt = self.pair.right.call(self, btree.fork);
        return g.call(self, self.btree.fold.call(self, xt)(f)(g))(self.btree.fold.call(self, yt)(f)(g));
      }
    };
  };
},
append:(xt) => {
  var self = this;
  self.btree.censor(xt);
  return function(yt){
    self.btree.censor(yt);
    if(self.existy(xt.leaf)){
      return {
        type: 'btree',
        leaf: base.nothing,
        fork: self.pair.mkPair.call(self,xt.leaf)(yt)
      };
    } else {
      self.pair.censor.call(self,xt.fork);
      var leftBranch = self.pair.left.call(self, xt.fork);
      var rightBranch = self.pair.right.call(self, xt.fork);
      return {
        type: 'btree',
        leaf: base.nothing,
        fork: self.btree.append.call(self,self.btree.append.call(self,leftBranch)(rightBranch))(yt)
      };
    }
  };
},
// empty: {
//   type : 'btree',
//   leaf : base.nothing,
//   fork : base.nothing
// },
// // tree#isEmpty
// isEmpty: function(btree){
//   var self = this;
//   self.btree.censor(btree);
//   if(self.btree.head === base.nothing && list.btree === base.nothing){
//     return true;
//   } else {
//     return false;
//   }
// },

module.exports = {
  cons: cons,

};
