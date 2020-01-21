# PicGo/store

For PicGo projects to write & read data or configuration in disk.

[![Coverage Status](https://coveralls.io/repos/github/PicGo/store/badge.svg?branch=master)](https://coveralls.io/github/PicGo/store?branch=master) [![PicGo Convention](https://img.shields.io/badge/picgo-convention-blue.svg?style=flat-square)](https://github.com/PicGo/bump-version)

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
const db = new DBStore(dbPath: string, collectionName: string)
```

#### Get `.get()`

- return: `Promise<IObject[]>`
- interface: [IObject](/src/types/index.ts)

To get the whole collection value.

```js
async () => {
  const collection = await db.get()
  console.log(collection) // []
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

#### `.removeById(id: string)`: Promise<void>;

- return: `Promise<void>`

To remove an item by id.

```js
async () => {
  const result = await db.removeById('xxx')
  console.log(result) // undefined
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020 Molunerfinn