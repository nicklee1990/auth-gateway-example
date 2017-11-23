const User          = require('../../models/User');
const LocalStrategy = require('passport-local');

/**
 * Generic auth handler used in all scenarios.
 * @param done strategy callback
 */
const handleAuthFail = (done) => {
  done(null, false, {message: "Your login details could not be verified. Please try again."})
};

// Setting up local login strategy
const local = new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        // Use the generic handler to prevent user enumeration
        handleAuthFail(done);
      }
      user.comparePassword(password)
        .then(res => {
          res
            ? done(null, user.toObject())
            : handleAuthFail(done);
        })
        .catch(err => handleAuthFail(done))
    })
    .catch(err => {
      return done(err);
    })
});

module.exports = local;