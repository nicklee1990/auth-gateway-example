const User     = require('../models/User');
const passport = require('passport');
const router   = require('express').Router();
const flash    = require('express-flash');
const jwt      = require('jsonwebtoken');

/**
 *
 * @param user
 * @returns {*}
 */
const generateToken = (user) => {
  return jwt.sign(user, process.env.AUTH_SECRET || 'secret', {
    expiresIn: 10080 // in seconds
  });
};

/**
 * Filter the user information returned to the client
 * @param user user object from db
 * @returns {{id, username: *}}
 */
const setUserInfo = (user) => {
  return {
    id: user._id,
    username: user.username,
  };
};

/**
 * LOGIN ROUTES
 */
router.get('/login', (req, res) => {
  res.render('login', {messages: req.flash('error')})
});
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  session: true
}), (req, res) => {
  let userInfo = setUserInfo(req.user);

  res.cookie('jwt', generateToken(userInfo)).redirect('/');
});

/**
 * REGISTRATION ROUTES
 */
router.get('/register', (req, res) => res.render('register'));
router.post('/register', (req, res) => {
  User.create({
    email: req.body.email,
    password: req.body.password
  }).then(user => {
      res.redirect('/login')
    })
    .catch(err => {
      console.error(err);
      res.status(500).json(err)
    })
});

module.exports = router;