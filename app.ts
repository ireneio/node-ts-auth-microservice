import express, { Application, Request, Response } from 'express'
import * as path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'

import HttpResponse from './utils/http'

import indexRouter from './routes/index'
import authRouter from './routes/auth'
import userRouter from './routes/user'

import initLocalPg from './db/local'

// Firebase SDK
import initFirebase from './utils/firebase/admin'

initFirebase

// connect db
await initLocalPg()

const app: Application = express()

// cors
const corsOptions = {
  origin: process.env.NODE_APP_CORS_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// routers
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)

// 403 all other routes
app.use('*', function(req: Request, res: Response, next: Function): void {
  res.send(new HttpResponse(403, 'forbidden'))
})

export default app

// import { decrypt, encrpyt } from './utils/rsa'

// console.log(encrpyt('../public-key.pem', '../private-key.pem'))
// const encrypted = encrpyt('../public-key.pem', '../private-key.pem')
// const decrypted = decrypt(encrypted)

// console.log(decrypted)
