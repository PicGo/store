import { DBStore } from '../DBStore'
import path from 'path'
import fs from 'fs'
const DBName = 'test.db'

const testDir = path.resolve(process.cwd(), 'src/__test__')

const sleep = async (timeout = 500): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

afterAll(() => {
  if (fs.existsSync(path.join(testDir, DBName))) {
    fs.unlinkSync(path.join(testDir, DBName))
  }
}, 1000)

describe('write group', () => {
  it('It should throw an error without dbPath', () => {
    expect.assertions(1)
    try {
      const db = new DBStore('', 'uploaded')
      console.log(db)
    } catch (e) {
      expect(e).toEqual(Error('Please provide valid dbPath or collectionName'))
    }
  })

  it('It should throw an error without collectionName', () => {
    expect.assertions(1)
    try {
      const db = new DBStore(DBName, '')
      console.log(db)
    } catch (e) {
      expect(e).toEqual(Error('Please provide valid dbPath or collectionName'))
    }
  })

  it('It should read only once with multiple get', async () => {
    const db = new DBStore(path.join(testDir, DBName), 'uploaded')
    await db.get()
    await db.get()
    await db.get()
    const adapter = db.getAdapter()
    expect(adapter.readCount).toBe(1)
  })

  it('It should add a new item in db', async () => {
    const db = new DBStore(path.join(testDir, DBName), 'uploaded')
    const resultValue = await db.insert({
      id: 'test-id',
      test: 1
    })
    expect(resultValue.id).toBe('test-id')
    expect(resultValue.createdAt).toBeDefined()
    expect(resultValue.updatedAt).toBeDefined()
  })

  it('It should remove a item in db', async () => {
    await sleep(1000)
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const reading = await db.read() ?? {}
    // @ts-expect-error
    let res = reading.__uploaded_KEY__['test-id']
    expect(res).toBe(1)
    await db.removeById('test-id')
    const resultValue = await db.getById('test-id')
    expect(resultValue).toBeUndefined()
    await db.removeById('test-id')
    // @ts-expect-error
    res = reading.__uploaded_KEY__['test-id']
    expect(res).toBe(undefined)
  })

  it('It should insertMany item in db', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const resultValue = await db.insertMany([{
      id: 'test-id-1',
      test: 1
    }, {
      id: 'test-id-2',
      test: 2
    }])
    expect(resultValue.length).toBe(2)
    expect(resultValue[0].id).toBe('test-id-1')
    expect(resultValue[0].test).toBe(1)
    expect(resultValue[1].test).toBe(2)
    expect(resultValue[0].createdAt).toBeDefined()
    expect(resultValue[1].updatedAt).toBeDefined()
  })

  it('It should add a item with id', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    await db.insert({
      test: 123,
      createdAt: Date.now()
    })
    const { data: list } = await db.get()
    const item = list[list.length - 1]
    expect(item.id).toBeDefined()
    expect(item.createdAt).toBeDefined()
  })
})

describe('update group', () => {
  it('It should update a item by id', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    await db.updateById('test-id-1', {
      test: 2
    })
    const resultValue = await db.getById<{test: number}>('test-id-1')
    expect(resultValue?.test).toBe(2)
  })

  it('It should return false when update a non-exists item', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const result = await db.updateById('test-id-4', {
      test: 3
    })
    expect(result).toBe(false)
  })

  it('It should return undefined when get a non-exists item', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const result = await db.getById('xxx')
    expect(result).toBeUndefined()
  })

  it('It should update when insert same the same id', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    await db.insert<{
      id?: string
      a: number
    }>({
      id: '123',
      a: 1
    })
    const data1 = await db.get()
    // Insert the same id should be updated
    const res = await db.insert<{
      id?: string
      a: number
    }>({
      id: '123',
      a: 2
    })
    expect(res.a).toBe(2)
    const data2 = await db.get()
    expect(data1.total).toBe(data2.total)
  })

  it('It should overwrite all data', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    await db.overwrite([
      {
        id: 'test1',
        a: 'test1'
      },
      {
        id: 'test2',
        a: 'test2'
      },
      {
        id: 'test3',
        a: 'test3'
      }
    ])
    const data = await db.get()
    expect(data.data[0].id).toBe('test1')
    expect(data.data[2].id).toBe('test3')
    expect(data.total).toBe(3)
  })
})

describe('filter test', () => {
  it('It should reverse when orderBy desc', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const data1 = await db.get({
      orderBy: 'asc'
    })
    const data2 = await db.get({
      orderBy: 'desc'
    })
    expect(data1.data.reverse()).toEqual(data2.data)
  })
  it('It should filter failed when the offset < 0 or limit < 0', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const data1 = await db.get({
      offset: -1
    })
    const data2 = await db.get()
    const data3 = await db.get({
      limit: -1
    })
    expect(data1.data.length).toBe(data2.data.length)
    expect(data1.data.length).toBe(data3.data.length)
  })

  it('It should filter success when offset >= 0', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const data1 = await db.get()
    const data2 = await db.get({
      offset: 1
    })
    expect(data1.data[1]).toEqual(data2.data[0])
  })

  it('It should filter success when limit > 0', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    const data1 = await db.get()
    const data2 = await db.get({
      limit: 1
    })
    expect(data1.data[0]).toEqual(data2.data[0])
    expect(data2.data.length).toBe(1)
  })
})

describe('test some db case', () => {
  it('It should open testdb.db', async () => {
    const db = new DBStore(path.join(testDir, 'testdb.db'), 'gallery')
    const data = await db.get()
    expect(data.data.length).toBe(57)
  })
  it('It should not open broken.db', async () => {
    const db = new DBStore(path.join(testDir, 'broken.db'), 'gallery')
    const data = await db.get()
    await sleep()
    expect(db.errorList.length).toBe(1)
    expect(data.data.length).toBe(0)
  })
})

describe('test update many', () => {
  it('It should update many', async () => {
    const db = new DBStore(path.join(testDir, 'test.db'), 'uploaded')
    await db.overwrite([
      {
        id: 'test1',
        a: 'test1'
      },
      {
        id: 'test2',
        a: 'test2'
      },
      {
        id: 'test3',
        a: 'test3'
      }
    ])
    const updateRes = await db.updateMany([{
      id: 'test1',
      a: 'test1-1'
    }, {
      id: 'test2',
      a: 'test2-1'
    }, {
      a: 'test4-1'
    }, {
      id: 'test4'
    }])
    const data = await db.get()
    expect(data.data[0].a).toBe('test1-1')
    expect(data.data[1].a).toBe('test2-1')
    expect(updateRes.success).toBe(2)
    expect(updateRes.total).toBe(4)
  })
})
