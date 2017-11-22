const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt  = require('passport-jwt').ExtractJwt;
const User        = require('../../models/User');

let opts = {
  jwtFromRequest: function (req) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt'];
    }
    return token;
  },
  secretOrKey: process.env.AUTH_SECRET || 'secret',
};

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
  User.findOne({id: jwt_payload.sub})
    .then(user => {
      console.log('e');
      done(null, user)
    })
    .catch((err) => {
      console.log('e');
      done(err, false);
    });
});