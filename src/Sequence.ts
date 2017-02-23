import * as co from 'co';
import { Transaction, isTransaction } from "./Transaction";
import { TPromise, isTPromise } from "./TPromise";

export class Sequence implements Transaction {

  private readonly gen: () => Iterator<any>;

  private readonly genArgs: any[];

  private rollbackList: [Promise<any>, Transaction][] = [];

  constructor(gen: () => Iterator<any>, genArgs?: any[]) {
    this.gen = gen;
    this.genArgs = genArgs;
  }

  commit(): TPromise {
    let ctx = this;
    let coParams = [this.gen].concat(this.genArgs);
    return new TPromise(
      function (resolve, reject) {
        co.apply(ctx, coParams).then(function (res: any) {
          resolve(res);
        }).catch(function (err: any) {
          reject(err);
        });
      }, this
    );
  }

  rollback(): Promise<void> {
    let self = this;
    return co(function* () {
      for (var index = self.rollbackList.length - 1; index >= 0; index--) {
        let [p, t] = self.rollbackList[index];
        // Ensure that the promise finished (this may not be the case,
        // especially if some operation have been launched in // during the commit)
        try {
          yield p;
        } catch (e) {
          // Do not care about failures of operations launched by this sequence commit
        }
        yield t.rollback();
      }
    });
  }

  // These two last private methods are used for co customization.
  // They will be called on the unit transactions that will be launched by this sequence commit.

  isYieldable(obj: any): obj is Transaction {
    return isTransaction(obj) || isTPromise(obj);
  }

  toPromise(obj: Transaction | TPromise): Promise<any> {
    let tPromise = isTransaction(obj) ? obj.commit() : obj;
    this.rollbackList.push([tPromise, tPromise.transaction]);
    return tPromise;
  }
};

export function sq(gen: () => Iterator<any>, ...restOfArgs: any[]): Promise<any> {
  var s = new Sequence(gen, restOfArgs);
  return s.commit().catch(function (errDuringCommit) {
    return s.rollback().catch(function (errDuringRollback) {
      // Critical situation, the rollback failed
      if (errDuringRollback instanceof Object) errDuringRollback.transactionRollbackFailed = true;
      throw errDuringRollback;
    }).then(function () {
      // The error launched during the sequence caused a successful rollback
      if (errDuringCommit instanceof Object) errDuringCommit.causedRollbackOfTransaction = true;
      throw errDuringCommit;
    });
  });
};

export default Sequence;
