var assert = require('assert');
var sequence = require('../dist/Sequence.js');
var sq = sequence.sq;

var read = require('mz/fs').readFile;

describe('sq(* -> yield {})', function(){
  it('should aggregate several promises', function(){
    return sq(function *(){
      var a = read('tsconfig.json', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield {
        a: a,
        b: b,
        c: c
      };

      assert.equal(3, Object.keys(res).length);
      assert(~res.a.indexOf('compilerOptions'));
      assert(~res.b.indexOf('MIT'));
      assert(~res.c.indexOf('devDependencies'));
    });
  })

  it('should noop with no args', function(){
    return sq(function *(){
      var res = yield {};
      assert.equal(0, Object.keys(res).length);
    });
  })

  it('should ignore non-thunkable properties', function(){
    return sq(function *(){
      var foo = {
        name: { first: 'tobi' },
        age: 2,
        address: read('tsconfig.json', 'utf8'),
        tobi: new Pet('tobi'),
        now: new Date(),
        falsey: false,
        nully: null,
        undefiney: undefined,
      };

      var res = yield foo;

      assert.equal('tobi', res.name.first);
      assert.equal(2, res.age);
      assert.equal('tobi', res.tobi.name);
      assert.equal(foo.now, res.now);
      assert.equal(false, foo.falsey);
      assert.equal(null, foo.nully);
      assert.equal(undefined, foo.undefiney);
      assert(~res.address.indexOf('compilerOptions'));
    });
  })

  it('should preserve key order', function(){
    function timedThunk(time){
      return function(cb){
        setTimeout(cb, time);
      }
    }

    return sq(function *(){
      var before = {
        sun: timedThunk(30),
        rain: timedThunk(20),
        moon: timedThunk(10)
      };

      var after = yield before;

      var orderBefore = Object.keys(before).join(',');
      var orderAfter = Object.keys(after).join(',');
      assert.equal(orderBefore, orderAfter);
    });
  })
})

function Pet(name) {
  this.name = name;
  this.something = function(){};
}
