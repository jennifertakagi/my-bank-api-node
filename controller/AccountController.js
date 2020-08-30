import { accountModel } from '../models/accountModel.js';

class AccountController {
  /**
   * Makes deposit according to account, and
   * update the account's balance
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async makeDeposit(req, res, next) {
    try {
      let { agency, account, balance } = req.body;

      validateRequestParams({account, agency, balance});

      const accountDB = await validateAccountExists(accountModel, account);
      const query = { _id: accountDB._id} ;
      const update = {
        "$inc": {
          "balance": balance
        }
      };
      const options = { new: true };

      const updatedAccountDB = await accountModel.findByIdAndUpdate(query, update, options)

      res.send(`New balance: ${updatedAccountDB.balance}`);

      logger.info(`POST /account/deposit - ${JSON.stringify(updatedAccountDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }

  /**
   * Makes withdrawal according to account, and
   * update the account's balance
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async makeWithdrawal(req, res, next) {
    try {
      let { agency, account, balance } = req.body;

      validateRequestParams({account, agency, balance});

      const accountDB = await validateAccountExists(accountModel, account);
      const taxWithdrawal = 1;
      const newBalance = accountDB.balance - taxWithdrawal - balance;

      if (newBalance < 0) {
        throw new Error('There is not enough balance!');
      }

      const query = { _id: accountDB._id} ;
      const update = {
        "$set": {
          "balance": newBalance
        }
      };
      const options = { new: true };

      const updatedAccountDB = await accountModel.findByIdAndUpdate(query, update, options)

      res.send(`New balance: ${updatedAccountDB.balance}`);

      logger.info(`POST /account/withdrawal - ${JSON.stringify(updatedAccountDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }

  /**
   * Makes withdrawal according to account, and
   * update the account's balance
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async getBalance(req, res, next) {
    try {
      let { agency, account } = req.body;

      validateRequestParams({account, agency});

      const accountDB = await validateAccountExists(accountModel, account);

      res.send(`The balance is: ${formattedCurrency(accountDB.balance)}`);

      logger.info(`GET /account/balance - ${JSON.stringify(accountDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }
}

/**
 * Validates if the request has all the required params 
 * @param  {Array} params all params 
 */
function validateRequestParams(...params) {
  const requestParams = (params && params.length && params[0]) || [];
  const missingParams = Object.values(requestParams).some(value => !value)
  if (missingParams) {
    const requiredParams = Object.keys(requestParams).join(', ')
    throw new Error(`These parameters are required: ${requiredParams}!`);
  }
}

/**
 * Validates if account exists on Database
 * @param {Object} accountModel account model schema
 * @param {String} account account identifier
 * @returns {Object} index of user, if it does not exits returns -1
 */
async function validateAccountExists(accountModel, account = '') {
  const accountDB =  await accountModel.findOne({'account': account});

  if (!accountDB) {
    throw new Error(`The account ${account} doesn't exist!`);
  }

  return accountDB;
}

/**
 * Formats value to currency type
 * @param {Number} value to be formatted
 * @returns {String} formatted as currency
 */
function formattedCurrency(value) {
	return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default new AccountController;