interface Person extends Animal {
    name: string,
    age: number,
    sex: 0 | 1,
    hobby?: string,

}

interface Animal {
    lifeTime: number
}

type MyPerson = Person


const p1: Person = {
    name: 'zhangsan',
    lifeTime: 100,
    age: 18,
    sex: 0
}

// 比如我们只用到了姓名和性别, 可采用以下工具类型进行推导

type Person2 = Pick<Person, 'sex'| 'name'>

const person2: Person2 = {
    name: 'bob',
    sex: 1
}

type Person3 = Omit<Person, 'age'>

const person3: Person3 = {
    name: 'bob',
    sex: 1
}



interface Get<T = string> {
    (a: T):T
}

const a:Get = function (a) {
    return a
}

console.log(1)
