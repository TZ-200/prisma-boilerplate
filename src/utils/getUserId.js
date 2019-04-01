import jwt from 'jsonwebtoken'


/**
 * requireAuth = false Authしてない場合にでエラーを投げない
 */
const getUserId = (request, requireAuth = true) => {
    
    const header = request.request 
    ? request.request.headers.authorization         // query / mutation
    : request.connection.context.Authorization      // subscription

    if(header){ 
        const token = header.replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded.userId
    }
    
    if (requireAuth) {
        throw new Error('Authentication required') 
    }
    
    return null

}

export { getUserId as default }