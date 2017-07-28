"use strict";

const expect = require('expect.js'),
  __ = require('./kansuu.js'),
  math = require('./kansuu-math.js'),
  Pair = require('./kansuu-pair.js'),
  List = require('./kansuu-monad.js').list;

// 'btree' module
// ===========
// 二分木モジュール
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

const match = (data, pattern) => {
  return data(pattern);
};

const unit = (value) => {
  return leaf(value);
  // return {
  //   type: 'btree',
  //   leaf: value,
  //   fork: base.nothing
  // };
};
const leaf = (value) => {
  return (pattern) => {
    return pattern.leaf(value);
  };
  // return match(atree, {
  //   empty: (_) => {
  //     return undefined;
  //   },
  //   cons: (leaf, fork) => {
  //     return leaf;
  //   }
  // });
};
const fork = (treeA, treeB) => {
  return (pattern) => {
    return pattern.fork(treeA, treeB);
  };
};
// const empty = (_) => {
//   return (pattern) => {
//     return pattern.empty();
//   };
// };


// ## btree#map
// c.f."Introduction to Functional Programming using Haskell",p.184
// ~~~haskell
//  map f (Leaf x) = Leaf (f x)
//  map f (Fork xt yt) = Fork (map f xt) (map f yt)
//
//  mapbtree:: (A => B) => Tree[A] => Tree[B]
//  mapbtree f ( Tip x)    = Tip (J x)
//  mapbtree f (Bin t1 t2) = Bin (mapbtree f t1 ) (mapbtree f t2)
// ~~~
const map =  (atree) => {
  return (transform) => {
    expect(transform).to.a('function');
    return match(atree, {
      leaf: (value) => {
        return leaf(transform(value));
      },
      fork: (xt, yt) => {
        return  fork(map(xt)(transform), map(yt)(transform));
      }
    });
  };
};

// ## btree#mkBtree
// ~~~haskell
// mkBtree :: [α] → Btree α
// mkBtree xs
//    | (m 0) = Leaf (unwrap xs)
//    | otherwise = Fork (mkBtree ys) (mkBtree zs)
//       where m = (length xs) div 2
//       (ys, zs) = splitAt m xs
//
// unwrap [x] = x 
// ~~~
const mkBtree = (alist) => {
  const unwrap = (alist) => {
    expect(List.length(alist)).to.equal(1);
    return List.head(alist); 
  };
  const m = math.div(List.length(alist))(2);
  if(m === 0) {
    return leaf(unwrap(alist));
  } else {
    return List.match(List.splitAt(alist)(m),{
      cons: (head, tail) => {
        const ys = head;
        const zs = List.head(tail);
        return fork(mkBtree(ys), mkBtree(zs));
      }
    });
  }
};
// ## btree#flatMap
// ~~~haskell
// flatMap (Leaf x) = \f -> f x
// flatMap (Fork t1 t1) =
//   \f -> Fork (flatMap t1 f)
//              (flatMap t2 f)
// ~~~
// const flatMap = (btree) => {
//   return (transform) => {
//     expect(transform).to.a('function');
//     if(self.existy(btree.leaf)){
//       return transform.call(self, btree.leaf);
//     } else {
//       self.pair.censor.call(self,btree.fork);
//       var leftBranch = self.pair.left.call(self, btree.fork);
//       var rightBranch = self.pair.right.call(self, btree.fork);
//       return {
//         type: 'btree',
//         leaf: base.nothing,
//         fork: self.pair.mkPair.call(self,
//             self.btree.flatMap.call(self, leftBranch)(transform))(self.btree.flatMap.call(self, rightBranch)(transform))
//       };
//     }
//   };
// };

// ## btree#size
// c.f."Introduction to Functional Programming using Haskell",p.181
// ~~~haskell
// size :: Btree α → Int
// size (Leaf x) = 1
// size (Fork xt yt) = size xt + size yt
//
// size = length . flatten
// ~~~
const size = (btree) => {
  return match(btree, {
    leaf: (value) => {
      return 1;
    },
    fork: (treeA, treeB) => {
      return size(treeA) + size(treeB); 
    }
  });
  // return __.compose(List.length, Tree.flatten)(btree);
};

// ## btree#flatten
// ~~~haskell
// flatten :: Btree α → [α]
// flatten (Leaf x) = [x]
// flatten (Fork xt yt) = flatten xt ++ flatten yt
//
//  flatten = fold wrap append
// ~~~
const flatten = (btree) => {
  return match(btree, {
    leaf: (value) => {
      return List.unit(value);
    },
    fork: (treeA, treeB) => {
      return List.append(flatten(treeA))(flatten(treeB));
    }
  });
  // var wrap = (value) => {
  //   return List.cons(value, List.empty());
  // };
  // return Tree.fold(tree)(wrap)(List.append);
};
// ## btree#fold
// c.f."Introduction to Functional Programming using Haskell",p.184
// ~~~haskell
//  fold f g (Leaf x) = f x
//  fold f g (Fork xt yt) = g(fold f g xt) (fold f g yt))
//
//  fold: (A => A => A) => Tree[A] => A 
//  fold (+) ( Tip x)     = x
//  fold (+) (Bin t1 t2 ) = (foldbtree (+) t1 ) + (foldbtree (+) t2) 
// ~~~
const fold = (btree) => {
  return (f) => {
    expect(f).to.a('function');
    return (g) => {
      expect(g).to.a('function');
      return match(btree, {
        leaf: (value) => {
          return f(value);
        },
        fork: (treeA, treeB) => {
          return g(Ttree.fold(treeA)(f)(g))(Tree.fold(treeB)(f)(g));
        }
      });
    };
  };
};


module.exports = {
  match: match,
  unit: unit,
  leaf: leaf,
  fork: fork,
  map: map,
  // flatMap, flatMap,
  flatten: flatten,
  fold: fold,
  size: size,
  mkBtree: mkBtree,
};
