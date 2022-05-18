


interface Add {
    (a: number, b: number):number
}
interface StringAdd<T = string> {
    (a: T, b: T):T
}

function add (a: number, b: number): number {
    return  a + b
}

const add2: Add = (a, b) => a+b

const add3: StringAdd = (a, b) => a+b

interface Result {
    code: number,
    msg: string
}

const getInfo: Promise<Result> = new Promise((resolve, reject)=> {
    resolve({code: 200, msg: 'ok'})
})


getInfo.then(res => {
    res.msg
})