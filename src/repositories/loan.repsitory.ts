import { prisma } from '../lib/prisma'
import { LoanStatus, Prisma } from '@prisma/client'

export const loanRepository = {

  findActiveByUser(userId: string) {
    return prisma.loan.findMany({
      where: { userId, status: LoanStatus.ACTIVE },
      orderBy: { dueDate: 'asc' },
    })
  },

  findHistoryByUser(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      orderBy: { borrowedAt: 'desc' },
    })
  },

  findActiveByUserAndBook(userId: string, bookId: string) {
    return prisma.loan.findFirst({
      where: { userId, bookId, status: LoanStatus.ACTIVE },
    })
  },

  findByIdAndUser(id: string, userId: string) {
    return prisma.loan.findFirst({
      where: { id, userId },
    })
  },

  findInventory(bookId: string) {
    return prisma.bookInventory.findUnique({
      where: { bookId },
    })
  },

  findInventoryMany(bookIds: string[]) {
    return prisma.bookInventory.findMany({
      where: { bookId: { in: bookIds } },
      select: { bookId: true, available: true },
    })
  },

  upsertInventory(bookId: string) {
    return prisma.bookInventory.upsert({
      where: { bookId },
      create: { bookId, totalCopies: 1, available: 1 },
      update: {},
    })
  },

  createLoan(userId: string, bookId: string, dueDate: Date) {
    return prisma.loan.create({
      data: { userId, bookId, dueDate },
    })
  },

  markReturned(id: string) {
    return prisma.loan.update({
      where: { id },
      data:  { status: LoanStatus.RETURNED, returnedAt: new Date() },
    })
  },

  decrementAvailable(bookId: string, tx: Prisma.TransactionClient) {
    return tx.bookInventory.update({
      where: { bookId },
      data:  { available: { decrement: 1 } },
    })
  },

  incrementAvailable(bookId: string, tx: Prisma.TransactionClient) {
    return tx.bookInventory.update({
      where: { bookId },
      data:  { available: { increment: 1 } },
    })
  },
}