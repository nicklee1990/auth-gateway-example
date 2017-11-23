const mongoose      = require('mongoose');
const proxy         = require('http-proxy-middleware');
const express       = require('express');
const path          = require('path');
const pug           = require('pug');
const flash         = require('express-flash');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');
const passport      = require('passport');
const bodyParser    = require('body-parser');
const authRoutes    = require('./auth/routes');
const jwtStrategy   = require('./auth/strategies/jwt');
const localStrategy = require('./auth/strategies/local');
const app           = express();
mongoose.Promise    = global.Promise;

// Setup basic express config
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.AUTH_SECRET || 'secret', {
  domain: process.env.DOMAIN
}));
app.use(session({
  secret: process.env.AUTH_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

// Configure passport
passport.use(jwtStrategy);
passport.use(localStrategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.use(passport.initialize());

// Configure routes
app.use('/', authRoutes);

app.use('*', passport.authenticate('jwt', {
  failureRedirect: '/login'
}), proxy({
  target: process.env.UPSTREAM_URL || 'http://localhost:3000', ws: true
}));

// Connect to the DB
mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/auth_gateway', {useMongoClient: true})
  .then(() => {
    app.listen(3001, () => console.log('Example app listening on port 3001!'));
  })
  .catch(err => {
    console.error(err.message)
  });