import { TextFileSync } from '@commonify/lowdb'
import json from 'comment-json'
import { IJSON } from 'src/types'
// import writeFile from 'write-file-atomic'
export class JSONAdapter {
  private readonly adapter: TextFileSync
  constructor (dbName: string) {
    this.adapter = new TextFileSync(dbName)
  }

  read (): IJSON {
    const data = this.adapter.read()
    if (data === null) {
      return {}
    } else {
      return json.parse(data)
    }
  }

  write (obj: any): void {
    this.adapter.write(json.stringify(obj))
  }
}
