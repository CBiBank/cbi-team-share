// class中的extends
class Factory {
  constructor (name = 'yxp') {
    this.name = name
  }
  getName () {
    console.log(this.name)
  }
  static id = 19
  static getId () {
    console.log(this.id)
  }
}

class Person extends Factory {
  constructor (age) {
    super('ljq')
    this.age = age
  }
  getAge () {
    console.log(this.age)
  }
}

var p  = new Person(19)
console.log(p)
