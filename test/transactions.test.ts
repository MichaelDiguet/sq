import * as assert from 'assert';
import {sq} from '../src/Sequence';
import * as st from '../src/SampleTransac';
import * as set from '../src/SampleErrorTransac';

var SampleTransac = st.default;
var incrementGlobalCounter = st.incrementGlobalCounter;

var SampleErrorTransac = set.default;
var launchError = set.launchError;

describe('sq(* -> yield <transaction>', function(){
  describe('with one transaction yield', function(){
    it('should work', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        var a = yield new SampleTransac();
        assert.equal(1, a);
      });
    })
  })

  describe('with one commited transaction yield', function(){
    it('should work', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        var a = yield new SampleTransac().commit();
        assert.equal(1, a);
      });
    })
  })

  describe('with several transaction and commited transaction yields', function(){
    it('should work', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        var a = yield new SampleTransac();
        var b = yield new SampleTransac().commit();
        var c = yield incrementGlobalCounter();

        assert.deepEqual([1, 2, 3], [a, b, c]);
      });
    })
  })

  describe('when a transaction is rejected', function(){
    it('should throw and resume if catched', function(){
      var error;
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        try {
          yield new SampleErrorTransac();
        } catch (err) {
          error = err;
        }
        assert('sample error' == error.message);
        var ret = yield incrementGlobalCounter();
        assert(1 == ret);
      });
    })
    it('should throw and rollback the sequences of transactions successfully', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        yield new SampleTransac();
        yield new SampleTransac();
        assert(SampleTransac.globalCounter === 2);
        yield launchError(true);
      }).catch(function(err) {
        assert('sample error' == err.message);
        assert(err.transactionRollbackSucceed === true);
        assert(SampleTransac.globalCounter === 0);
      });
    })
    it('should throw and rollback the sequences of commited transactions successfully', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        yield incrementGlobalCounter();
        yield incrementGlobalCounter();
        assert(SampleTransac.globalCounter === 2);
        yield launchError(true);
      }).catch(function(err) {
        assert('sample error' == err.message);
        assert(err.transactionRollbackSucceed === true);
        assert(SampleTransac.globalCounter === 0);
      });
    })
    it('should throw and fail to rollback the transaction', function(){
      SampleTransac.globalCounter = 0;
      return sq(function *(){
        yield incrementGlobalCounter();
        yield incrementGlobalCounter();
        assert(SampleTransac.globalCounter === 2);
        yield launchError(false);
      }).catch(function(err) {
        assert('sample rollback error' == err.message);
        assert(err.transactionRollbackFailed === true);
        assert(SampleTransac.globalCounter === 2);
      });
    })
  })
})
