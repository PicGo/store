import Lowdb from 'lowdb'
import { ZlibAdapter } from './adapters/ZlibAdapter'
import { metaInfoHelper } from './utils/metaInfoHelper'
import { IMetaInfoMode, IObject, IResult } from './types'
class DBStore {
  private readonly db: Promise<Lowdb.LowdbAsync<any>>
  private readonly collectionName: string
  private readonly collectionKey: string
  private reading: Promise<Lowdb.LowdbAsync<any>> | null = null
  constructor (dbPath: string, collectionName: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!dbPath || !collectionName) {
      throw Error('Please provide valid dbPath or collectionName')
    }
    this.collectionName = collectionName
    this.collectionKey = `__${collectionName}_KEY__`
    const adapter = new ZlibAdapter(dbPath, collectionName)
    this.db = Lowdb<any>(adapter)
  }

  async read (flush = false): Promise<Lowdb.LowdbAsync<any>> {
    if (flush || !this.reading) {
      this.reading = (await this.db).read()
    }
    return this.reading
  }

  async get (): Promise<IObject[]> {
    return (await this.read()).get(this.collectionName).value()
  }

  @metaInfoHelper(IMetaInfoMode.create)
  async insert<T> (value: T): Promise<IResult<T>> {
    const id = (value as IResult<T>).id
    // @ts-ignore
    const result = (await this.read()).get(`${this.collectionKey}.${id}`).value()
    // @ts-ignore
    if (result) {
      await this.updateById(id, value)
      return (value as IResult<T>)
    }
    const collection = (await this.read()).get(this.collectionName)
    // @ts-ignore
    await collection.push(value).write()
    await (await this.read()).set(`${this.collectionKey}.${id}`, 1).write()
    return (value as IResult<T>)
  }

  @metaInfoHelper(IMetaInfoMode.create)
  async insertMany<T> (value: T[]): Promise<Array<IResult<T>>> {
    for (const item of value) {
      await this.insert(item)
    }
    return (value as Array<IResult<T>>)
  }

  @metaInfoHelper(IMetaInfoMode.update)
  async updateById (id: string, value: IObject): Promise<boolean> {
    const collection = (await this.read()).get(this.collectionName)
    const result = (await this.read()).get(`${this.collectionKey}.${id}`).value()
    if (result) {
    // @ts-ignore
      await collection.find({ id }).assign(value).write()
      return true
    } else {
      return false
    }
  }

  async getById<T> (id: string): Promise<T | undefined> {
    return (await this.read())
      .get(this.collectionName)
      // @ts-ignore
      .find({ id })
      .value()
  }

  async removeById (id: string): Promise<void> {
    const collection = (await this.read()).get(this.collectionName)
    // @ts-ignore
    await collection.remove({ id }).write()
    await (await this.read()).get(this.collectionKey).unset(id).write()
  }
}

export {
  DBStore
}
