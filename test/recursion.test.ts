import * as assert from 'assert';
import {sq} from '../src/Sequence';

import * as mzfs from 'mz/fs';
var read = mzfs.readFile;

describe('sq() recursion', function(){
  it('should aggregate arrays within arrays', function(){
    return sq(function *(){
      var a = read('tsconfig.json', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield [a, [b, c]];
      assert.equal(2, res.length);
      assert(~res[0].indexOf('compilerOptions'));
      assert.equal(2, res[1].length);
      assert(~res[1][0].indexOf('MIT'));
      assert(~res[1][1].indexOf('devDependencies'));
    });
  })

  it('should aggregate objects within objects', function(){
    return sq(function *(){
      var a = read('tsconfig.json', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield {
        0: a,
        1: {
          0: b,
          1: c
        }
      };

      assert(~res[0].indexOf('compilerOptions'));
      assert(~res[1][0].indexOf('MIT'));
      assert(~res[1][1].indexOf('devDependencies'));
    });
  })
})
