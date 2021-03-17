import * as admin from 'firebase-admin'
import credential from './credentials.json'

const config = {
  type: credential.type,
  projectId: credential.project_id,
  privateKeyId: credential.private_key_id,
  privateKey: credential.private_key,
  clientEmail: credential.client_email,
  clientId: credential.client_id,
  authUri: credential.auth_uri,
  tokenUri: credential.token_uri,
  authProviderX509CertUrl: credential.auth_provider_x509_cert_url,
  clientC509CertUrl: credential.client_x509_cert_url,
}

async function init(): Promise<admin.app.App | undefined> {
  try {
    console.log('[Firebase] Credential:', config)
    const initResult = await admin.initializeApp(config)
    if(admin) {
      await admin.auth()
      console.log('[Firebase] Init Success')
      return initResult
    } else {
      throw new Error('init failed')
    }
  } catch(e) {
    console.log('[Firebase] Error: Init ' + e.message)
    Promise.reject(new Error(e.message))
  }
}

export default await init()
