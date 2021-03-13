import { client } from '../local'
import { isRowsExist } from '../utils/helpers'

export async function createAccessLevelTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS access_level (
      id text PRIMARY KEY,
      description text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await client.query(sql)
    console.log('[DB] createAccessLevelTable Success.')
  } catch(e) {
    console.log('[DB] createAccessLevelTable Error: ' + e.message)
    return false
  }
}

export async function defineAccessLevel(): Promise<void | false> {
  const sql: string = `
    INSERT INTO access_level(id, description)
    VALUES($1, $2)
    RETURNING *
  `

  const accessLevel: { id: string, description: string }[] = [
    { id: '1', description: 'guest' },
    { id: '2', description: 'user' },
    { id: '3', description: 'admin_1' },
    { id: '4', description: 'admin_2' },
    { id: '5', description: 'admin_3' },
    { id: '6', description: 'root' }
  ]

  try {
    let res = []
    for await(let item of accessLevel) {
      const { id, description } = item
      const { rows } = await client.query(sql,[id, description])
      if(isRowsExist(rows) && rows) {
        res.push(rows[0])
      }
    }
    console.log('[DB] defineAccessLevel Success.')
    console.log(res)
  } catch(e) {
    console.log('[DB] defineAccessLevel Error: ' + e.message)
    return false
  }
}

export async function dropAccessLevelTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE cmsUsers
  `

  try {
    await client.query(sql)
    console.log('[DB] dropAccessLevelTable Success.')
  } catch(e) {
    console.log('[DB] dropAccessLevelTable Error: ' + e.message)
    return false
  }
}

