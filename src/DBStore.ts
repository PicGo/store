import Lowdb from 'lowdb'
import { ZlibAdapter } from './adapters/ZlibAdapter'
import { metaInfoHelper } from './utils/metaInfoHelper'
import { IMetaInfoMode, IObject, IResult } from './types'
class DBStore {
  private readonly db: Promise<Lowdb.LowdbAsync<any>>
  private readonly collectionName: string
  constructor (dbPath: string, collectionName: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!dbPath || !collectionName) {
      throw Error('Please provide valid dbPath or collectionName')
    }
    this.collectionName = collectionName
    const adapter = new ZlibAdapter(dbPath, collectionName)
    this.db = Lowdb<any>(adapter)
  }

  async read (): Promise<Lowdb.LowdbAsync<any>> {
    return (await this.db).read()
  }

  async get (): Promise<IObject[]> {
    return (await this.read()).get(this.collectionName).value()
  }

  @metaInfoHelper(IMetaInfoMode.create)
  async insert<T> (value: T): Promise<IResult<T>> {
    // @ts-ignore
    await (await this.read()).get(this.collectionName).push(value).write()
    return (value as IResult<T>)
  }

  @metaInfoHelper(IMetaInfoMode.create)
  async insertMany<T> (value: T[]): Promise<Array<IResult<T>>> {
    // @ts-ignore
    await (await this.read()).get(this.collectionName).push(...value).write()
    return (value as Array<IResult<T>>)
  }

  @metaInfoHelper(IMetaInfoMode.update)
  async updateById (id: string, value: IObject): Promise<boolean> {
    const collection = (await this.read()).get(this.collectionName)
    // @ts-ignore
    const result = await collection.find({
      id
    }).value()
    if (result) {
      // @ts-ignore
      await collection.find({ id }).assign(result, value, { id }).write()
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
  }
}

export {
  DBStore
}
