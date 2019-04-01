import { extractFragmentReplacements } from 'prisma-binding'
import Query from './Query'
import Mutation from './Mutation'
import Subscription from './Subscription'
import User from './User'
import Post from './Post'
import Comment from './Comment'

const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Post,
    Comment
}

// 各resolverファイルで定義したfragmentを抽出
const fragmentReplacements = extractFragmentReplacements(resolvers)

export { resolvers, fragmentReplacements }


/**
 * このファイルの目的は、このファイルを src/index.js と src/prisma.js のどちらからもimportできるようにするため。
 * もともと src/index.js に記述されていた内容だが、それをsrc/prisma.jsがimportしようとすると、
 * src/index.jsもsrc/prisma.jsをimportしていたため、importの循環問題が発生してしまう。
 */