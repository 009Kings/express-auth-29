const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res) => {
  db.user.findOrCreate({
    where: {
      email: req.body.email
    }, defaults: {
      name: req.body.name,
      password: req.body.password
    }
  }).then(([user, created]) => {
    if (created) {
      console.log('user created');
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Thanks for signing up!'
      })(req, res);
    } else {
      console.log('email already exists');
      req.flash('error', 'Email already exists')
      res.redirect('/auth/signup');
    }
  }).catch(err => {
    console.log('💩 Error occured finding or creating user');
    console.log(err);
    req.flash('error', err.message);
    res.redirect('/auth/signup');
  });
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // if authentication failed, err: null and user: false
    if (!user) {
      req.flash('error', 'Invalid Username or password');
      req.session.save(() => {
        return res.redirect('/auth/login');
      });
    }
    // If an exception is thrown, error will have VALUE and we'll want to call next with the error
    if (err) { return next(err) }
    // If authenticated, user has VALUE, if we're at this line of code, then the user is truthy and err is falsey
    req.login(user, error => {
      if (error) next(error)
      req.flash('success', 'You are Valid');
      req.session.save(() => {
        return res.redirect('/');
      });
    })
  })(req, res, next);
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome!',
  failureFlash: 'Invalid username or password'
}));

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Smell ya later!');
  res.redirect('/');
});

module.exports = router;
