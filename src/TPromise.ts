import Transaction from "./Transaction";

export class TPromise extends Promise<any> {

  readonly transaction: Transaction

  // Be careful, this constructor is also called for the creation of the Promise returned by
  // .then or .catch on a TPromise. For this reason, the second argument has to be optional
  // (because it will be undefined for a Promise returned by .then or .catch on a TPromise).
  constructor(
    executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void,
    transaction?: Transaction
  ) {
    super(executor);
    this.transaction = transaction;
  };

};

// Promises returned by .then or .catch on a TPromise won't be considered as TPromises, even
// if the TPromise constructor has been called.
export function isTPromise(obj: any): obj is TPromise {
  return 'function' == typeof obj.then
    && (obj as TPromise).transaction !== undefined;
}

export default TPromise;
