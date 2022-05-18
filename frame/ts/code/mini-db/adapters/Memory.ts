import { Adapter } from "../mini-db"
// 异步内存存储适配器
export class Memory<T> implements Adapter<T> {
    private data: T | null = null
  
    read(): Promise<T | null> {
      return Promise.resolve(this.data)
    }
  
    write(obj: T): Promise<void> {
      this.data = obj
      return Promise.resolve()
    }
  }