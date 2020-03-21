import { command, Options } from "execa";
import { readFileSync } from "fs";
import { resolve } from "path";

const scriptName = 'TestScript'
const buildDir = resolve(__dirname, './build')
const options: Options = {
  stdio: 'inherit',
  reject: true,
  cwd: __dirname,
}

it('builds the correct documents', async () => {
  await command("yarn --frozen-lockfile", options)
  await command("yarn rimraf build/*", options)
  await command("yarn webpack", options)
  
  const mainScript = readFileSync(resolve(buildDir, `${scriptName}.user.js`), 'utf8')
  expect(mainScript).toMatchSnapshot('mainScript')

  const devScript = readFileSync(resolve(buildDir, `${scriptName}.dev.user.js`), 'utf8')
  expect(devScript).toMatchSnapshot('devScript')
})