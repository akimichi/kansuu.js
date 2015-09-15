"use strict";

var __ = require('../lib/kansuu.js');
var expect = require('expect.js');
var hasProp = {}.hasOwnProperty;


module.exports = {
  /*
   #@range_begin(succeed_fail)
   */
  // succeed:: T => String => {value:T, input:String}
  succeed: function(value){
	return function(input){
	  return {value: value, input: input};
	};
  },
  // succeed:: () => String => {}
  fail: function(){
	return function(input){
	  return {};
	};
  },
  /*
   #@range_end(succeed_fail)
   */
  /*
   #@range_begin(satisfy)
   */
  // satisfy:: (T=>Bool) => String => {value:T, input:String}
  satisfy: function(predicate){
	return function(context){
	  return function(input){
		if(__.isEmpty(input)) {
		  return context.fail()();
		} else {
		  var head = __.head(input);
		  var tail = __.tail(input);
		  if(predicate(head)){
			return context.succeed(head)(tail);
		  } else {
			return context.fail()();
		  }
		}
	  };
	}(this);
  },
  /* #@range_end(satisfy)
   */
  /*
   #@range_begin(parse) */
  // parse: 
  parse: function(parser){
	return function(input){
	  return parser(input);
	};
  },
  /*
   #@range_end(parse) */
  item: function(){
	return function(input){
	  if(__.isEmpty(input)) {
		return [];
	  } else {
		var head = __.head(input);
		var tail = __.tail(input);
		return {value: head, input: tail};
	  }
	};
  },
  /* #@range_begin(char) */
  // char: Char => {value:T, input:String}
  char: function(ch){
	var predicate = function(head){
	  if(ch === head){
		return true;
	  } else {
		return false;
	  }
	};
	return this.satisfy(predicate);
  },
  /* #@range_end(char) */
  /* #@range_begin(string) */
  // char: Char => {value:T, input:String}
  string: function(string){
	return function(context){
	  if(__.isEmpty(string)) {
		return context.succeed('');
	  } else {
		var head = __.head(string);
		var tail = __.tail(string);
		
		return context.seq(context.char(head),function(x){
		  return context.seq(context.string(tail),function(xs){
			return context.succeed(x + xs);
		  });
		});
	  }
	}(this);
  },
  /* #@range_end(string) */
  lex: function(regex){
	return function(context){
  	  var predicate = function(ch){
  		if(regex.test(ch)){
  		  return true;
  		} else {
  		  return false;
  		}
  	  };
  	  return context.satisfy(predicate);
	}(this);
  },
  digit: function(){
	return function(context){
	  return context.lex(/\d/);

	}(this);
  },
  lower: function(){
	return function(context){
	  return context.lex(/[a-z]/);
	}(this);
  },
  upper: function(){
	return function(context){
	  return context.lex(/[A-Z]/);
	}(this);
  },
  letter: function(){
	return function(context){
	  return context.lex(/[a-zA-Z]/);
	}(this);
  },
  alphanum: function(){
	return function(context){
	  return context.lex(/\w/);
	}(this);
  },
  ident: function(){ // Parser String
	return function(context){
	  return context.seq(context.lower(), function(x){
		return context.seq(context.many(context.alphanum())(__.op["+"]), function(xs){
		  return context.succeed(x + xs);
		});
	  });
	}(this);
  },
  /* #@range_begin(space) */
  space: function(){ // Parser ()
	return function(context){
	  var isSpace = function(x){
		if(x === ' '){
		  return true;
		} else {
		  return false;
		}
	  };
	  return context.seq(context.many(context.satisfy(isSpace))(__.op["+"]), function(dummy){
		return context.succeed('');
	  });
	}(this);
  },
  /* #@range_end(space) */
  /* #@range_begin(token) */
  // token:: 
  token: function(parser){ // Parser a => Parser a
	return function(context){
	  return context.seq(context.space(), function(_){
		return context.seq(parser, function(v){
		  return context.seq(context.space(), function(_){
			return context.succeed(v);
		  });
		});
	  });
	}(this);
  },
  /* #@range_end(token) */
  identifier: function(_){
	return function(context){
	  return context.token(context.ident());
	}(this);
  },
  natural: function(_){
	return function(context){
	  return context.token(context.nat());
	}(this);
  },
  symbol: function(string){
	return function(context){
	  return context.token(context.string(string));
	}(this);
  },
  /* #@range_begin(seq) */
  // seq:: (Parser, Parser) => Parser
  seq: function(first, next){
	return function(context){
	  return function(input){
		var firstResult = context.parse(first)(input);
		if(__.isEmpty(firstResult)) {
		  return {};
		} else {
		  var firstValue = firstResult.value;
		  var nextInput = firstResult.input;
		  return context.parse(next(firstValue))(nextInput);
		}
	  };
	}(this);
  },
  /* #@range_end(seq) */
  /* #@range_begin(alt) */
  // alt:: (Parser, Parser) => Parser
  alt: function(first, alternative){ 
	return function(context){
	  return function(input){
		var firstResult = context.parse(first)(input);
		if(__.isEmpty(firstResult)) {
		  return context.parse(alternative)(input);
		} else {
		  return firstResult;
		}
	  };
	}(this);
  },
  /* #@range_end(alt) */
  /*
   #@range_begin(many1)
   */
   // Parser a => Parser [a]
  many1: function(parser){
	return function(context){
	  return function(operator){
		return context.seq(parser,function(v){
		  return context.seq(context.many(parser)(operator),function(vs){
			return context.succeed(operator(v,vs));
		  });
		});
	  };
	}(this);
  },
  /*  #@range_end(many1) */
  /* #@range_begin(many)  */
   // Parser a => Parser [a]
  many: function(parser){
	return function(context){
	  return function(operator){
		return context.alt(context.many1(parser)(operator),context.succeed([]));
	  };
	}(this);
  },
  /* #@range_end(many)  */
  /* #@range_begin(nat)  */
  nat: function(){ // Parser String
	return function(context){
	  return context.seq(context.many1(context.digit())(__.op["+"]), function(digits){
		return context.succeed(Number(digits));
	  });
	}(this);
  },
  /* #@range_end(nat)  */
};

