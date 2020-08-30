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

      const accountDB = await validateAccountExists(accountModel, {account});
      const updateData = {
        '$inc': {
          'balance': balance
        }
      };
      const updatedAccountDB = await updateAccountById(accountDB, updateData)

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

      const accountDB = await validateAccountExists(accountModel, {account});
      const TAX_WITHDRAWAL = 1;
      const newBalance = accountDB.balance - TAX_WITHDRAWAL - balance;

      checkBalanceLimit(newBalance);

      const updateData = {
        '$set': {
          'balance': newBalance
        }
      };
      const updatedAccountDB = await updateAccountById(accountDB, updateData)

      res.send(`New balance: ${updatedAccountDB.balance}`);

      logger.info(`POST /account/withdrawal - ${JSON.stringify(updatedAccountDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }

  /**
   * Makes transfer between accounts,
   * update the destination account's balance
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async makeTransfer(req, res, next) {
    try {
      let { accountDestination, accountOrigin, valueTransfer } = req.body;
      
      validateRequestParams({accountDestination, accountOrigin, valueTransfer});

      const accountDestinationDB = await validateAccountExists(accountModel, {account: accountDestination});
      const accountOriginDB = await validateAccountExists(accountModel, {account: accountOrigin});

      if (!accountDestinationDB || !accountOriginDB) {
        const errorAccount = !accountDestinationDB || !accountOriginDB;
        throw new Error(`The account ${errorAccount} doesn't exist!`);
      }

      const TAX_TRANSFER = 8;
      const isSameAgency = verifiesSameAgency([accountDestinationDB, accountOriginDB]);
      let newOriginBalance = null;

      if (isSameAgency) {
        newOriginBalance = accountOriginDB.balance - valueTransfer;
      } else {
        newOriginBalance = accountOriginDB.balance - valueTransfer - TAX_TRANSFER;
      }

      checkBalanceLimit(newOriginBalance)

      const newDestinationBalance = accountDestinationDB.balance + valueTransfer;
      const updatedAccountDestinationDB = await updateAccountById(accountDestinationDB, {'$set': {'balance': newDestinationBalance}});
      const updatedAccountOriginDB = await updateAccountById(accountOriginDB, {'$set': {'balance': newOriginBalance}});

      res.send(`New origin balance: ${updatedAccountOriginDB.balance}`);

      logger.info(`POST /account/transfer - Origin: ${JSON.stringify(updatedAccountOriginDB.balance)}
        Destination: ${JSON.stringify(updatedAccountDestinationDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }

  /**
   * Gets the balance to account
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async getBalance(req, res, next) {
    try {
      let { agency, account } = req.body;

      validateRequestParams({account, agency});

      const accountDB = await validateAccountExists(accountModel, {account});

      res.send(`The balance is: ${formattedCurrency(accountDB.balance)}`);

      logger.info(`GET /account/balance - ${JSON.stringify(accountDB.balance)}`);
    } catch (error) {
        next(error);
    }
  }

  /**
   * Gets the balance's mean by agency
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async getMeanByAgency(req, res, next) {
    try {
      let { agency } = req.body;

      validateRequestParams({agency});

      const queryMatch = {'$match': {agency}};
      const queryGroup = {'$group':{'_id':'$agency', averageBalance : {'$avg' : '$balance'}}};
      const meanByAgency = await accountModel.aggregate([queryMatch, queryGroup]);
      const meanBalance = meanByAgency && meanByAgency.length && meanByAgency[0]

      res.send(`The balance's mean of the agency ${agency} is: ${meanBalance.averageBalance}`);

      logger.info(`GET /account/meanByAgency - ${JSON.stringify(meanBalance.averageBalance)}`);
    } catch (error) {
        next(error);
    }
  }

    /**
   * Gets the smaller client considering your balance
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Function} next next function
  */
  async getSmallerBalance(req, res, next) {
    try {
      let { limit } = req.body;

      validateRequestParams({limit});

      const smallerBalance = await accountModel.find({}, {_id: 0, name: 0}).sort({balance: 1}).limit(limit)

      res.send(`The smaller clients are: ${JSON.stringify(smallerBalance)}`);

      logger.info(`GET /account/smallerBalance - ${JSON.stringify(smallerBalance)}`);
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
async function validateAccountExists(accountModel, query) {
  const accountDB = await accountModel.findOne(query);

  if (!accountDB) {
    throw new Error(`The account ${query.account} doesn't exist!`);
  }

  return accountDB;
}

/**
 * Updated an account by ID
 * @param {Object} accountDB account object
 * @param {Object} update data that will update 
 * @param {Object} options options on query
 * @returns {Object} updated account
 */
async function updateAccountById(accountDB, update, options = { new: true }) {
  const query = { _id: accountDB._id};
  return await accountModel.findByIdAndUpdate(query, update, options);
}

/**
 * Checks if the balance's value is less than the limit
 * @param {Number} balance balance to check
 * @param {Number} limit limit to check 
 */
function checkBalanceLimit(balance, limit = 0) {
  if (balance < limit) {
    throw new Error('There is not enough balance!');
  }
}

/**
 * Formats value to currency type
 * @param {Number} value to be formatted
 * @returns {String} formatted as currency
 */
function formattedCurrency(value) {
	return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Verifies if the accounts have the same agency
 * @param {Array} accounts list of accounts to be checked
 * @returns {Boolean} if the accounts belong to the same agency
 */
function verifiesSameAgency(accounts = []) {
  const prevAccount = accounts.length && accounts[0];
  const nextAccount = accounts.length && accounts[1];

  return prevAccount.agency === nextAccount.agency;
}

export default new AccountController;