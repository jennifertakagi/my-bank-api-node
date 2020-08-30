import mongoose from 'mongoose';

const accountSchema = mongoose.Schema({
  agency: {
    type: Number,
    require: true,
    min: 0
  },
  account: {
    type: Number,
    require: true,
    min: 0
  },
  name: {
    type: String,
    require: true
  },
  balance: {
    type: Number,
    require: true,
    min: 0
  }
});

const accountModel = mongoose.model('accounts', accountSchema, 'accounts');

export {accountModel};