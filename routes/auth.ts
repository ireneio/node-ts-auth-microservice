import express, { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import createJWT, { decodeJWT } from '../utils/jwt'
import HttpResponse from '../utils/http'
import { createUser, getAndVerifyUser, getUser } from '../db/controllers/user'
import { SqlSchema } from '~/types/sql'
import { BCRYPT_SALT_ROUNDS } from '../db/utils/constants'
import { Firebase } from '../utils/firebase/auth'

const router: Router = express.Router()

/* POST Login */
router.post('/login', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const { email, password }: { email: string, password: string } = req.body

    const verifyCredentialsResult: false | SqlSchema.UserInput[] = await getAndVerifyUser(email, password)

    if(verifyCredentialsResult === false) {
      throw new Error('credentials error')
    } else {
      res.send(new HttpResponse(200, 'success', { t: verifyCredentialsResult[0].access_token }))
    }
  } catch(e) {
    res.send(new HttpResponse(400, e.message))
  }
})

/* POST Verify */
router.post('/verify', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    if(req.headers.authorization) {
      const splitStr = req.headers.authorization.split(' ')
      if(splitStr.length === 2 && splitStr[0] === 'Bearer') {
        const token = splitStr[1]
        // decrypt token and verify
        if(token) {
          const verifyTokenResult: boolean = decodeJWT(token, 'qapi')
          if(verifyTokenResult === true) {
            res.send(new HttpResponse(200, 'success', { t: token }))
          } else {
            throw new Error('Unauthorized')
          }
        }
      }
    } else {
      throw new Error('Unauthorized')
    }
  } catch(e) {
    console.log(e.message)
    res.send(new HttpResponse(403, e.message))
  }
})

/* POST Register */
router.post('/', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const { email, password, accessLevel }: { email: string, password: string, accessLevel: string } = req.body

    if(!email.includes('@') || email.indexOf('@') === email.length - 1 || email.indexOf('@') === 0) throw new Error('email format error')

    // check if user exists
    const checkIfUserExists: false | SqlSchema.UserInput[] = await getUser(email)
    if(checkIfUserExists !== false) {
      throw new Error('email already exists')
    }

    // create tokens
    const identifier = 'qapi-refresh' + email
    const refreshToken = await createJWT(identifier)
    const accessToken = await createJWT('qapi', identifier)

    // create tokens success, store in DB
    if(refreshToken && accessToken) {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
      const rows = await createUser(email, hashedPassword, accessToken, refreshToken, 'local', accessLevel)
      if(rows) {
        res.send(new HttpResponse(201, 'success', rows))
      } else {
        throw new Error('internal server error')
      }
    } else {
      throw new Error('internal server error')
    }
  } catch(e) {
    console.log(e.message)
    let code: number = 500
    switch (e.message) {
      case 'internal server error':
        code = 500
        break
      case 'email already exists':
        code = 400
        break
    }
    res.send(new HttpResponse(code, e.message))
  }
})

/* POST Login via Firebase */
router.post('/firebase/login', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const { token }: { token: string } = req.body

    const authenticateTokenResult: { email: string, name: string, user_id: string, iat: number, sign_in_provider: string } = await Firebase.authenticateToken(token)

    const getUserResult: false | SqlSchema.UserInput[] = await getUser(authenticateTokenResult.email)

    if(getUserResult === false) {
      throw new Error('credentials error')
    } else {
      res.send(new HttpResponse(200, 'success', { t: token }))
    }
  } catch(e) {
    res.send(new HttpResponse(400, e.message))
  }
})

/* POST Verify via Firebase */
router.post('/firebase/verify', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    if(req.headers.authorization) {
      const splitStr = req.headers.authorization.split(' ')
      if(splitStr.length === 2 && splitStr[0] === 'Bearer') {
        const token = splitStr[1]
        if(token) {
          const verifyResult = await Firebase.verifyToken(token)
          if(verifyResult === true) {
            res.send(new HttpResponse(200, 'success'))
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else {
        throw new Error('Credential Error')
      }
    } else {
      throw new Error('Unauthorized')
    }
  } catch(e) {
    res.send(new HttpResponse(e.message === 'Credential Error' ? 400 : 403, e.message))
  }
})

/* POST Register via Firebase */
router.post('/firebase', async function(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const { token }: { token: string } = req.body

    const authenticateTokenResult: { email: string, name: string, user_id: string, iat: number, sign_in_provider: string } = await Firebase.authenticateToken(token)

    // check if user exists
    const getUserResult: false | SqlSchema.UserInput[] = await getUser(authenticateTokenResult.email)
    if(getUserResult) {
      res.send(new HttpResponse(200, 'success: User Already Exists.', { t: token }))
    } else {
      const createUserResult: false | SqlSchema.UserInput[] = await createUser(authenticateTokenResult.email, '', '', '', authenticateTokenResult.sign_in_provider, '2')

      if(createUserResult === false) {
        throw new Error('credentials error')
      } else {
        res.send(new HttpResponse(200, 'success', { t: token }))
      }
    }


  } catch(e) {
    res.send(new HttpResponse(400, e.message))
  }
})

export default router
