import express from 'express';
import AccountController from '../controller/AccountController.js';

const router = express.Router();

router.patch('/deposit', AccountController.makeDeposit);
router.patch('/withdrawal', AccountController.makeWithdrawal);
router.patch('/transfer', AccountController.makeTransfer);

router.get('/balance', AccountController.getBalance);
router.get('/meanByAgency', AccountController.getMeanByAgency);

router.use((error, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} ${error.message}`);
  res.status(400).send({ error: error.message});
});

export default router;