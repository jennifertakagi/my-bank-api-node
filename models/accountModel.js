import mongoose from 'mongoose';

const accountSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
    min: 0
  },
  conta: {
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

const accountModel = moongose.model('accounts', accountSchema, 'accounts');

export {accountModel};