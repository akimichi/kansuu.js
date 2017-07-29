# kansuu.js

Yet another functional programming library for node.js.

Please note that this module is in very experimental stage.
It requires node v8.1 or above.

The 'motto' of this library is 'the same power with less magic'.

## Usage

~~~
$ git clone https://github.com/akimichi/kansuu.js.git
$ cd kansuu.js
kansuu.js$ nvm use
kansuu.js$ npm install
kansuu.js$ npm install -g mocha
kansuu.js$ npm test 
~~~

## Examples


### Prime numbers in stream

~~~js
const Stream = require('kansuu.js').stream,
 Pair = require('kansuu.js').pair,
 Maybe = require('kansuu.js').monad.maybe,
 List = require('kansuu.js').monad.list;

const primes = Stream.cons(2, (_) => {
  const stream = Stream.unfold(3)(n => {
    return Maybe.just(Pair.cons(n, n+1));
  });
  return Stream.filter(stream)(math.isPrime); 
});

expect(
  List.toArray(Stream.take(primes)(20))
).to.eql(
  [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71]
);
~~~


## Docs

~~~
$ node_modules/docco/bin/docco lib/kansuu.js
$ open doc/kansuu.html
~~~
