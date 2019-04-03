import ApolloBoost from 'apollo-boost'

const getClient = (jwt) => {
    // globalSetup.jsで指定したportを使用する
    return new ApolloBoost({
        uri: 'http://localhost:4000',
        request(operation) {
            if(jwt){
                operation.setContext({
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                })
            }
        }
    })
}

export { getClient as default }