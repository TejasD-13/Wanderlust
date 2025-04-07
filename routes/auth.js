const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

// Show login form
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Handle login logic
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: true
}), (req, res) => {
    // This callback is only called on successful authentication
    console.log('Login successful, redirecting to /listings');
    res.redirect('/listings');
});

// Show register form
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Handle register logic
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        req.login(newUser, err => {
            if (err) return next(err);
            res.redirect('/listings');
        });
    } catch (err) {
        next(err);
    }
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

module.exports = router;
