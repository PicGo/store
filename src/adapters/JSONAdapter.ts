import { TextFileSync } from '@commonify/lowdb'
import json from 'comment-json'
import { IJSON } from 'src/types'
import writeFile from 'write-file-atomic'
export class JSONAdapter {
  private readonly adapter: TextFileSync
  private readonly dbPath: string
  constructor (dbPath: string) {
    this.dbPath = dbPath
    this.adapter = new TextFileSync(dbPath)
  }

  read (): IJSON {
    const data = this.adapter.read()
    /* istanbul ignore if */
    if (data === null) {
      return {}
    } else {
      try {
        // comment-json will break in some cases
        return json.parse(data || '{}')
      } catch (e) {
        try {
          return JSON.parse(data || '{}')
        } catch (e) {
          return {}
        }
      }
    }
  }

  write (obj: any): void {
    writeFile.sync(this.dbPath, json.stringify(obj, null, 2))
  }
}
