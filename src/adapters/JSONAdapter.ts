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
      return json.parse(data || '{}')
    }
  }

  write (obj: any): void {
    writeFile.sync(this.dbPath, Buffer.from(json.stringify(obj, null, 2)))
  }
}
