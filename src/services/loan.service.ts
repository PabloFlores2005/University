import { prisma } from '../lib/prisma'
import { loanRepository } from '../repositories/loan.repsitory'
import { ConflictError, NotFoundError } from '../lib/error'
import { LoanStatus } from '@prisma/client'

const LOAN_DAYS = 14

export const loanService = {
  getActiveLoans(userId: string) {
    return loanRepository.findActiveByUser(userId)
  },

  getLoanHistory(userId: string) {
    return loanRepository.findHistoryByUser(userId)
  },

  async getAvailability(bookIds: string[]): Promise<Record<string, number>> {
    const rows = await loanRepository.findInventoryMany(bookIds)
    const map: Record<string, number> = Object.fromEntries(bookIds.map(id => [id, 1]))
    for (const row of rows) map[row.bookId] = row.available
    return map
  },

  async borrowBook(userId: string, bookId: string) {
    return prisma.$transaction(async (tx) => {
      await loanRepository.upsertInventory(bookId)

      const inventory = await tx.bookInventory.findUniqueOrThrow({
        where: { bookId },
      })

      if (inventory.available < 1) {
        throw new ConflictError('Book is not available')
      }

      const existing = await loanRepository.findActiveByUserAndBook(userId, bookId)
      if (existing) {
        throw new ConflictError('You already have this book borrowed')
      }

      await loanRepository.decrementAvailable(bookId, tx)

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + LOAN_DAYS)

      const loan = await tx.loan.create({
        data: { userId, bookId, dueDate },
      })

      return loan
    })
  },

  async returnBook(loanId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const loan = await loanRepository.findByIdAndUser(loanId, userId)

      if (!loan) {
        throw new NotFoundError('Loan not found')
      }

      if (loan.status !== LoanStatus.ACTIVE) {
        throw new ConflictError('Loan is already returned')
      }

      const [updated] = await Promise.all([
        tx.loan.update({
          where: { id: loanId },
          data:  { status: LoanStatus.RETURNED, returnedAt: new Date() },
        }),
        loanRepository.incrementAvailable(loan.bookId, tx),
      ])

      return updated
    })
  },
}