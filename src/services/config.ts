import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

type ConfigKey = 'bucketName'

const DIR = path.join(os.homedir(), '.yggy')
const FILE = path.join(os.homedir(), '.yggy', 'config.json')

const setupConfigFile = () => {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR)
  }

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}))
  }
}

const read = async () => {
  setupConfigFile()
  const raw = await fs.readFileSync(FILE, 'utf8')
  return JSON.parse(raw)
}

const get = async (key: ConfigKey) => {
  setupConfigFile()
  const config = await read()
  return config[key]
}

const set = async (key: ConfigKey, value: string) => {
  setupConfigFile()
  const config = await read()
  const newConfig = { ...config, [key]: value }
  fs.writeFileSync(FILE, JSON.stringify(newConfig))
}

export const bucketName = async () => {
  const bucket = await get('bucketName')
  console.info(`ℹ️  Bucket name is s3://${bucket} \n`)
  return bucket
}

export default { get, set }
