/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import fs from 'graceful-fs'
import { promisify } from 'util'
import zlib from 'zlib'

const writeFile = promisify(fs.writeFile)

class ZlibAdapter {
  private readonly dbPath: string
  private readonly collectionName: string
  // @ts-ignore
  constructor (dbPath: string, collectionName: string) {
    this.dbPath = dbPath
    this.collectionName = collectionName
  }

  async read (): Promise<any> {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(this.dbPath)) {
      // const data = (await readFile(this.dbPath)) || `{"${this.collectionName}": []}`
        const gunzip = zlib.createGunzip()
        let buffer: string = ''
        fs.createReadStream(this.dbPath)
          .pipe(gunzip)
        gunzip.on('data', (data: Buffer) => {
          buffer += data.toString()
        }).on('end', () => {
          resolve(JSON.parse(buffer))
        })
      } else {
        const data = JSON.stringify({
          [this.collectionName]: [],
          [`__${this.collectionName}_KEY__`]: {}
        })
        zlib.gzip(data, async (err, result): Promise<void> => {
          /* istanbul ignore next */
          if (err) return reject(err)
          await writeFile(this.dbPath, result)
          resolve({
            [this.collectionName]: [],
            [`__${this.collectionName}_KEY__`]: {}
          })
        })
      }
    })
  }

  async write (data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      data = JSON.stringify(data)
      zlib.gzip(data, async (err, result): Promise<void> => {
        /* istanbul ignore next */
        if (err) return reject(err)
        await writeFile(this.dbPath, result)
        resolve()
      })
    })
  }
}

export {
  ZlibAdapter
}
