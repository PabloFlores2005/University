import { Router } from 'express'
import { loanController } from '../controllers/loan.controller'

const router = Router()

router.get ('/', loanController.getActiveLoans)
router.get ('/history', loanController.getLoanHistory)
router.get ('/availability', loanController.getAvailability)
router.post('/', loanController.borrowBook)
router.patch('/:id/return', loanController.returnBook)

export default router