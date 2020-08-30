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

      if (!account || !agency ||  !balance) {
        throw new Error('These parameters are required: account, agency, balance!');
      }

      const accountDB = await accountModel.findOne({'account': account})

      if (!accountDB) {
        throw new Error(`The account ${account} doesn't exist!`);
      }

      const query = { _id: accountDB._id} ;
      const update = {
        "$inc": {
          "balance": -balance
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
}

export default new AccountController;