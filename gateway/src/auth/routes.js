const User     = require('../models/User');
const passport = require('passport');
const router   = require('express').Router();
const flash    = require('express-flash');
const jwt      = require('jsonwebtoken');

/**
 * @param user
 * @returns {*}
 */
const generateToken = (user) => {
  return jwt.sign(user, process.env.AUTH_SECRET || 'secret', {
    expiresIn: 10080 // in seconds
  });
};

/**
 * Verifies the user does not already have a JWT token in the cookie.
 * We use this instead of local because we want to ensure the JWT is still valid, otherwise the user
 * will need to request a new one
 * @param req
 * @param res
 * @param next
 */
const ensureNotAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return next(); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next)
}

/**
 * Filter the user information returned to the client
 * @param user user object from db
 * @returns {{id, username: *}}
 */
const setUserInfo = (user) => {
  return {
    id: user._id,
    email: user.email,
  };
};

/**
 * LOGIN ROUTES
 */
router.get('/login', ensureNotAuthenticated, (req, res, next) => res.render('login'));
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  session: true
}), (req, res) => {
  let userInfo = setUserInfo(req.user);
  let token = generateToken(userInfo);

  res.cookie('jwt', token).redirect('/');
});

/**
 * REGISTRATION ROUTES
 */
router.get('/register', ensureNotAuthenticated, (req, res, next) => res.render('register'));
router.post('/register', (req, res) => {
  User.create({
    email: req.body.email,
    password: req.body.password
  }).then(user => {
      res.redirect(307, '/login')
    })
    .catch(err => {
      let messages = err.errors
        ? Object.keys(err.errors).map(key => err.errors[key].message)
        : ['Unable to register account. Please try a different email.'];

      req.flash('error', messages);
      res.redirect('/register')
    })
});

/**
 * LOGOUT
 */
router.post('/logout', passport.authenticate('jwt'), (req, res) => {
  // Logout and reset the cookie
  req.logOut();
  res.cookie('jwt', '', {maxAge: Date.now()}).redirect('/login')
});

/**
 * Middleware to flash messages
 */
router.use((req, res, next) => {
  res.locals.error_messages = req.flash('error');
  next();
});

module.exports = router;