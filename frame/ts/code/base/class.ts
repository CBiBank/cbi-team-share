



class Person {

   public name: string

   public age: number

   private phone: string

   public static desc:string = '人类'

   constructor(name: string, age: number, phone: string) {
        this.name = name
        this.age = age
        this.phone = phone
   }

  public getName (): string {
      return this.name
  }
  getAge (): number {
      return this.age
  }
}


const p2 = new Person('zhangsan', 18, '1388888888')

p2.name
p2.age
