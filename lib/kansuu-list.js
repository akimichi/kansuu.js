"use strict";

var expect = require('expect.js');
var base = require('../lib/kansuu-base.js');

module.exports = {
    // 'list' module
    // ===========
    //
    // ~~~scala
    // trait List[+T] {
    //   def isEmpty: Boolean
    //   def head: T
    //   def tail: List[T]
    //   def ::[U>:T](item: U): List[U]
    //   def map[U](f: T => U): List[U] = if (isEmpty) Nil
    //                                    else f(head) :: tail.map(f)
    //   def last: T = {
    //     @annotation.tailrec
    //     def recursive(list:List[T]):T = {
    //       if(list.tail.isEmpty)
    //         list.head
    //       else {
    //        recursive(list.tail)
    //       }
    //     }
    //     recursive(this)
    //   }
    //   def foreach(f: T => Unit): Unit = {
    //     if(isEmpty)
    //       return
    //     else {
    //       f(head)
    //       tail.foreach(f)
    //     }
    //   }
    // }
    // case class ListImpl[T](val head: T, val tail: List[T]) extends List[T] {
    //   def ::[U>:T](item: U): List[U] = new ListImpl(item, this)
    //   def isEmpty = false
    // }
    // case object Nil extends List[Nothing] {
    //   def ::[U>:Nothing](item: U): List[U] = ListImpl(item, Nil)
    //   override def isEmpty = true
    //   def head: Nothing = throw new NoSuchElementException("no head in empty list")
    //   def tail: List[Nothing] = throw new NoSuchElementException("no tail in empty list")
    // }
    // ~~~
    isList: (obj) => {
        var self = this;
        return self.list.and.call(self,
                self.list.fromArray.call(self,[self.equal(self.plucker('type')(obj))('list'),
                    self.existy(self.plucker('head')(obj)),
                    self.existy(self.plucker('tail')(obj))]));
    },
    censor: (obj) => {
        expect(obj).to.have.property('type','list');
        expect(obj).to.have.property('head');
        expect(obj).to.have.property('tail');
        return obj;
    },
    /* #@range_begin(list_empty) */
    // ### list#empty
    empty: {
        type : 'list',
        head : base.nothing,
        tail : base.nothing
    },
    /* #@range_end(list_empty) */
    // list#isEmpty
    isEmpty: function(list){
        var self = this;
        self.list.censor(list);
        if(self.list.head === base.nothing && list.tail === base.nothing){
            return true;
        } else {
            return false;
        }
    },
    /* #@range_begin(list_isEqual) */
    // ## list#isEqual
    isEqual: function(list1){
        var self = this;
        self.list.censor(list1);
        return function(list2){
            self.list.censor(list2);
            if(self.list.length.bind(self)(list1) === self.list.length.bind(self)(list2)){
                var zipped = self.list.zip.bind(self)(list1)(list2);
                return self.list.reduce.bind(self)(zipped)(true)(function(pair){
                    return function(accumulator){
                        return accumulator && (pair.left === pair.right);
                    };
                });
            } else {
                return false;
            }
        };
    },
    /* #@range_end(list_isEqual) */
    // ## list#cons
    // cons :: T => List[T] => List
    /* #@range_begin(list_cons) */
    cons: function(any){
        var self = this;
        return function(list){
            self.list.censor.bind(self)(list);
            var instance = {
                type: 'list',
                head: any,
                tail: list,
                isEqual: function(list){
                    self.list.censor(list);
                    return self.list.isEqual.call(self,instance)(list);
                }
            };
            return self.tap.call(self, instance)(function (target){
                Object.freeze(target);
            });
        };
    },
    /* #@range_end(list_cons) */
    // ## list#mkList
    mkList: (array) => {
        expect(array).to.an('array');
        var self = this;
        return self.fromArray.call(self, array);
    },
    fromArray: (array) => {
        expect(array).to.an('array');
        var self = this;
        if(array.length === 1){
            return self.list.cons.call(self, self.head(array))(self.list.empty);
        } else {
            return self.list.cons.call(self, self.head(array))(self.list.fromArray.call(self,
                        self.tail(array)));
        }
    },
    // list#fromString
    fromString: (string) => {
        expect(string).to.a('string');
        var self = this;
        return self.list.mkList.call(self,self.string.toArray.call(self,string));
    },
    // list#at
    at: (list) => {
        var self = this;
        self.list.censor.call(self,list);
        return (index) => {
            expect(index).to.a('number');
            expect(index).to.be.greaterThan(-1);
            if (index === 0) {
                return list.head;
            } else {
                var nextList = list.tail;
                return self.list.at.call(self,
                        nextList)(index-1);
            }
        };
    },
    // ## list#tail
    tail: function(list){
        var self = this;
        self.list.censor(list);
        return list.tail;
    },
    // head: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return list.head;
    // },
    // ## list#snoc
    // snoc :: T => List => List
    snoc: function(any){
        var self = this;
        return function(list){
            self.list.censor(list);
            return self.list.concat.bind(self)(list)(self.list.mkList.bind(self)([any]));
        };
    },
    // ## list#join
    // join :: List[List[T]] => List[T]
    //
    // ~~~haskell
    // join :: List (List a) -> List a
    // join Nil = Nil
    // join (Cons xs xss) =  concat xs (join xss)
    // ~~~
    join: function(list){
        var self = this;
        self.list.censor(list);
        if(self.list.isEmpty.bind(self)(list)){
            return self.list.empty;
        } else {
            return self.list.concat.bind(self)(list.head)(self.list.join.bind(self)(list.tail));
        }
    },
    // ## list#concat
    //
    // ~~~haskell
    // concat :: List => List => List
    // concat :: List a -> List a -> List a
    // concat Nil ys = ys
    // concat (Cons x xs) ys = Cons x (cat xs ys)
    // ~~~
    concat: function(xs){
        var self = this;
        self.list.censor(xs);
        return function(ys){
            self.list.censor(ys);
            if(self.list.isEmpty.bind(self)(xs)){
                return ys;
            } else {
                return self.list.cons.bind(self)(xs.head)(self.list.concat.bind(self)(xs.tail)(ys));
            }
        };
    },
    // ## list#foldr
    //
    // if the list is empty, the result is the initial value z; else
    // apply f to the first element and the result of folding the rest
    //
    // foldr (⊕) v [x0, x1, ..., xn] = x0 ⊕ (x1 ⊕ (...(xn ⊕ v)...))
    //
    // ~~~haskell
    // foldr f z []     = z
    // foldr f z (x:xs) = f x (foldr f z xs)
    // ~~~
    foldr: (list) => {
        var self = this;
        self.list.censor(list);
        return (accumulator) => {
            return (glue) => {
                expect(glue).to.a('function');
                if(self.list.isEmpty.call(self,list)){
                    return accumulator;
                } else {
                    var item = list.head;
                    var tail = list.tail;
                    return glue(item)(self.list.foldr.call(self,
                                tail)(accumulator)(glue));
                }
            };
        };
    },
    // ## list#foldl
    //
    //  if the list is empty, the result is the initial value; else
    //  we recurse immediately, making the new initial value the result
    //  of combining the old initial value with the first element.
    //
    // ~~~haskell
    // foldl :: (a → b → a) → a → [b ] → a
    // foldl _ v [ ] = v
    // foldl f v (x : xs) = foldl f (f v x) xs
    // ~~~
    foldl: function(list){
        var self = this;
        self.list.censor(list);
        //expect(self.list.isEmpty(list)).to.not.be(true);
        return function(accumulator){
            return function(glue){
                expect(glue).to.a('function');
                if(self.list.isEmpty.bind(self)(list)) {
                    return accumulator;
                } else {
                    var item = list.head;
                    var tail = list.tail;
                    return self.list.foldl.bind(self)(tail)(glue(item)(accumulator))(glue);
                }
            };
        };
    },
    // list#reduce
    /* #@range_begin(list_reduce) */
    reduce: (list) => {
        var self = this;
        self.list.censor(list);
        expect(self.list.isEmpty.bind(self)(list)).to.not.be(true);
        return (accumulator) => {
            return (glue) => {
                expect(glue).to.a('function');
                var item = list.head;
                var tail = list.tail;
                if(self.list.isEmpty.bind(self)(tail)) {
                    return glue(item)(accumulator);
                } else {
                    return glue(item)(self.list.reduce.bind(self)(tail)(accumulator)(glue));
                }
            };
        };
    },
    /* #@range_end(list_reduce) */
    // list#sum
    sum: (list) => {
        var self = this;
        self.list.censor(list);
        return self.list.reduce.bind(self)(list)(0)((currentValue) => {
            return (accumulator) => {
                return currentValue + accumulator;
            };
        });
    },
    // list#reverse
    // ~~~haskell
    // reverse :: List => List
    // reverse = foldl cons, []
    // ~~~
    reverse: function(list){
        var self = this;
        self.list.censor(list);
        return self.list.foldl.bind(self)(list)(self.list.empty)(self.list.cons.bind(self));
        // if(self.list.isEmpty.bind(self)(list)){
        //   return list;
        // } else {
        //   return self.list.snoc.bind(self)(list.head)(self.list.reverse.bind(self)(list.tail));
        // }
    },
    // ## list#flatMap
    //
    // ~~~haskell
    // flatMap :: List[T] => (T => List[S]) => List[S]
    // instance Monad [] where
    //   return x = [x]
    //   xs >>= f = join (map f xs)
    // ~~~
    flatMap: function(list){
        var self = this;
        self.list.censor(list);
        return function(transform){
            expect(transform).to.a('function');
            return self.list.censor.call(self,
                    self.list.join.call(self,
                        self.list.map.call(self,
                            list)(transform)));
            //return self.list.join.bind(self)(self.list.map.bind(self)(list)(transform));
        };
    },
    // ## list#map
    // map :: List => fun => List
    // ~~~haskell
    //  map f = foldr (cons . f) Nil
    // ~~~
    // map: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return function(transform){
    //     expect(transform).to.a('function');
    //     return self.list.reduce.bind(self)(list)(self.list.empty)(function(item){
    //       return function(accumulator){
    //         return self.list.cons.bind(self)(transform.call(self,item))(accumulator);
    //       };
    //     });
    //   };
    // },
    /* #@range_begin(list_map) */
    map: (list) => {
        var self = this;
        self.list.censor(list);
        return (transform) => {
            expect(transform).to.a('function');
            var glue = self.compose.call(self, self.list.cons.bind(self))(transform);
            return self.list.foldr.call(self,
                    list)(self.list.empty)(glue);
        };
    },
    /* #@range_end(list_map) */
    //
    // ## list#filter
    //
    // ~~~haskell
    // filter p []  = []
    // filter p (x:xs)  = if p x then x:filter p xs
    //                    else filter p xs
    // ~~~
    filter: function(list){
        var self = this;
        self.list.censor(list);
        return function(predicate){
            expect(predicate).to.a('function');
            var reversed =  self.list.reduce.bind(self)(list)(self.list.empty)(function(item){
                return function(accumulator){
                    if(self.truthy(predicate(item))) {
                        return self.list.snoc.bind(self)(item)(accumulator);
                    } else {
                        return accumulator;
                    }
                };
            });
            return self.list.reverse.bind(self)(reversed);
        };
    },
    // ## list#listToMaybe
    // ~~~haskell
    // listToMaybe            :: [a] -> Maybe a
    // listToMaybe []         =  Nothing
    // listToMaybe (a:_)      =  Just a
    // ~~~
    listToMaybe: (list) => {
        var self = this;
        self.list.censor(list);
        //console.log(list)
        if(self.list.isEmpty.call(self, list)) {
            return self.monad.maybe.nothing;
        } else {
            return self.monad.maybe.unit.call(self, list.head);
        }
    },
    // ## list#find
    // The find function takes a predicate and a list and returns the first element in the list matching the predicate, or Nothing if there is no such element.
    //
    // ~~~haskell
    // find :: (a -> Bool) -> [a] -> Maybe a
    // find                    :: (a -> Bool) -> [a] -> Maybe a
    // find p                  =  listToMaybe . filter p
    // ~~~
    find: (list) => {
        var self = this;
        self.list.censor(list);
        return (predicate) => {
            expect(predicate).to.a('function');
            // return self.list.listToMaybe.call(self,
            //                                   self.list.filter.call(self,
            //                                                         list)(predicate));
            return self.compose.call(self,
                    self.list.listToMaybe.bind(self))(self.flip.call(self,self.list.filter.bind(self))(predicate))(list);
        };
    },
    // list#zip :: List[T] => List[U] => Pair[T,U]
    //
    // c.f. "Thinking Functionally with Haskell",p.73
    //
    // ~~~haskell
    // zip (x:xs) (y:ys) = (x,y) : zip xs ys
    // zip _ _           = []
    // ~~~
    // or,
    // ~~~haskell
    // zip = zipWith mkPair
    // ~~~
    zip: function(list1){
        var self = this;
        self.list.censor(list1);
        return function(list2){
            self.list.censor(list2);
            if(self.list.isEmpty.bind(self)(list1)){
                return self.list.empty;
            }
            if(self.list.isEmpty.bind(self)(list2)){
                return self.list.empty;
            }
            var x = list1.head;
            var xs = list1.tail;
            var y = list2.head;
            var ys = list2.tail;
            var head = self.pair.mkPair.bind(self)(x)(y);
            var tail = self.list.zip.bind(self)(xs)(ys);
            return self.list.cons.bind(self)(head)(tail);
        };
    },
    // list.zipWith :: function => List[T] => List[U] => List[S]
    //
    // c.f. "Thinking Functionally with Haskell",p.73
    //
    // ~~~haskell
    // zipWith (x:xs) (y:ys) = f x y : zipWith f xs ys
    // zipWith _ _           = []
    // ~~~
    zipWith: function(fun){
        expect(fun).to.a('function');
        var self = this;
        return function(list1){
            self.list.censor(list1);
            return function(list2){
                self.list.censor(list2);
                if(self.list.isEmpty.bind(self)(list1)){
                    return self.list.empty;
                }
                if(self.list.isEmpty.bind(self)(list2)){
                    return self.list.empty;
                }
                var x = list1.head;
                var xs = list1.tail;
                var y = list2.head;
                var ys = list2.tail;
                return self.list.cons.bind(self)(fun(x)(y))(self.list.zipWith.bind(self)(fun)(xs)(ys));
            };
        };
    },
    // ~~~haskell
    // pairs :: [a ] → [(a, a)]
    // pairs xs = zip xs (tail xs)
    // ~~~
    pairs: function(list){
        var self = this;
        self.list.censor(list);
        return self.list.zip.bind(self)(list)(list.tail);
    },
    // ## list#toArray
    // toArray : List[T] => array
    toArray: function(list){
        var self = this;
        self.list.censor(list);
        if(self.list.isEmpty.bind(self)(list)){
            return [];
        } else {
            var tail = self.list.toArray.bind(self)(list.tail);
            if(self.list.isList.call(self,list.head)) {
                return self.cons.bind(self)(self.list.toArray.call(self,list.head))(tail);
            } else {
                return self.cons.bind(self)(list.head)(tail);
            }
        }
    },
    // ## list#take
    // take :: List => List
    take: function(list){
        var self = this;
        self.list.censor(list);
        return function(n) {
            expect(n).to.a('number');
            expect(n).to.be.greaterThan(-1);
            if (n === 0) {
                return self.list.empty;
            } else {
                return self.list.cons.call(self,list.head)(self.list.take.call(self,list.tail)(n-1));
            }
        };
    },
    // ## list#drop
    // drop :: List => List
    drop: function(list){
        var self = this;
        self.list.censor(list);
        return function(n){
            expect(n).to.be.a('number');
            expect(n).to.be.greaterThan(-1);
            if (n === 0)
                return list;
            else {
                if(self.list.isEmpty.bind(self)(list))
                    return self.list.empty;
                else {
                    var tail = list.tail;
                    return self.list.drop.bind(self)(tail)(n-1);
                }
            }
            // if (n === 0)
            //   return list;
            // else {
            //   if(self.list.isEmpty(list))
            //  return [];
            //   else {
            //  var tail = list.tail();
            //  return self.list.drop.bind(self)(tail)(n-1);
            //   }
            // }
        };
    },
    // ## list#splitAt
    // Split a list at the nth element:
    // ~~~haskell
    // splitAt :: Int → [a ] → ([a ], [a ])
    // splitAt n xs = (take n xs, drop n xs)
    // ~~~
    splitAt: (list) => {
        var self = this;
        self.list.censor(list);
        return (n) => {
            expect(n).to.a('number');
            var former = self.list.take.call(self,list)(n);
            var latter = self.list.cons.call(self,self.list.drop.call(self,list)(n))(self.list.empty);
            return self.list.cons.call(self,former)(latter);
        };
    },
    // ## list#shred
    shred: (list) => {
        var self = this;
        self.list.censor(list);
        return (n) => {
            expect(n).to.a('number');
            if(self.list.length.call(self,list) < n) {
                return list;
            } else {
                var splitted = self.list.splitAt.call(self,list)(n);
                var former = self.list.at.call(self,splitted)(0);
                var latter = self.list.at.call(self,splitted)(1);
                return self.list.cons.call(self,former)(self.list.shred.call(self,latter)(n));
            }
        };
    },
    // ## list#shuffle
    // ~~~haskell
    // shuffle :: [a] → [a ] → [a]
    // shuffle [] ys = ys
    // shuffle xs ys = x : shuffle ys xs
    // ~~~
    shuffle: (listA) => {
        var self = this;
        self.list.censor(listA);
        return (listB) => {
            self.list.censor(listB);
            if(self.list.isEmpty.call(self,listA)) {
                return listB;
            } else {
                var x = listA.head;
                var xs = self.list.tail.call(self,listA);
                return self.list.cons.call(self,x)(self.list.shuffle.call(self,listB)(xs));
            }
        };
    },
    // ## list#length
    length: (list) => {
        var self = this;
        self.list.censor(list);
        if(self.list.isEmpty.bind(self)(list)){
            return 0;
        } else {
            return self.list.reduce.bind(self)(list)(0)(function(item){
                return function(accumulator){
                    return 1 + accumulator;
                };
            });
        }
    },
    // ## list#init
    // init :: List => List
    init: function(list){
        var self = this;
        self.list.censor(list);
        var length = self.list.length.bind(self)(list);
        return self.list.take.bind(self)(list)(length-1);
        // var array = self.list.take.bind(self)(list)(length-1);
        // return self.list.mkList.bind(self)(array);
    },
    // ## list#last
    // last:: List[T] => T
    // ~~~haskell
    // last [x] = x
    // last (_:xs) = last xs
    // ~~~
    last: (list) => {
        var self = this;
        self.list.censor(list);
        var length = self.list.length.bind(self)(list);
        expect(length).above(0);
        if(length === 1) {
            return list.head;
        } else {
            var rest = list.tail;
            return self.list.last.bind(self)(rest);
        }
        /* return self.compose(self.head)(self.reverse)(list); */
    },
    // ## list#intersperse
    // intersperse :: a -> [a] -> [a] Source
    //
    // The intersperse function takes an element and a list and `intersperses' that element between the elements of the list. For example,
    //
    // intersperse ',' "abcde" == "a,b,c,d,e"
    intersperse: function(any){
        return function(list){
            expect(list).to.an('array');
        };
    },
    // intercalate :: [a] -> [[a]] -> [a] Source
    // intercalate xs xss is equivalent to (concat (intersperse xs xss)). It inserts the list xs in between the lists in xss and concatenates the result.

    // transpose :: [[a]] -> [[a]] Source
    // The transpose function transposes the rows and columns of its argument. For example,
    // transpose [[1,2,3],[4,5,6]] == [[1,4],[2,5],[3,6]]   // tail:: [T] => [T]

    // subsequences :: [a] -> [[a]] Source
    //
    // The subsequences function returns the list of all subsequences of the argument.
    //
    // subsequences "abc" == ["","a","b","ab","c","ac","bc","abc"]

    // permutations :: [a] -> [[a]] Source
    //
    // The permutations function returns the list of all permutations of the argument.
    //
    // permutations "abc" == ["abc","bac","cba","bca","cab","acb"]

    // list.repeat
    // -- repeat x is an infinite list, with x the value of every element.
    // ~~~haskell
    // repeat           :: a -> [a]
    // repeat x         =  xs where xs = x:xs
    // ~~~
    //
    // ## list#replicate
    replicate: function(n){
        var self = this;
        expect(n).to.a('number');
        expect(n).to.be.greaterThan(-1);
        return function(any){
            return self.stream.take.bind(self)(self.stream.repeat.bind(self)(any))(n);
        };
    },
    // ## list#and
    // and :: List => Bool
    and: function(list){
        var self = this;
        self.list.censor(list);
        return self.list.reduce.bind(self)(list)(true)(function(item){
            return function(accumulator){
                return self.truthy(item) && accumulator;
            };
        });
    },
    // or :: List[Bool] => Bool
    or: function(list){
        var self = this;
        self.list.censor(list);
        return self.list.reduce.bind(self)(list)(false)(function(item){
            return function(accumulator){
                return self.truthy(item) || accumulator;
            };
        });
    },
    all: function(list){
        var self = this;
        self.list.censor(list);
        return function(predicate){
            expect(predicate).to.a('function');
            return self.compose.bind(self)(self.list.and.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
        };
    },
    any: function(list){
        var self = this;
        self.list.censor(list);
        return function(predicate){
            expect(predicate).to.a('function');
            return self.compose.bind(self)(self.list.or.bind(self))(self.flip.bind(self)(self.list.map.bind(self))(predicate))(list);
        };
    },
    // elem: function(value){
    //   var self = this;
    //   return function(list){
    //  self.list.censor(list);

    //   };
    // }
    // c.f. "Thinking Functionally with Haskell",p.774
    // ~~~haskell
    // position           :: (Eq a) => a -> [a] -> Int
    // position x         =  head ([j | (j,y) <- zip [0..] xs, y==x] ++ [-1])
    // ~~~
    // position: function(list){
    //   var self = this;
    //   self.list.censor(list);
    //   return function(any){

    //   });
    // },

    // sort :: List => List
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // sort [] = []
    // sort [x] = [x]
    // sort xs = merge (sort ys) (sort zs)
    //            where (ys, zs) = halve xs
    // ~~~
    sort: function(list) {
        var self = this;
        self.list.censor(list);
        var length = self.list.length.bind(self)(list);
        switch (length) {
            case 0:
                return list;
                break;
            case 1:
                return list;
                break;
            default:
                var halve = self.list.halve.bind(self)(list);
                return self.list.merge.bind(self)(self.list.sort.bind(self)(halve.left))(self.list.sort.bind(self)(halve.right));
                break;
        }
    },
    // ## list#halve
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // halve xs = (take n xs, drop n xs)
    //            where n = length xs `div` 2
    // ~~~
    halve: (list) => {
        var self = this;
        self.list.censor(list);
        var n = self.div(self.list.length.bind(self)(list))(2);
        var left = self.list.take.call(self,list)(n);
        var right = self.list.drop.call(self,list)(n);
        return self.pair.mkPair.call(self,left)(right);
    },
    // ## list#append
    //
    // ~~~haskell
    // append [] ys = ys
    // append (x:xs) ys = x:(xs `append` ys)
    //
    // append xs ys = foldr cons xs ys
    // ~~~
    append:(xs) => {
        var self = this;
        self.list.censor(xs);
        return function(ys){
            self.list.censor(ys);
            return self.list.foldr.call(self,xs)(ys)(self.list.cons.bind(self));
        };
    },
    // append:(listX) => {
    //   var self = this;
    //   self.list.censor(listX);
    //   return function(listY){
    //     self.list.censor(listY);
    //     if(self.list.isEmpty.bind(self)(listX)){
    //       return listY;
    //     }
    //     var x = listX.head;
    //     var xs = listX.tail;
    //     return self.list.cons.bind(self)(x)(self.list.append.bind(self)(xs)(listY));
    //   };
    // },
    // ## list#merge
    // c.f. "Thinking Functionally with Haskell",p.76
    //
    // ~~~haskell
    // merge [] ys = ys
    // merge xs [] = xs
    // merge (x:xs) (y:ys) =
    //    | x <= y = x:merge xs (y:ys)
    //    | otherwise = y:merge (x:xs) ys
    // ~~~
    merge: (listX) => {
        var self = this;
        self.list.censor(listX);
        return function(listY){
            self.list.censor(listY);
            if(self.list.isEmpty.bind(self)(listX)){
                return listY;
            }
            if(self.list.isEmpty.bind(self)(listY)){
                return listX;
            }
            var x = listX.head;
            var xs = listX.tail;
            var y = listY.head;
            var ys = listY.tail;
            if(x <= y){
                return self.list.cons.bind(self)(x)(self.list.merge.bind(self)(xs)(listY));
            } else {
                return self.list.cons.bind(self)(y)(self.list.merge.bind(self)(listX)(ys));
            }
        };
    },
    // ## list#unfold
    //  unfold builds a list from a seed value.
    //
    // ~~~haskell
    // unfoldr :: (b -> Maybe (a, b)) -> b -> [a]
    //
    // unfold p h t seed | p seed      = []
    //                   |otherwise = h seed : unfold p h t (t seed)
    // ~~~
    //
    // ~~~scheme
    // (unfold p f g seed) =
    //    (if (p seed) (tail-gen seed)
    //        (cons (f seed)
    //              (unfold p f g (g seed))))
    // ~~~
    unfold: (until) => {    // Determines when to stop unfolding.
        var self = this;
        return (mapper) => { // Maps each seed value to the corresponding list element.
            return (next) => { // Maps each seed value to next seed value.
                return (seed) => {
                    if(until.call(self,seed)) {
                        return self.list.empty;
                    } else {
                        return self.list.cons.call(self, seed)(self.list.unfold.call(self, until)(mapper)(next)(next.call(self,seed)));
                    }
                };
            };
        };
    },
    // ## list#range
    range: (start) => {
        var self = this;
        var math = require('../lib/kansuu-math.js');
        expect(start).to.a('number');
        return (end) => {
            expect(end).to.a('number');
            return self.list.unfold.call(self,self.equal(end+1))(self.id)(math.succ)(start);
        };
    }
} /* end of 'list' module */
