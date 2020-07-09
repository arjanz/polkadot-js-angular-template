import { Injectable } from '@angular/core';
import {ApiPromise, WsProvider} from '@polkadot/api';

interface Dictionary<T> {
    [Key: string]: T;
}

@Injectable({
  providedIn: 'root'
})
export class PolkadotJsService {

  public apis: Dictionary<ApiPromise> = {};

  constructor() { }

  async createApi(nodeUrl: string): Promise<ApiPromise> {

    if (!(nodeUrl in this.apis)) {
      console.log('New connection to ', nodeUrl);
      this.apis[nodeUrl] = await ApiPromise.create({provider: new WsProvider(nodeUrl)});
    }

    return this.apis[nodeUrl];
  }
}
