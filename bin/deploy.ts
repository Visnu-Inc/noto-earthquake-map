/**
 * node -r esbuild-register --env-file=.env ./bin/deploy.ts jobs create-json
 *
 */

import cp from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { command } from './lib/command.ts'
const execFile = promisify(cp.execFile)

const PROJECT = process.env.BIN_PROJECT ?? ''
const LOCATION = process.env.BIN_LOCATION ?? ''
const REPOSITORY = process.env.BIN_REPOSITORY ?? ''
if (!PROJECT || !LOCATION || !REPOSITORY) {
  throw new Error('env')
}

yargs(hideBin(process.argv))
  .command(
    'jobs [jobName]',
    'deploy jobs',
    (yargs) => {
      return yargs.positional('jobName', {
        describe: 'job name',
        type: 'string'
      })
    },
    (argv) => {
      if (!argv.jobName) {
        throw Error('no jobName')
      }
      deployJobs(argv.jobName)
    }
  )
  .parse()

async function deployJobs(jobName: string) {
  const jobNames = ['create-json']
  const image = `${LOCATION}-docker.pkg.dev/${PROJECT}/${REPOSITORY}/jobs`
  
  const packageJson = readFileSync(path.resolve(__dirname, '../packages/jobs/package.json'), { encoding: 'utf-8' })
  const { version } = JSON.parse(packageJson)
  const imageAndTag = `${image}:${version}`

  if (!jobNames.some((name) => name === jobName)) {
    throw Error('jobの名前が間違っています')
  }

  const hasFlag = await hasDockerIamges(version, imageAndTag)
  if (!hasFlag) {
    dockerBuild('./packages/jobs/Dockerfile', imageAndTag, { cwd: path.resolve(__dirname, '../') })
  }
  dockerPush(imageAndTag)

  // memo: 初回はupdateだと失敗するのでcreateと--set-env-varsに書き換える（あまり回数がないからコードには落としてない）
  command(
    'gcloud',
    [
      'beta',
      'run',
      'jobs',
      'update',
      jobName,
      '--image',
      imageAndTag,
      '--project',
      PROJECT,
      '--region',
      'asia-northeast1',
      '--update-env-vars',
      `JOB_NAME=${jobName}`
    ],
    { cwd: path.resolve(__dirname, '../') }
  )
}

async function hasDockerIamges(version: string, tagName: string) {
  const dokcerImages = await execFile('docker', ['images', tagName])
  return dokcerImages.stdout.includes(version)
}

function dockerBuild(dockerFilePath: string, tagName: string, options: { cwd: string }) {
  command('docker', ['build', '--platform', 'linux/amd64', '-f', dockerFilePath, '-t', tagName, '.'], {
    cwd: options.cwd
  })
}

function dockerPush(tagName: string) {
  command('docker', ['push', tagName], { cwd: path.resolve(__dirname, '../') })
}
