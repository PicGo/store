# PicGo/store

For PicGo projects to write & read data or configuration in disk.

[![Coverage Status](https://coveralls.io/repos/github/PicGo/store/badge.svg?branch=refs/heads/master)](https://coveralls.io/github/PicGo/store?branch=refs/heads/master) [![PicGo Convention](https://img.shields.io/badge/picgo-convention-blue.svg?style=flat-square)](https://github.com/PicGo/bump-version)

## Usage

```js
import { DBStore } from '@picgo/store'

const db = new DBStore('path/to/your/xxx.db', 'collectionName')

const main = async () => {
  const result = await db.insert({
    imgUrl: 'xxxx.jpg',
  })
  console.log(result)
  // {
  //   id: 'xxxxx',
  //   imgUrl: 'xxx.jpg',
  //   createdAt: 123123123123,
  //   updatedAt: 123123123123
  // }
}
```

## API Reference

For now, `@picgo/store` has two export member: `DBStore` & `JSONStore`.

### DBStore

- `new DBStore(dbPath: string, collectionName: string)`

```js
const db = new DBStore('picgo.db', 'uploadImgs')
```

#### Get `.get(filter?: IFilter)`

- return: `Promise<IGetResult<IObject>[]>`
- interface: [IGetResult](/src/types/index.ts)

To get the whole collection value.

```js
async () => {
  const collection = await db.get()
  console.log(collection) // { total: x, data: [{...}, {...}, ...] }
}
```

To get filtered collection: (just like SQL `orderBy`, `limit` & `offset`)

```js
async () => {
  const collection = await db.get({
    orderBy: 'desc', // ['desc' | 'asc'] -> order with created-time
    limit: 1, // limit >= 1
    offset: 0, // offset >= 0
  })
  console.log(collection) // { total: 1, data: [{...}] }
}
```

#### Insert `.insert<T>(value: T)`

- return: `Promise<IResult<T>>`
- interface: [IResult](/src/types/index.ts)

To insert an item to collection.

```js
async () => {
  const result = await db.insert({
    imgUrl: 'https://xxxx.jpg'
  })
  console.log(result)
  // {
  //   id: string,
  //   imgUrl: string,
  //   createdAt: number,
  //   updatedAt: number 
  // }
}
```

#### InsertMany `.insertMany<T>(value: T[])`

- return: `Promise<IResult<T>[]>`
- interface: [IResult](/src/types/index.ts)

To insert multiple items to collection at once .

```js
async () => {
  const result = await db.insertMany([
    {
      imgUrl: 'https://xxxx.jpg'
    },
    {
      imgUrl: 'https://yyyy.jpg'
    }
  ])
  console.log(result)
  // [{
  //   id: string,
  //   imgUrl: string,
  //   createdAt: number,
  //   updatedAt: number 
  // },{
  //   id: string,
  //   imgUrl: string,
  //   createdAt: number,
  //   updatedAt: number 
  // }]
}
```

#### UpdateById `.updateById(id: string, value: IObject)`

- return: `Promise<boolean>`
- interface: [IObject](/src/types/index.ts)

To update an item by id. It will return `false` if the id does not exist.

```js
async () => {
  const result = await db.updateById('test-id', {
    test: 123
  })
  console.log(result) // true
}
```


#### GetById `.getById(id: string)`

- return: `Promise<IObject | undefined>`
- interface: [IObject](/src/types/index.ts)

To get an item by id.

```js
async () => {
  const result = await db.getById('xxx')
  console.log(result) // undefined
}
```

#### RemoveById `.removeById(id: string)`;

- return: `Promise<void>`

To remove an item by id.

```js
async () => {
  const result = await db.removeById('xxx')
  console.log(result) // undefined
}
```

#### Overwrite `.overwrite<T>(value: T[])` (v2.0.0)

- return: `Promise<IResult<T>[]>`
- interface: [IResult](/src/types/index.ts)

To overwrite whole collection:

```js
async () => {
  const result = await db.overwrite([
    {
      imgUrl: 'https://xxxx.jpg'
    },
    {
      imgUrl: 'https://yyyy.jpg'
    }
  ])
  console.log(result)
  // [{
  //   id: string,
  //   imgUrl: string,
  //   createdAt: number,
  //   updatedAt: number 
  // },{
  //   id: string,
  //   imgUrl: string,
  //   createdAt: number,
  //   updatedAt: number 
  // }]
}
```

#### UpdateMany `.updateMany(list: IObject[])` (v2.1.0)

- return: `Promise<{ total: number, success: number }>`
- interface: [IObject](/src/types/index.ts)

To update many items by id:

```js
async () => {
  const result = await db.updateMany([
    {
      id: 'xxx', // need to have id
      imgUrl: 'https://xxxx.jpg'
    },
    {
      id: 'yyy',
      imgUrl: 'https://yyyy.jpg'
    },
    {
      imgUrl: 'https://zzzz.jpg'
    }
  ])
  console.log(result)
  // { total: 3, success: 2 }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020 Molunerfinn