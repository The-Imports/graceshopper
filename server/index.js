const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const session = require('express-session')
const passport = require('passport')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const db = require('./db')
const sessionStore = new SequelizeStore({db})
const PORT = process.env.PORT || 3000
const app = express()
const socketio = require('socket.io')
const axios = require('axios');
const {User, Review, Order, productInstance, Product, Category, ProductCategory} = require('../server/db/models');
module.exports = app

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
if (process.env.NODE_ENV !== 'production') require('../secrets')

// passport registration
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) =>
  db.models.user.findById(id)
    .then(user => done(null, user))
    .catch(done))

const createApp = () => {
  // logging middleware
  app.use(morgan('dev'))

  // body parsing middleware
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // compression middleware
  app.use(compression())

  // session middleware with passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'my best friend is Cody',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  // auth and api routes
  app.use('/auth', require('./auth'))
  app.use('/api', require('./api'))

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, '../public')))
  
  app.use('/logout', (req, res) => {
    console.log("destroying session");
    // req.session.destroy();
    req.session.cart = {};
    res.send("session destroyed")      
  })

  app.use('/', (req, res, next) => {
    if (req.session.passport) {
      // var url = `/api/users/${req.session.passport.user}`;
      // console.log("LINE 81: ", url);
      // axios.get(url).then(response => {
      //   console.log("LINE 82");
      //   console.log("user's current cart:", response.data.orders[-1]);
      // });
      // next();
      // if (!(req.session.user.lastorder.isCart)) {
      //   req.session.cart = req.session.user.lastorder;
      // }
    }
    if (!req.session.cart 
      || Object.keys(req.session.cart).length == 0) {
      console.log("no cart");
      Order.create(
        {
          isCart: true,
        },
        {
          include: [{
          model: productInstance, as: 'instances',
          required: false,
          include: [
            {
              model: Product
            }
          ]
        }]},
      ).then(order => {
        console.log("(Updated) no cart found! req.session: ", req.session, req.session.passport);
        if ('passport' in req.session) {
          console.log("passport found");
          console.log("setting userId of cart: ", order.userId);
          order.userId = req.session.passport.user;
          order.save().then(() => {
            req.session.cart = order;
            res.sendFile(path.join(__dirname, '../public/main.html'))
          })
        }
        else {
          console.log("no passport found");
          req.session.cart = order;
          res.sendFile(path.join(__dirname, '../public/main.html'))
        }
      })
    }
    else {
      console.log("existing cart found! req.session: ", req.session);
      // req.session.cart
      res.sendFile(path.join(__dirname, '../public/main.html'))      
    }
    // res.json({});
    // res.sendFile(path.join(__dirname, '../public/template/main.html'))
  })


  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    next()
    if (path.extname(req.path).length) {
      // const err = new Error('Not found')
      // err.status = 404
      // next(err)
    } else {
      next()
    }
  })

  // sends index.html

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = () => {
  // start listening (and create 'server' object representing our server)
  const server = app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))

  // set up our socket control center
  const io = socketio(server)
  require('./socket')(io)
}

const syncDb = () => db.sync()

// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  sessionStore.sync()
    .then(syncDb)
    .then(createApp)
    .then(startListening)
} else {
  createApp()
}
