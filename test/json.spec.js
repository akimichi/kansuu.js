"use strict";

const expect = require('expect.js');
const List = require('../lib/kansuu-monad.js').list;
const Pair = require('../lib/kansuu-pair.js');
const Stream = require('../lib/kansuu-stream.js');

var __ = require('../lib/kansuu.js');

describe("json test", () => {
  describe("object json test", () => {
    var object = require('./resource/object.json');
    it("get property", (next) => {
      expect(object["Contents"].length).to.be(13);
      next();
    });
  });

  describe("array json test", function() {
    var array = require('./resource/array.json');

    it("'length''", (next) => {
      expect(array.length).to.be(13);
      next();
    });
    it("mkList'", (next) => {
      const alist = List.mkList(array);
      expect(
        array.length
      ).to.be(
        13
      );
      next();
    });
  });
});

