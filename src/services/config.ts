import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export const readConfig = async (key: string) => {
  const file = path.join(os.homedir(), '.yggy', 'config.json')
  const content = await fs.readFileSync(file, 'utf8')
  const json = JSON.parse(content)
  return json[key]
}

export const bucketName = async () => {
  const bucket = await readConfig('bucket')
  console.log(`bucket name is ${bucket}`)
  return bucket
}
