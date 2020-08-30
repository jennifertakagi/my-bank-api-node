import express from 'express';
import AccountController from '../controller/AccountController.js';

const router = express.Router();

router.post("/deposit", AccountController.makeDeposit);
router.post("/withdrawal", AccountController.makeWithdrawal);
router.get("/balance", AccountController.getBalance);

router.use((error, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} ${error.message}`);
  res.status(400).send({ error: error.message});
});

export default router;