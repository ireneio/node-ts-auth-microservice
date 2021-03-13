import NodeRSA from 'node-rsa'
import * as fs from 'fs'
import * as path from 'path'

const key: NodeRSA = new NodeRSA({ b: 64 })

export function encrpyt(pathToPublicKey: string, encryptData: string): string {

  const publicKey: Buffer = fs.readFileSync(path.resolve(__dirname, pathToPublicKey))

  key.importKey(publicKey, 'pkcs8-public-pem')

  const privateKey: Buffer = fs.readFileSync(path.resolve(__dirname, encryptData))
  const encrpyted: string = key.encrypt(privateKey, 'base64')
  console.log(encrpyted)
  return encrpyted
}

export function decrypt(encrypted: string) {
  const decrypted = key.decrypt(encrypted, 'utf8')
  return decrypted
}
