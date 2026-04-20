import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.AUTH0_DOMAIN) {
  throw new Error('Security configuration missed')
}

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute:    5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as jwksRsa.GetVerificationKey,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
})

export function jwtErrorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid or missing token' })
    return
  }
  next(err)
}

declare global {
  namespace Express {
    interface Request {
      auth?: { sub: string; [key: string]: unknown }
    }
  }
}