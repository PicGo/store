export enum IDBStatus {
  inited = 'inited',
  loaded = 'loaded',
  started = 'started',
  stopped = 'stopped'
}

export interface IObject {
  id?: string
  [propName: string]: any
}

export type IInsertData = IObject[] | [string, IObject] | [IObject[]]

export enum IMetaInfoMode {
  create,
  update
}

export type IResult<T> = T & {
  id: string
  createdAt: number
  updatedAt: number
}
