import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../src/prisma'

const userOne = {
    input: {
        name: 'Jen',
        email: 'jen@example.com',
        password: bcrypt.hashSync('Red09ljk8765')
    },
    user: undefined,
    jwt: undefined
}

const userTwo = {
    input: {
        name: 'Ruby',
        email: 'ruby@example.com',
        password: bcrypt.hashSync('Ruby12345')
    },
    user: undefined,
    jwt: undefined
}

// Execute before each test case
const seedDatabase = async () => {   
    // Deal with slow internet
    jest.setTimeout(1000000)  
    
    // Delete test data
    await prisma.mutation.deleteManyUsers()     

    // Create User 1
    userOne.user = await prisma.mutation.createUser({          
        data: userOne.input
    })
    // Create JWT 
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

    // Create User 2
    userTwo.user = await prisma.mutation.createUser({          
        data: userTwo.input
    })
    // Create JWT
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)



}

export { seedDatabase as default, userOne, userTwo }