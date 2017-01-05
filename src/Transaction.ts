import TPromise from "./TPromise";

export interface Transaction {
  commit(): TPromise;
  rollback(): Promise<void>;
};

export function isTransaction(obj: any): obj is Transaction {
  return (obj as Transaction).commit !== undefined
    && (obj as Transaction).rollback !== undefined;
}

export default Transaction;
