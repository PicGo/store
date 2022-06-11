import Lowdb from 'lowdb'
import { ZlibAdapter } from './adapters/ZlibAdapter'
import { metaInfoHelper } from './utils/metaInfoHelper'
import { IMetaInfoMode, IObject, IResult, IGetResult, IFilter } from './types'
class DBStore {
  private readonly db: Promise<Lowdb.LowdbAsync<any>>
  private readonly collectionName: string
  private readonly collectionKey: string
  private reading: Promise<Lowdb.LowdbAsync<any>> | null = null
  public errorList: Array<Error | string> = []
  private readonly adapter: ZlibAdapter
  constructor (dbPath: string, collectionName: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!dbPath || !collectionName) {
      throw Error('Please provide valid dbPath or collectionName')
    }
    this.collectionName = collectionName
    this.collectionKey = `__${collectionName}_KEY__`
    this.adapter = new ZlibAdapter(dbPath, collectionName, this.errorList)
    this.db = Lowdb<any>(this.adapter)
  }

  getAdapter (): ZlibAdapter {
    return this.adapter
  }

  async read (flush = false): Promise<Lowdb.LowdbAsync<any>> {
    if (flush || !this.reading) {
      this.reading = (await this.db).read()
    }
    return this.reading
  }

  async get (filter?: IFilter): Promise<IGetResult<IObject>> {
    let data: Array<IResult<IObject>> = (await this.read()).get(this.collectionName).value().slice()
    const total = data.length
    if (filter !== undefined) {
      if (filter.orderBy === 'desc') {
        data = data.reverse()
      }
      if (typeof filter.offset === 'number' && filter.offset >= 0) {
        data = data.slice(filter.offset)
      }
      if (typeof filter.limit === 'number' && filter.limit > 0) {
        data = data.slice(0, filter.limit)
      }
    }
    return {
      total,
      data
    }
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
