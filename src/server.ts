import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { checkJwt, jwtErrorHandler } from './middleware/auth'
import loansRouter from './routes/loan.routes'

dotenv.config()

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}))

app.use(express.json())

app.use('/api/loans', checkJwt, jwtErrorHandler, loansRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Library API listening on :${PORT}`)
})