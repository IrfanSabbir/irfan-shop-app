const express = require('express');

const { check, body } = require('express-validator/check');

const router = express.Router();

const authController = require('../controllers/auth');

const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login', 
check('email').isEmail()
.withMessage('Please email doesnt available, input valid mail')
.custom((value, {req})=>{
    return User.findOne({email : value})
    .then(user => {
      if(!user){
        return Promise.reject('Email is already in use');
      }
    });
}).normalizeEmail()
,
body('password', 'Please add password that is longer then 5 and is valid')
.isLength({min : 5})
.isAlphanumeric().trim(),
authController.postLogin);

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignUp);

router.post('/signup',
check('email')
.isEmail()
.withMessage('Please enter a valid Email.')
.custom((value, {req}) =>{
    return User.findOne({email : value})
    .then(userDoc =>{
      if(userDoc){
       return Promise.reject('Email is already in use');
      }
   })
}).normalizeEmail(),
body('password', 'Please add password that is longer then 5 and is valid')
.isLength({min : 5})
.isAlphanumeric().trim(),
body('confirmPassword').trim()
.custom((value ,{ req})=>{
    if(value !== req.body.password ){
        throw new Error('Password should be same, they dont match');
        
    }
    return true;
}),

authController.postSigUp);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset)

router.get('/reset/:token',authController.getUpdatePassword);

router.post('/update-password',authController.postUpdatePassword);

module.exports = router;