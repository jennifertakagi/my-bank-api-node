import express from 'express';
import AccountController from '../controller/AccountController.js';

const router = express.Router();

router.patch('/deposit', AccountController.makeDeposit);
router.patch('/withdrawal', AccountController.makeWithdrawal);
router.patch('/transfer', AccountController.makeTransfer);
router.patch('/transferBiggest', AccountController.transferBiggest);

router.get('/balance', AccountController.getBalance);
router.get('/meanByAgency', AccountController.getMeanByAgency);
router.get('/smallestBalance', AccountController.getSmallestBalance);
router.get('/biggestBalance', AccountController.getBiggestBalance);

router.delete('/deleteAccount', AccountController.deleteAccount);

router.use((error, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} ${error.message}`);
  res.status(400).send({ error: error.message});
});

export default router;