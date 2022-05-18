
// 声明异步适配器接口
export interface Adapter<T> {
    read: () => Promise<T | null>
    write: (data: T) => Promise<void>
}

export interface SyncAdapter<T> {
  read: () => T | null
  write: (data: T) => void
}

export class MiniDB<T = unknown> {
  adapter: Adapter<T>
  data: T | null = null

  constructor(adapter: Adapter<T>) {
    if (adapter) {
      this.adapter = adapter
    } else {
      throw new Error('缺少适配器，mini-db无法工作')
    }
  }

  async read(): Promise<void> {
    this.data = await this.adapter.read()
  }

  async write(): Promise<void> {
    if (this.data) {
      await this.adapter.write(this.data)
    }
  }
}