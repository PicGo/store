export enum IDBStatus {
  inited = 'inited',
  loaded = 'loaded',
  started = 'started',
  stopped = 'stopped'
}

export interface IFilter {
  orderBy?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface IGetResult<T> {
  total: number
  data: Array<IResult<T>>
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
