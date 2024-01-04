async function main() {
  try {
    switch (process.env.JOB_NAME) {
      case 'create-json':
        return await (await import('./workers/create_json.js')).createJson()
      default:
        return
    }
  } catch (e) {
    console.error(e)
  }
}

main().catch(console.error)
