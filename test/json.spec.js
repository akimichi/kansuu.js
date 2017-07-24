"use strict";

const expect = require('expect.js');
const List = require('../lib/kansuu-list.js');
const Pair = require('../lib/kansuu-pair.js');
const Stream = require('../lib/kansuu-stream.js');

var __ = require('../lib/kansuu.js');

describe("json test", function() {
  describe("object json test", function() {
    var object = require('./json/object.json');
    it("get property", function(next) {
      expect(object["Contents"].length).to.be(13);
      next();
    });
  });

  describe("array json test", function() {
    var array = require('./json/array.json');

    it("'length''", function(next) {
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

