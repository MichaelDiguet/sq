var assert = require('assert');
var sequence = require('../src/Sequence.js');
var sq = sequence.sq;

var read = require('mz/fs').readFile;

describe('sq(* -> yield [])', function(){
  it('should aggregate several promises', function(){
    return sq(function *(){
      var a = read('tsconfig.json', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield [a, b, c];
      assert.equal(3, res.length);
      assert(~res[0].indexOf('compilerOptions'));
      assert(~res[1].indexOf('MIT'));
      assert(~res[2].indexOf('devDependencies'));
    });
  })

  it('should noop with no args', function(){
    return sq(function *(){
      var res = yield [];
      assert.equal(0, res.length);
    });
  })

  it('should support an array of generators', function(){
    return sq(function*(){
      var val = yield [function*(){ return 1 }()]
      assert.deepEqual(val, [1])
    })
  })
})
