import { writeFile, readFile, mkdtemp, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from 'csv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { CLOUDFLARE } from '../config.js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE.ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE.SECRET_ACCESS_KEY
  }
})

const url = 'https://docs.google.com/spreadsheets/d/1Wa3EltKUwq2-d8W8s6QlJ7TIEC83kc8131xuX9q_5OI'

export async function createJson() {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const tempdir = await mkdtemp(path.join(dirname, './tmp-'))

  const res = await Promise.allSettled([ 
    createInfo(tempdir).then((data) => upload('info.json', JSON.stringify(data))),
    createRoadInfo(tempdir).then((data) => upload('road.json', JSON.stringify(data))),
    createSupportInfo(tempdir).then((data) => upload('support.json', JSON.stringify(data))),
    createStoreInfo(tempdir).then((data) => upload('store.json', JSON.stringify(data)))
  ])
  console.log(res)

  await rm(tempdir, { recursive: true })
}

async function download(url: string, path: string) {
  const res = await fetch(url)
  const downloadData = Buffer.from(await res.arrayBuffer())
  await writeFile(path, downloadData)
}

async function upload(key: string, body: string) {
  const command = new PutObjectCommand({
    Key: key,
    Body: body,
    ContentType: 'application/json',
    Bucket: CLOUDFLARE.R2_BUCKET
  })
  const data = await s3.send(command)
  return data
}

async function createInfo(tmpdirPath: string) {
  const query = new URLSearchParams([
    ['gid', '0'],
    ['format', 'tsv'],
  ])
  const downloadDataPath = path.join(tmpdirPath, './info-data.tsv')
  await download(`${url}/export?${query.toString()}`, downloadDataPath)

  const tsv = await readFile(downloadDataPath, 'utf8')
  const parser = parse(tsv, {
    delimiter: '\t',
    trim: true,
    from_line: 2
  })

  const data: {
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
    data.push({
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
  console.log(JSON.stringify({
    label: 'info',
    payload: data
  }))

  return { data }
}

async function createRoadInfo(tmpdirPath: string) {
  const query = new URLSearchParams([
    ['gid', '525552252'],
    ['format', 'tsv'],
  ])
  const downloadDataPath = path.join(tmpdirPath, './road-data.tsv')
  await download(`${url}/export?${query.toString()}`, downloadDataPath)

  const tsv = await readFile(downloadDataPath, 'utf8')
  const parser = parse(tsv, {
    delimiter: '\t',
    trim: true,
    from_line: 1
  })

  const data: {
    状況: string
    最終更新時刻: string
    情報源: string
    others: string
  }[] = []

  for await (const record of parser) {
    const [状況, 最終更新時刻, 情報源, ...others] = record
    data.push({
      状況,
      最終更新時刻,
      情報源,
      others: others.filter((e: unknown) => !!e).join('\n')
    })
  }

  console.log(JSON.stringify({
    label: 'road',
    payload: data
  }))

  return { data }
}

async function createSupportInfo(tmpdirPath: string) {
  const query = new URLSearchParams([
    ['gid', '1768926558'],
    ['format', 'tsv'],
  ])
  const downloadDataPath = path.join(tmpdirPath, './support-data.tsv')
  await download(`${url}/export?${query.toString()}`, downloadDataPath)

  const tsv = await readFile(downloadDataPath, 'utf8')
  const parser = parse(tsv, {
    delimiter: '\t',
    trim: true,
    from_line: 2
  })

  const data: {
    title: string
    情報源: string
    others: string
  }[] = []

  for await (const record of parser) {
    const [title, 情報源, ...others] = record
    data.push({
      title,
      情報源,
      others: others.filter((e: unknown) => !!e).join('\n')
    })
  }

  console.log(JSON.stringify({
    label: 'support',
    payload: data
  }))

  return { data }
}

async function createStoreInfo(tmpdirPath: string) {
  const query = new URLSearchParams([
    ['gid', '1768926558'],
    ['format', 'tsv'],
  ])
  const downloadDataPath = path.join(tmpdirPath, './store-data.tsv')
  await download(`${url}/export?${query.toString()}`, downloadDataPath)

  const tsv = await readFile(downloadDataPath, 'utf8')
  const parser = parse(tsv, {
    delimiter: '\t',
    trim: true,
    from_line: 2
  })

  const data: {
    番号: string
    地域: string
    店舗名: string
    others: string
  }[] = []

  for await (const record of parser) {
    const [番号, 地域, 店舗名, ...others] = record
    data.push({
      番号,
      地域,
      店舗名,
      others: others.filter((e: unknown) => !!e).join('\n')
    })
  }

  console.log(JSON.stringify({
    label: 'store',
    payload: data
  }))

  return { data }
}
