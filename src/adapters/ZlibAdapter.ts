/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import fs from 'fs'
import { promisify } from 'node:util'
import { gunzip, gzip, strFromU8 } from 'fflate'
import writeFile from 'write-file-atomic'

const readFile = promisify(fs.readFile)

class ZlibAdapter {
  private readonly dbPath: string
  private readonly collectionName: string
  public errorList: Array<Error | string>
  public readCount = 0
  constructor (dbPath: string, collectionName: string, errorList: Array<Error | string>) {
    this.dbPath = dbPath
    this.collectionName = collectionName
    this.errorList = errorList
  }

  async read (): Promise<any> {
    this.readCount++
    const defaultData = {
      [this.collectionName]: [],
      [`__${this.collectionName}_KEY__`]: {}
    }
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(this.dbPath)) {
        const buffer = (await readFile(this.dbPath))
        gunzip(buffer as unknown as Uint8Array, (err, data) => {
          if (err) {
            console.error(err)
            this.errorList.push(err)
            return resolve(defaultData)
          }
          const str = strFromU8(data)
          try {
            const data = JSON.parse(str)
            return resolve(data)
          } catch (e: any) {
            /* istanbul ignore next */
            console.error(e)
            /* istanbul ignore next */
            this.errorList.push(e)
            /* istanbul ignore next */
            return resolve(defaultData)
          }
        })
      } else {
        const data = Buffer.from(JSON.stringify(defaultData))
        gzip(data as unknown as Uint8Array, async (err, result): Promise<void> => {
          /* istanbul ignore next */
          if (err) return reject(err)
          await writeFile(this.dbPath, Buffer.from(result))
          resolve(defaultData)
        })
      }
    })
  }

  async write (data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      data = Buffer.from(JSON.stringify(data))
      gzip(data, async (err, result): Promise<void> => {
        /* istanbul ignore next */
        if (err) return reject(err)
        await writeFile(this.dbPath, Buffer.from(result))
        resolve()
      })
    })
  }
}

export {
  ZlibAdapter
}
