import { Request, Response } from 'express'
import HttpResponse from '../utils/http'
import { decodeJWT } from '../utils/jwt'
import packagejson from '../package.json'

function authenticate(token: string): boolean {
  return decodeJWT(token, packagejson.name)
}

export default function authMiddleware(req: Request, res: Response, next: Function): void {
  try {
    const h: string | undefined = req.headers.authorization
    if(h && h.split(' ')[0] === 'Bearer') {
      const token = h.split(' ')[1]
      const authenticateTokenResult: boolean = authenticate(token)
      if(authenticateTokenResult === true) {
        next()
      } else {
        throw new Error('forbidden')
      }
    } else {
      throw new Error('forbidden')
    }
  } catch(e) {
    res.send(new HttpResponse(401, e.message))
  }
}
