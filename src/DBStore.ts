/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Low } from '@commonify/lowdb'
import { ZlibAdapter } from './adapters/ZlibAdapter'
import { metaInfoHelper } from './utils/metaInfoHelper'
import { IMetaInfoMode, IObject, IResult, IGetResult, IFilter, ILowData, ILowDataKeyMap } from './types'

class DBStore {
  private readonly db: Low<ILowData>
  private readonly collectionName: string
  private readonly collectionKey: string
  private hasRead = false
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
    this.db = new Low<ILowData>(this.adapter)
  }

  getAdapter (): ZlibAdapter {
    return this.adapter
  }

  async read (flush = false): Promise<ILowData | null> {
    if (flush || !this.hasRead) {
      this.hasRead = true
      await this.db.read()
    }
    return this.db.data
  }

  async get (filter?: IFilter): Promise<IGetResult<IObject>> {
    let data: Array<IResult<IObject>> = (await this.getCollection()).slice()
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

  private async getCollection (): Promise<Array<IResult<IObject>>> {
    /* istanbul ignore next */
    return ((await this.read())?.[this.collectionName]) as Array<IResult<IObject>>
  }

  private async getCollectionKey (id: string): Promise<1 | null> {
    return (await this.getCollectionKeyMap())[id]
  }

  private async getCollectionKeyMap (): Promise<ILowDataKeyMap> {
    /* istanbul ignore next */
    return (((await this.read())?.[this.collectionKey]) as ILowDataKeyMap)
  }

  private async setCollectionKey (id: string): Promise<void> {
    await this.read()
    const data = this.db.data!
    const collectionKeyMap = data[this.collectionKey] as ILowDataKeyMap
    collectionKeyMap[id] = 1
  }

  @metaInfoHelper(IMetaInfoMode.create)
  async insert<T> (value: T, writable = true): Promise<IResult<T>> {
    const id = (value as IResult<T>).id
    const result = await this.getCollectionKey(id)
    if (result) {
      await this.updateById(id, value as IResult<T>)
      return (value as IResult<T>)
    }
    (await this.getCollection()).push(value as IResult<T>)
    await this.setCollectionKey(id)
    if (writable) {
      await this.db.write()
    }
    return (value as IResult<T>)
  }

  @metaInfoHelper(IMetaInfoMode.createMany)
  async insertMany<T> (value: T[]): Promise<Array<IResult<T>>> {
    for (const item of value) {
      await this.insert(item, false)
    }
    await this.db.write()
    return (value as Array<IResult<T>>)
  }

  @metaInfoHelper(IMetaInfoMode.update)
  async updateById (id: string, value: IObject): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await this.getCollectionKey(id)
    if (result) {
      /* istanbul ignore next */
      const item = collection.find(item => item.id === id) ?? {}
      Object.assign(item, value)
      await this.db.write()
      return true
    } else {
      return false
    }
  }

  @metaInfoHelper(IMetaInfoMode.updateMany)
  async updateMany (list: IObject[]): Promise<{ total: number, success: number }> {
    const collection = await this.getCollection()
    let successCount = 0
    for (const item of list) {
      if (item.id) {
        const result = await this.getCollectionKey(item.id)
        if (result) {
          successCount++
          /* istanbul ignore next */
          const target = collection.find(t => t.id === item.id) ?? {}
          Object.assign(target, item)
        }
      }
    }
    await this.db.write()
    return {
      success: successCount,
      total: list.length
    }
  }

  async getById<T> (id: string): Promise<IResult<T> | undefined> {
    return (await this.getCollection()).find(item => item.id === id) as IResult<T>
  }

  async removeById (id: string): Promise<void> {
    const collection = await this.getCollection()
    const collectionKeyMap = await this.getCollectionKeyMap()
    const index = collection.findIndex(item => item.id === id)
    if (index !== -1) {
      collection.splice(index, 1)
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete collectionKeyMap[id]
      await this.db.write()
    }
  }

  async overwrite<T> (value: T[]): Promise<Array<IResult<T>>> {
    await this.read();
    (this.db.data as ILowData)[this.collectionName] = [];
    (this.db.data as ILowData)[this.collectionKey] = {}
    return await this.insertMany<T>(value)
  }
}

export {
  DBStore
}
