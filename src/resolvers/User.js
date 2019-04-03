import getUserId from '../utils/getUserId'


/**
 * もしGraphQlクエリでユーザーがidを指定しなかったら、parentにidは含まれていないのでバグる
 * そこで、fragmentを使用することでクエリで指定するフィールドのセットを強制する（idを含めるように）
 * たとえクライアントがリクエストしてないとしても
 */


const User = {

    email: {
        
        fragment: 'fragment userId on User { id }',
        
        resolve(parent, args, { request }, info) {
        
            const userId = getUserId(request, false)
    
            if(userId && userId === parent.id) {
                return parent.email
            } else {
                return null
            }
    
        }
    }
}

export { User as default }