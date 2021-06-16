declare module "orbit-db" {
  import { EventEmitter } from "events";
  import IPFS from "ipfs";

  export default class OrbitDB {
    static createInstance(
      ipfs: any,
      options: { [key: string]: any }
    ): Promise<OrbitDB>;
    identity: {
      id: string;
    };
    _ipfs: IPFS;
    determineAddress(name: string, type: string, options?: ?{ [key: string]: any })
    isValidAddress(address: string): boolean;
    open(address: string, options?: ?{ [key: string]: any }): Promise<Store>;
    kvstore(string, options?: ?{ [key: string]: any }): Promise<Store>;
    keyvalue(string, options?: ?{ [key: string]: any }): Promise<KeyValueStore>;
    feed(string, options?: ?{ [key: string]: any }): Promise<FeedStore>;
    eventlog(string, options?: ?{ [key: string]: any }): Promise<Store>;
    counter(string, options?: ?{ [key: string]: any }): Promise<Store>;
    docstore(string, options?: ?{ [key: string]: any }): Promise<Store>;
  }
  export class IPFSAccessController extends EventEmitter {
    type: string;
    address: string;
    canAppend: (entry: any, identityProvider: any) => Promise<boolean>;
    write: string[];
  }

  export class Store {
    id: string;
    address: string;
    type: string;
    events: EventEmitter;
    access: IPFSAccessController;
    drop(): Promise<void>;
    load(): Promise<void>;
    close(): Promise<void>;
  }

  export class KeyValueStore extends Store {
    put(key: string, value: any): Promise<string>;
    set(key: string, value: any): Promise<string>;
    get(key: string): Promise<any>;
    del(key: string): Promise<string>;
    all: { [key: string]: any };
  }

  class Iterator {
    collect(): any[];
  }

  export interface élémentFeedStore {
    hash: string;
    payload: {
      value: any;
    };
  }

  export class FeedStore extends Store {
    add(any): Promise<string>;
    get(hash: string): Promise<any>;
    remove(hash: string): Promise<string>;
    iterator(options: FeedStoreIteratorOptions): Iterator<élémentFeedStore>;
  }

  export class AccessControllers {
    static addAccessController(options: { [key: string]: any }): void;
  }

  export function isValidAddress(address: string): boolean;
}
