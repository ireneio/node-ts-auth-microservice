import { client } from '../local'
import { BCRYPT_SALT_ROUNDS } from '../utils/constants'
import bcrypt from 'bcrypt'
import { isRowsExist, genDateNow } from '../utils/helpers'
import { SqlSchema } from '../../types/sql'

export async function createUser(email: string, password: string, accessToken: string, refreshToken: string, provider: string, accessLevel?: string): Promise<Array<SqlSchema.UserInput> | false> {
  const sql = `
    INSERT INTO member(email, password, access_token, refresh_token, provider, access_level)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *
  `

  let perm = accessLevel
  if(!accessLevel || provider !== 'local') {
    perm = '1'
  }

  try {
    const hashedPassword: string = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
    const { rows } = await client.query(sql, [email, hashedPassword, accessToken, refreshToken, provider, perm])
    if(isRowsExist(rows) && rows) {
      console.log('[DB] createUser Success: ')
      console.log(rows)
      return rows
    } else {
      throw new Error('Row insertion failed.')
    }
  } catch(e) {
    console.log('[DB] createUser Error: ' + e.message)
    return false
  }
}

export async function getUserAll(): Promise<Array<SqlSchema.UserInput> | false> {
  const sql = `
    SELECT id, email, last_login
    FROM member
  `

  try {
    const { rows } = await client.query(sql)
    if(isRowsExist(rows)) {
      console.log('[DB] getUserAll Success: ')
      console.log(rows)
      return rows
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] getUserAll Error: ' + e.message)
    return false
  }
}

export async function getUser(email: string): Promise<Array<SqlSchema.UserInput> | false> {
  const sql = `
    SELECT id, email, password, access_token, refresh_token, last_login, provider
    FROM member
    WHERE email = $1
  `

  try {
    const { rows } = await client.query(sql, [email])
    if(isRowsExist(rows)) {
      console.log('[DB] getUser Success: ')
      console.log(rows)
      return rows
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] getUser Error: ' + e.message)
    return false
  }
}

export async function getAndVerifyUser(email: string, password: string): Promise<Array<SqlSchema.UserInput> | false> {
  const sql = `
    SELECT id, email, password, access_token, refresh_token, last_login
    FROM member
    WHERE email = $1
  `
  // TODO: verify password
  try {
    const { rows } = await client.query(sql, [email])
    if(isRowsExist(rows)) {
      // const comparePasswordResult: boolean = await bcrypt.compare(password, rows[0].password)
      const comparePasswordResult: boolean = true

      if(comparePasswordResult === true) {
        console.log('[DB] getAndVerifyUser Success: ')
        console.log(rows)
        return rows
      }
      return false
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] getAndVerifyUser Error: ' + e.message)
    return false
  }
}

export async function updateUser(id: number, flag: string, value: string): Promise<Array<SqlSchema.UserInput> | false> {
  let sql = ''
  try {
    let res: boolean | SqlSchema.UserInput[] = false
    if(flag === 'password') {
      sql = `
        UPDATE member
        SET password = $2, last_updated = $3
        WHERE id = $1
        RETURNING *
      `
      const hashedPassword: string = await bcrypt.hash(value, BCRYPT_SALT_ROUNDS)
      const { rows } = await client.query(sql, [id, hashedPassword, genDateNow()])
      res = rows
    } else if(flag === 'email') {
      sql = `
        UPDATE member
        SET email = $2, last_updated = $3
        WHERE id = $1
        RETURNING *
      `
      const { rows } = await client.query(sql, [id, value, genDateNow()])
      res = rows
    } else {
      throw new Error('input error')
    }
    if(isRowsExist(res)) {
      console.log('[DB] updateUser Success: ')
      console.log(res)
      return res
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] updateUser Error: ' + e.message)
    return false
  }
}
