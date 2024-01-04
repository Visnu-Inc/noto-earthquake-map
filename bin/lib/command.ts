import { spawnSync } from 'child_process'

export const command = (command: string, args: readonly string[], options: Parameters<typeof spawnSync>[2]) => {
  const res = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (res.status !== 0) {
    throw res
  }
  return res
}
