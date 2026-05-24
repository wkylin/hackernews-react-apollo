import 'dotenv/config'
import { createServer } from 'node:http'
import { createApp } from './app.js'

const yoga = createApp()
const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 4000)

createServer(yoga).listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
