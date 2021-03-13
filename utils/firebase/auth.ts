import admin from './admin'

export namespace Firebase {
  export async function authenticateToken(token: string): Promise<{ email: string, name: string, user_id: string, iat: number, sign_in_provider: string }> {
    if(admin) {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const {
        iat,
        email,
        name,
        user_id,
        firebase: { sign_in_provider }
      } = decodedToken
      if(!email || !iat) {
        throw new Error('[Firebase] Unknown Error')
      }
      return {
        email,
        name,
        user_id,
        iat,
        sign_in_provider
      }
    } else {
      throw new Error('[Firebase] Init Error')
    }
  }

  export async function verifyToken(token: string): Promise<boolean> {
    if(admin) {
      const decodedToken = await admin.auth().verifyIdToken(token)
      if(decodedToken) {
        return true
      }
      return false
    } else {
      throw new Error('[Firebase] Init Error')
    }
  }
}

