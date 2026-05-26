import 'dotenv/config'
import { createServer } from 'node:http'
import { createApp } from './app.ts'

const yoga = createApp()
const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 4000)

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  yoga(request, response)
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
