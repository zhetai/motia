import { exec } from 'child_process'

export const executeCommand = async (command: string, rootDir: string) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        reject(error)
        return
      }
      if (stdout) console.log(stdout.toString())
      if (stderr) console.error(stderr.toString())
      resolve(stdout)
    })
  })
}
