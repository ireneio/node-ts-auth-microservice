import { client } from '../local'

export async function createUserTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS member (
      id serial PRIMARY KEY,
      provider text NOT NULL,
      username text NOT NULL,
      email text NOT NULL,
      password text NOT NULL,
      access_level text NOT NULL DEFAULT '1',
      access_token text NOT NULL,
      refresh_token text NOT NULL,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_access_level
        FOREIGN KEY(access_level)
          REFERENCES access_level(id)
    );
  `

  try {
    await client.query(sql)
    console.log('[DB] createUserTable Success.')
  } catch(e) {
    console.log('[DB] createUserTable Error: ' + e.message)
    return false
  }
}

export async function dropUserTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE member
  `

  try {
    await client.query(sql)
    console.log('[DB] dropUserTable Success.')
  } catch(e) {
    console.log('[DB] dropUserTable Error: ' + e.message)
    return false
  }
}

