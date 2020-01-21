import { DBStore } from '../DBStore'
import path from 'path'
import fs from 'graceful-fs'
// import zlib from 'zlib'
const DBName = 'test.db'

afterAll(() => {
  fs.unlinkSync(path.join(__dirname, DBName))
}, 1000)

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

it('It should add a new item in db', async () => {
  const db = new DBStore(path.join(__dirname, DBName), 'uploaded')
  const resultValue = await db.insert({
    id: 'test-id',
    test: 1
  })
  expect(resultValue.id).toBe('test-id')
  expect(resultValue.createdAt).toBeDefined()
  expect(resultValue.updatedAt).toBeDefined()
})

it('It should remove a item in db', async () => {
  const db = new DBStore(path.join(__dirname, 'test.db'), 'uploaded')
  await db.removeById('test-id')
  const resultValue = await db.getById('test-id')
  expect(resultValue).toBeUndefined()
})

it('It should insertMany item in db', async () => {
  const db = new DBStore(path.join(__dirname, 'test.db'), 'uploaded')
  const resultValue = await db.insertMany([{
    id: 'test-id-1',
    test: 1
  }, {
    id: 'test-id-2',
    test: 2
  }])
  expect(resultValue.length).toBe(2)
  expect(resultValue[0].id).toBe('test-id-1')
  expect(resultValue[1].test).toBe(2)
  expect(resultValue[0].createdAt).toBeDefined()
  expect(resultValue[1].updatedAt).toBeDefined()
})

it('It should add a item with id', async () => {
  const db = new DBStore(path.join(__dirname, 'test.db'), 'uploaded')
  await db.insert({
    test: 123,
    createdAt: Date.now()
  })
  const list = await db.get()
  const item = list[list.length - 1]
  expect(item.id).toBeDefined()
  expect(item.createdAt).toBeDefined()
})

it('It should update a item by id', async () => {
  const db = new DBStore(path.join(__dirname, 'test.db'), 'uploaded')
  await db.updateById('test-id-1', {
    test: 2
  })
  const resultValue = await db.getById('test-id-1')
  expect(resultValue.test).toBe(2)
})

it('It should return false when update a non-exists item', async () => {
  const db = new DBStore(path.join(__dirname, 'test.db'), 'uploaded')
  const result = await db.updateById('test-id-4', {
    test: 3
  })
  expect(result).toBe(false)
})
