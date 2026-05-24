import { build } from 'esbuild'
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')
const dist = join(root, 'dist')
const release = join(root, 'release')

rmSync(dist, { recursive: true, force: true })
rmSync(release, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })
mkdirSync(release, { recursive: true })

await build({
  entryPoints: [join(root, 'src', 'index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: join(dist, 'index.js'),
  sourcemap: true,
  target: 'node20',
  packages: 'external',
  logLevel: 'info',
})

copyFileSync(join(root, 'src', 'schema.graphql'), join(dist, 'schema.graphql'))

copyFileSync(join(root, 'package.json'), join(release, 'package.json'))
copyFileSync(join(root, 'ecosystem.config.cjs'), join(release, 'ecosystem.config.cjs'))
copyFileSync(join(root, '.env.example'), join(release, '.env.example'))

if (existsSync(join(root, 'pnpm-lock.yaml'))) {
  copyFileSync(join(root, 'pnpm-lock.yaml'), join(release, 'pnpm-lock.yaml'))
}

mkdirSync(join(release, 'dist'), { recursive: true })
copyFileSync(join(dist, 'index.js'), join(release, 'dist', 'index.js'))
copyFileSync(join(dist, 'index.js.map'), join(release, 'dist', 'index.js.map'))
copyFileSync(join(dist, 'schema.graphql'), join(release, 'dist', 'schema.graphql'))

writeFileSync(
  join(release, 'README.md'),
  `# HackerNews API Release

Upload this directory to the server.

First deployment:

\`\`\`bash
cp .env.example .env
pnpm install --prod
pm2 start ecosystem.config.cjs
pm2 save
\`\`\`

Later deployments:

\`\`\`bash
pnpm install --prod
pm2 reload hackernews-api
\`\`\`

Keep the real .env on the server and do not overwrite it unless configuration changes.
`
)
