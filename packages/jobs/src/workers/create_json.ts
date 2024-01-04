import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from 'csv'
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { CLOUDFLARE } from '../config.js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE.ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE.SECRET_ACCESS_KEY
  }
})

const dirname = path.dirname(fileURLToPath(import.meta.url))

export async function createJson() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1Wa3EltKUwq2-d8W8s6QlJ7TIEC83kc8131xuX9q_5OI/export?gid=0&format=tsv')
  const downloadData = Buffer.from(await res.arrayBuffer())

  const downloadDataPath = path.join(dirname, './data.tsv')
  await writeFile(downloadDataPath, downloadData)

  const tsv = await readFile(downloadDataPath, 'utf8')
  const parser = parse(tsv, {
    delimiter: '\t',
    trim: true,
    from_line: 2
  })

  const info: {
    id: string
    市町村: string
    市町村2: string
    市町村3: string
    状況: string
    最終更新時刻: string
    状態: string
    対応状況: string
    情報源: string
    others: string
  }[] = []

  const before = {
    id: null,
    市町村: null,
    市町村2: null
  }
  for await (const record of parser) {
    const [_id, _市町村, _市町村2, 市町村3, 状況, 最終更新時刻, 状態, 対応状況, 情報源, ...others] = record
    const id = _id || before.id
    const 市町村 = _市町村 || before.市町村
    const 市町村2 = _市町村2 || before.市町村2
    info.push({
      id,
      市町村,
      市町村2,
      市町村3,
      状況,
      最終更新時刻,
      状態,
      対応状況,
      情報源,
      others: others.filter((e: unknown) => !!e).join('\n')
    })
    before.id = id
    before.市町村 = 市町村
    before.市町村2 = 市町村2
  }

  const uploadDataPath = path.join(dirname, './info.json')
  await writeFile(uploadDataPath, JSON.stringify(info))

  const command = new PutObjectCommand({
    Key: 'info.json',
    Body: JSON.stringify(info),
    ContentType: 'application/json',
    Bucket: CLOUDFLARE.R2_BUCKET
  })
  const data = await s3.send(command)
  console.log(data)
}
