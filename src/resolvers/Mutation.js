import bcrypt from 'bcryptjs'  // oneway hasheing algorithm (平文に戻してMatchingはできない)
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'

// // create token
// /**
//  * first argument: payload. object associated with token (何でもいい) publicly readable it'snoe meant to be encrypted
//  * second argument: secret only going live on the Nodejs server (環境変数を使う)
//  */
// const token = jwt.sign({ id: 10 }, 'mybestecret')
// console.log(token);

// // even w/o knowing secret, payload can be read
// const decoded = jwt.decode(token)
// console.log(decoded); // object which consists of payload and timestamp when jwt created

// // verify jwt is actually created by this server
// // verify the jwt is created w/ the secret
// const decoded2 = jwt.verify(token, 'mysecret')
// console.log(decoded2);

// clients are not going to know the secret so it won't be able to ever generate the exact same token


// const dummy = async () => {
//     const email = "hugo@example.com"
//     const password = "red12345"

//     const hashedPassword = "$2a$10$9KyElZeee65AczDRvFtjAOSVZKAqi2aDTHKBSG7vHYPzMJKLt/gfG"

//     const isMatch = await bcrypt.compare(password, hashedPassword)
//     console.log(isMatch)
// }
// dummy()


const Mutation = {

    // Sign In
    async login(parent, args, { prisma }, info) {
        const { email, password } = args.data

        const user = await prisma.query.user({
            where: {
                email
            }
        })
        if (!user) { throw new Error('Unable to login') }
                
        /**
         * bcrypt.hash(plainPassword, 10) => hash完了後にsaltがappendされる
         * bcrypt.compare(plainPassword, hashedPassword) ⇒ plainPasswordをhashした後、hashedPasswordから読み取ったsaltをappendしてからcompare
         */
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) { throw new Error('Unable to login') }

        return {
            user,
            token: generateToken(user.id)
        }
    },

    // Sugn Up
    async createUser(parent, args, { prisma }, info) {
        
        const password = await hashPassword(args.data.password)

        // infoをdelete。理由は以下。
        /**
         * prisma側のcreateUserは返り値がUser!。一方、Client側のGraphQL APIの返り値はAuthPayLoad!
         * infoにはユーザーが指定したフィールドが格納されており、それはAuthPayLoadの型と一致している（userとtoken）
         * しかし、prisma側のcreateUserの返り値に userとtokenは含まれていないのでエラーになる
         * よってinfoはdeleteして、全てのScalar typeを返却させる
         * クライアントにreturnするAuthPayLoadは最後のreturn文でObjectをカスタマイズしてreturnする
         */
        const user = await prisma.mutation.createUser({ 
            data: {
                ...args.data,
                password
            } 
        })

        return {
            user,
            token: generateToken(user.id)
        }

    },

    async deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        return prisma.mutation.deleteUser({
            where: {
                id: userId
            }
        }, info)
    },

    async updateUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password)
        }

        return prisma.mutation.updateUser({
            where: {
                id: userId
            },
            data: args.data
        }, info)
    },
    
    createPost(parent, args, { prisma, request }, info) {
        
        const userId = getUserId(request)

        return prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info)
    },
    
    async deletePost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!postExists) { throw new Error('Unable to delete post') }

        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info)
    },

    async updatePost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })
        const isPublished = await prisma.exists.Post({ id: args.id, published: true })

        if (!postExists) { throw new Error('Unable to update post') }
        
        if(isPublished && args.data.published === false){
            await prisma.mutation.deleteManyComments({
                where: {
                    post: {
                        id: args.id
                    }
                }
            })
        }

        return prisma.mutation.updatePost({
            where: {
                id: args.id
            },
            data: args.data
        }, info)
    },

    async createComment(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.data.post,
            published: true
        })
        if(!postExists) { throw new Error('Post not Found') }


        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: userId
                    }
                },
                post: {
                    connect: {
                        id: args.data.post
                    }
                }
            }
        }, info)
    },

    async deleteComment(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!commentExists) { throw new Error('Unable to delete comment') }

        return prisma.mutation.deleteComment({
            where: {
                id: args.id
            }
        }, info)
    },
    
    async updateComment(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!commentExists) { throw new Error('Unable to update comment') }

        return prisma.mutation.updateComment({
            where: {
                id: args.id
            },
            data: args.data
        }, info)
    }
}

export { Mutation as default }