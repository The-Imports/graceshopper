const router = require('express').Router()
const {User, Order} = require('../db/models/index')
module.exports = router

router.post('/login', async (req, res, next) => {
  User.findOne({where: {email: req.body.email}})
    .then(user => {
      if (!user) {
        res.status(401).send('User not found')
      } else if (!user.correctPassword(req.body.password)) {
        res.status(401).send('Incorrect password')
      } else {
        if ('cart' in req.session && Object.keys(req.session.cart).length > 0) {
          console.log('cart in req.session');
          Order.findById(req.session.cart.id).then(thisCart => {
            thisCart.setUser(user.id);
            thisCart.save().then(() => {
              req.session.cart = thisCart; //"update cart"
              req.login(user, err => (err ? next(err) : res.json(user)))
            });
          });
        }
        else {
          user.findCart().then(cart => {
            if (cart) {
              req.session.cart = cart;
            }
            req.login(user, err => (err ? next(err) : res.json(user)))            
          })
        }
      }
    })
    .catch(next)
})

router.post('/signup', (req, res, next) => {
  console.log("req.body signup: ", req.body);
  User.create(req.body) 
    .then(user => {
      user.isAdmin = true; //For testing purposes only
      user.save().then(user => {
        console.log("ran")
        req.login(user, err => (err ? next(err) : res.json(user)))
      })            
    })
    .catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(401).send('User already exists')
      } else {
        next(err)
      }
    })
})

router.post('/change-password', (req, res, next) => {
  // console.log(req.session);
  // res.json(req.session)
  const password = req.body.password;
  User.findById(req.session.passport.user)
  .then(user => {
    user.update({password})
    req.login(user, err => (err ? next(err) : res.json(user)))
  })
  .catch(next)

})

router.post('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

router.get('/me', (req, res) => {
  res.json(req.user)
})

router.use('/google', require('./google'))
