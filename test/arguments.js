var assert = require('assert');
var sequence = require('../dist/Sequence.js');
var sq = sequence.sq;

describe('sq(gen, args)', function () {
  it('should pass the rest of the arguments', function () {
    return sq(function *(num, str, arr, obj, fun){
      assert(num === 42);
      assert(str === 'forty-two');
      assert(arr[0] === 42);
      assert(obj.value === 42);
      assert(fun instanceof Function)
    }, 42, 'forty-two', [42], { value: 42 }, function () {});
  })
})
