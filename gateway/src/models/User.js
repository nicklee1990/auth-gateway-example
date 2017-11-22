const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt   = require('bcrypt');

const UserSchema = new Schema({
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date}
  },
  {
    timestamps: true
  });

UserSchema.pre('save', function (next) {
  const user        = this;
  const SALT_FACTOR = process.env.SALT_FACTOR || 5;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, SALT_FACTOR).then(function (hash) {
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const model = mongoose.model('User', UserSchema);

module.exports = model;