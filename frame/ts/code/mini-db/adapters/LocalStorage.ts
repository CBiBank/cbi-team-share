import { SyncAdapter } from '../mini-db'

// 同步localstorage适配器
export class LocalStorage<T> implements SyncAdapter<T> {
  private key: string

  constructor(key: string) {
    this.key = key
  }
  read(): T | null {
    const value = window.localStorage.getItem(this.key)
    if (value === null) {
      return null
    }
    // 因为JSON.parse签名返回值类型是any，这里需要手动断言到用户传入的类型
    return JSON.parse(value) as T
  }
  write(obj: T): void {
    localStorage.setItem(this.key, JSON.stringify(obj))
  }
}
