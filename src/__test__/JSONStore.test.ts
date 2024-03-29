import { JSONStore } from '../JSONStore'
import path from 'path'
import fs from 'graceful-fs'
// import zlib from 'zlib'
const DBName = 'test.json'

afterAll(() => {
  if (fs.existsSync(path.join(__dirname, DBName))) {
    fs.unlinkSync(path.join(__dirname, DBName))
  }
}, 1000)

it('It should throw an error without dbPath', () => {
  expect.assertions(1)
  try {
    const db = new JSONStore('')
    console.log(db)
  } catch (e) {
    expect(e).toEqual(Error('Please provide valid dbPath'))
  }
})

it('It should set config correctly', () => {
  const db = new JSONStore(path.join(__dirname, DBName))
  db.set('test1', {
    test1: true,
    test2: [],
    test3: {}
  })
  const item = db.get('test1')
  expect(item.test1).toBe(true)
})

it('It should read config correctly', () => {
  const db = new JSONStore(path.join(__dirname, 'broken.json'))
  expect(db.read(true)).toEqual({})
})

it('It should has correct key & value', () => {
  const db = new JSONStore(path.join(__dirname, DBName))
  const result = db.has('test1.test3')
  expect(result).toBe(true)
})

it('It should get correct key & value', () => {
  const db = new JSONStore(path.join(__dirname, DBName))
  const result = db.get()
  expect(result).toBeUndefined()
})

it('It should unset correctly', () => {
  const db = new JSONStore(path.join(__dirname, DBName))
  db.unset('test1', 'test3')
  const res = db.get('test1')
  expect(res.test3).toBeUndefined()
})

it('It should flush correctly', () => {
  const db = new JSONStore(path.join(__dirname, DBName))
  db.set('test', 1)
  // expect(res.test3).toBeUndefined()
  db.read(true)
  expect(db.get('test')).toBe(1)
})

it('It should return {} if the db is broken', () => {
  const db = new JSONStore(path.join(__dirname, 'broken.json'))
  expect(db.read(true)).toEqual({})
})

it('It should return {} if the db is broken with null', () => {
  const db = new JSONStore(path.join(__dirname, 'broken-null.json'))
  expect(db.read(true)).toEqual({})
})

it('It should return {} if the db is empty', () => {
  const db = new JSONStore(path.join(__dirname, 'broken-empty.json'))
  expect(db.read(true)).toEqual({})
})
