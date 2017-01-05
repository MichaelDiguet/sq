import Transaction from "./Transaction";

export class TPromise extends Promise<any> {

  readonly transaction: Transaction

  // Be careful, this constructor is also called for a standard Promise, that's why
  // it is very important that the second argument is optional.
  constructor(
    executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void,
    transaction: Transaction
  ) {
    super(executor);
    this.transaction = transaction;
  };

};

export function isTPromise(obj: any): obj is TPromise {
  return 'function' == typeof obj.then
    && (obj as TPromise).transaction !== undefined;
}

export default TPromise;
