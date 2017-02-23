import Transaction from "./Transaction";
import TPromise from "./TPromise";

export class SampleTransac implements Transaction {

  public static globalCounter = 0;

  private isOperationDone: boolean = false;

  commit(): TPromise {
    var self = this;
    return new TPromise(function (resolve, reject) {
      SampleTransac.globalCounter = SampleTransac.globalCounter + 1;
      self.isOperationDone = true;
      resolve(SampleTransac.globalCounter);
    }, self);
  };

  rollback(): Promise<void> {
    var self = this;
    return new Promise<void>(function (resolve, reject) {
      if (self.isOperationDone) {
        SampleTransac.globalCounter = SampleTransac.globalCounter - 1;
      }
      resolve();
    });
  };

};

export function incrementGlobalCounter(): TPromise {
  return new SampleTransac().commit();
};

export default SampleTransac;
