import { IInsertData, IMetaInfoMode, IObject } from '../types'

function metaInfoHelper (mode: IMetaInfoMode) {
  return function (_target: any, _propertyKey: any, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    descriptor.value = async function (...args: IInsertData) {
      let multipleArgs = false
      if (mode === IMetaInfoMode.create) {
        if (Array.isArray(args[0])) {
          args = args[0]
          multipleArgs = true
        }
        args = (args as IObject[]).map(item => metaInfoGenerator(item))
        if (multipleArgs) {
          args = [args]
        }
      } else {
        metaInfoUpdater((args as [string, IObject])[1])
      }
      const result = await method.call(this, ...args)
      return result
    }
  }
}

// https://gist.github.com/LeverOne/1308368
function uuid (a: any = '', b: any = ''): string { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');return b }

function metaInfoGenerator (value: IObject): IObject {
  if (!value.id) {
    value.id = uuid()
  }
  if (!value.createdAt) {
    value.createdAt = Date.now()
    value.updatedAt = Date.now()
  }
  return value
}

function metaInfoUpdater (value: IObject): IObject {
  value.updatedAt = Date.now()
  return value
}

export {
  metaInfoHelper
}
