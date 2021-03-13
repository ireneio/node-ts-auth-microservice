import * as admin from 'firebase-admin'
import credential from './credentials.json'

async function init() {
  try {
    console.log('[Firebase] Credential:', credential)
    const initResult = admin.initializeApp(credential)
    if(admin) {
      admin.auth()
      console.log('[Firebase] Init Success')
      return Promise.resolve(initResult)
    } else {
      throw new Error('init failed')
    }
  } catch(e) {
    console.log('[Firebase] Error: Init ' + e.message)
    Promise.reject()
  }
}

export default await init()
