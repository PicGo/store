import { LowSync } from '@commonify/lowdb'
import { JSONAdapter } from './adapters/JSONAdapter'
import lodash from 'lodash'
import { IJSON } from './types'

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}
class JSONStore {
  private readonly db: LowWithLodash<IJSON>
  private hasRead: boolean = false
  constructor (dbPath: string) {
    if (!dbPath) {
      throw Error('Please provide valid dbPath')
    }
    const adapter = new JSONAdapter(dbPath)
    this.db = new LowWithLodash(adapter)
    this.read()
  }

  read (flush = false): IJSON {
    /* istanbul ignore else */
    if (flush || !this.hasRead) {
      this.hasRead = true
      this.db.read()
    }
    return this.db.data as IJSON
  }

  get (key = ''): any {
    return this.db.chain.get(key).value()
  }

  set (key: string, value: any): void {
    this.db.chain.set(key, value).value()
    this.db.write()
  }

  has (key: string): boolean {
    return this.db.chain.has(key).value()
  }

  unset (key: string, value: any): boolean {
    const res = this.db.chain.get(key).unset(value).value()
    this.db.write()
    return res
  }
}

export {
  JSONStore
}
