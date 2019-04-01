import bcrypt from 'bcryptjs'

const hashPassword = (password) => {

    if(password.length < 8){
        throw new Error('password must be longer than 8')
    }

    // second argument is "salt" => たとえ同じinputでも異なるハッシュ値を生成するために利用される
    // return promise with string value (hash value)
    return bcrypt.hash(password, 10)
}

export { hashPassword as default }