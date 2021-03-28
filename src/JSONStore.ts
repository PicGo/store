import Lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import json from 'comment-json'
class JSONStore {
  private readonly db: Lowdb.LowdbSync<Lowdb.AdapterSync>
  constructor (dbPath: string) {
    if (!dbPath) {
      throw Error('Please provide valid dbPath')
    }
    const adapter = new FileSync(dbPath, {
      serialize (obj: any): string {
        return json.stringify(obj, null, 2)
      },
      deserialize: json.parse
    })
    this.db = Lowdb(adapter)
  }

  read (): Lowdb.LowdbSync<Lowdb.AdapterSync<any>> {
    return this.db.read()
  }

  get (key = ''): any {
    return this.read().get(key).value()
  }

  set (key: string, value: any): void {
    return this.read().set(key, value).write()
  }

  has (key: string): boolean {
    return this.read().has(key).value()
  }

  unset (key: string, value: any): boolean {
    return this.read().get(key).unset(value).write()
  }
}

export {
  JSONStore
}
