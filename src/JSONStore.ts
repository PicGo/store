import Lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
class JSONStore {
  private readonly db: Lowdb.LowdbSync<Lowdb.AdapterSync>
  constructor (dbPath: string) {
    const adapter = new FileSync(dbPath)
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

  insert (key: string, value: any): void {
    // @ts-ignore
    return this.read().get(key).insert(value).write()
  }

  unset (key: string, value: any): boolean {
    return this.read().get(key).unset(value).value()
  }
}

export {
  JSONStore
}
