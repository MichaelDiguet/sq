import Transaction from "./Transaction";
import { TPromise, isTPromise } from "./TPromise";

export class SampleErrorTransac implements Transaction {

  private isRollbackOk: boolean = true;

  constructor(isRollbackOk: boolean = true) {
    this.isRollbackOk = isRollbackOk;
  };

  commit(): TPromise {
    return new TPromise(function (resolve, reject) {
      reject(new Error("sample error"));
    }, this);
  };

  rollback(): Promise<void> {
    var self = this;
    return new Promise<void>(function (resolve, reject) {
      if (self.isRollbackOk) {
        resolve();
      } else {
        reject(new Error("sample rollback error"));
      }
    });
  };

};

export function launchError(isRollbackOk:boolean): TPromise {
  return new SampleErrorTransac(isRollbackOk).commit();
};

export default SampleErrorTransac;
