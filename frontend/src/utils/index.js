import axios from "axios"
import { useStore } from '../stores'
import { storeToRefs } from 'pinia'
import { sha256 } from 'js-sha256'

const api = async (methods, url, data = null) => {
    return new Promise((resolve, reject) => {
        const store = useStore()
        const { token, settings } = storeToRefs(store)
        if (!data) {
            data = {
                lang: settings.value.lang
            }
        }
        if (!data.lang) {
            data['lang'] = settings.value.lang
        }
        axios({
            method: methods,
            url: url,
            data: data,
            headers: {
                authorization: token.value
            },
            timeout: 50000,
        }).then((res) => {
            if (res.status !== 200) {
                console.error(res)
                return reject({
                    code: res.status
                })
            }
            if (res.data.code < 0) {
                console.error(res.data.msg)
                return reject(res.data)
            }
            return resolve(res.data)
        }).catch((err) => {
            return reject(err)
        })
    })
}

const updateUserData = async (token) => {
    const store = useStore()
    store.updateToken(token)
    let userData = await api('POST', '/api/user/validate').catch((err) => {
        return err
    })
    store.updateUserData(userData.data.payload)
    return
}

const login = async (username, password) => {
    let result = await api('POST', '/api/user/login', {
        username: username,
        password: sha256(`${username}${sha256(password)}`)
    }).catch((err) => {
        return err
    })
    if (result.code < 0) {
        return result
    }
    let err = await updateUserData(result.data)
    if (err) return err
    return result
}

const refresh = async () => {
    let result = await api('POST', '/api/user/refresh').catch((err) => {
        return err
    })
    if (result.code < 0) {
        return result
    }
    let err = await updateUserData(result.data)
    if (err) return err
    return result
}

const logout = () => {
    const store = useStore()
    store.updateToken(null)
    store.updateUserData(null)
}

const loginState = async () => {
    let result = await api('POST', '/api/user/validate').catch(() => {
        return {
            logined: false
        }
    })
    if (result.code < 0) {
        return {
            logined: false
        }
    }
    return result.data
}

export {
    api,
    login,
    logout,
    refresh,
    loginState
}