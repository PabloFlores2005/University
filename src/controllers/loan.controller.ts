import { Request, Response } from 'express'
import { z } from 'zod'
import { loanService } from '../services/loan.service'
import { ConflictError, NotFoundError, ValidationError } from '../lib/error'

const BorrowSchema = z.object({
  bookId: z.string().min(1, 'bookId is required'),
})

const AvailabilitySchema = z.object({
  ids: z.string().min(1, 'ids query param is required'),
})

function getUserId(req: Request): string {
  const sub = req.auth?.sub
  if (!sub) throw new ValidationError('No user id in token')
  return sub
}

function handleError(err: unknown, res: Response) {
  if (err instanceof NotFoundError)  return res.status(404).json({ error: err.message })
  if (err instanceof ConflictError)  return res.status(409).json({ error: err.message })
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message })
  console.error('Unexpected error:', err)
  return res.status(500).json({ error: 'Internal server error' })
}

export const loanController = {
  async getActiveLoans(req: Request, res: Response) {
    try {
      const userId = getUserId(req)
      const loans  = await loanService.getActiveLoans(userId)
      res.json(loans)
    } catch (err) {
      handleError(err, res)
    }
  },

  async getLoanHistory(req: Request, res: Response) {
    try {
      const userId = getUserId(req)
      const loans  = await loanService.getLoanHistory(userId)
      res.json(loans)
    } catch (err) {
      handleError(err, res)
    }
  },

  async getAvailability(req: Request, res: Response) {
    try {
      const parsed = AvailabilitySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message })
        return
      }
      const ids    = parsed.data.ids.split(',').map(s => s.trim()).filter(Boolean)
      const result = await loanService.getAvailability(ids)
      res.json(result)
    } catch (err) {
      handleError(err, res)
    }
  },

  async borrowBook(req: Request, res: Response) {
    try {
      const parsed = BorrowSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message })
        return
      }
      const userId = getUserId(req)
      const loan   = await loanService.borrowBook(userId, parsed.data.bookId)
      res.status(201).json(loan)
    } catch (err) {
      handleError(err, res)
    }
  },

  async returnBook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = getUserId(req)
      const loan   = await loanService.returnBook(id, userId)
      res.json(loan)
    } catch (err) {
      handleError(err, res)
    }
  },
}