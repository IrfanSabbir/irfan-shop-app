const crypto = require('crypto');

const { validationResult } = require('express-validator/check');

const bcrypt= require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerSendGrid = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transport = nodemailer.createTransport(nodemailerSendGrid({
    auth: {
      api_key : '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'
    }
}));
exports.getLogin = (req, res, next) => {
    let message = req.flash('error') ;
    if(message.length >0){
      message = message[0];
    }
    else{
      message = null;
    }
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage : message,
      oldInput :{
        email :'',
        password : ''
      },
      validationError : []
    });
  };
  
  exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password =  req.body.password;
    const error = validationResult(req);
    if(!error.isEmpty()){
      res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage : error.array()[0].msg,
        oldInput :{
            email : email,
            password : password
        },
        validationError : error.array()
      });
    }
    User.findOne({ email: email })
    .then(user => {
     return  bcrypt
     .compare(password , user.password)
      .then(userFound =>{
        if(userFound){
          req.session.isLoggedIn = true;
          req.session.user = user;
          console.log("here");
          req.session.save(err => {
            console.log(err);
          });
          return res.redirect('/');
        }
       //req.flash('error', 'Password invalid');
          res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage : error.array()[0].msg,
            oldInput :{
                email : email,
                password : password
            },
            validationError : error.array()
          });
      })
    })
    .catch( err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
    
  };


  exports.postLogout = (req, res, next)=>{
   
      req.session.destroy(err =>{
          console.log(err);
          res.redirect('/');
      });
  };

  exports.getSignUp =(req, res, next)=>{
     let message = req.flash('error');
        if(message.length >0){
          message = message[0];
        }
        else{
          message = null;
        }
       res.render('auth/signup', {
         pageTitle : "Sign Up",
         path : '/signup',
         isAuthenticated : false,
         errorMessage : message,
         oldInput : {
          email : '',
          password : '',
          confirmPassword : ''
        },
        validationError: []
       })
  }

  exports.postSigUp = (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    error = validationResult(req);
    if(!error.isEmpty()){
      console.log(error.array());
      return res.status(422).render('auth/signup', {
        pageTitle : "Sign Up",
        path : '/signup',
        isAuthenticated : false,
        errorMessage : error.array()[0].msg,
        oldInput : {
          email : email,
          password : password,
          confirmPassword : req.body.confirmPassword
        },
        validationError: error.array() 
      })
    }
     bcrypt
        .hash(password, 12)
        .then(hashedPassword =>{
          const user = new User({
            email : email,
            password : hashedPassword,
            cart : { items :[] }
          }); 
           return user.save();
        })
        .then(result =>{
          req.flash('error', 'Signed up completed');
          res.redirect('/login');
          return transport.sendMail({
            to : email,
            from : "irfan@noreplay.com",
            subject :'signed Up',
            html : '<h1> You are successfullyb  signed up!</h1>'
          });
        })
        .catch( err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
     
  };

  exports.getReset = (req, res, next)=>{
    let message = req.flash('error');
        if(message.length >0){
          message = message[0];
        }
        else{
          message = null;
        }
      res.render ('auth/reset',{
        pageTitle : "Reset Password",
        path : '/reset',
        isAuthenticated : false,
        errorMessage : message
      })
  };

  exports.postReset= (req, res, next)=>{
    crypto.randomBytes(32, (err, buffer)=>{
      if(err){
          console.log(err);
          return ers.redirect('/reset');
      }
      const token = buffer.toString('hex');
      User.findOne({email : req.body.email})
      .then(user =>{
        if(!user){
          req.flash('error', 'No user Found for this mail');
          return res.redirect('/reset');
        }
        user.resetToken= token;
        user.resetTokenExpiration = Date.now()+ 3600000;
        return user.save();
      })
      .then(result =>{
        res.redirect('/');
        return transport.sendMail({
          to : req.body.email,
          from : "irfan@noreplay.com",
          subject :'Password Reset',
          html : `
            <p>You requested for password reset</p>
            <p>Click the <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
          `
        });
      })
      .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    });

  };

  exports.getUpdatePassword = (req, res, next)=>{
    const token = req.params.token;
    User.findOne({resetToken : token, resetTokenExpiration : {$gt :Date.now()}})
      .then(user =>{
        let message = req.flash('error');
        if(message.length >0){
          message = message[0];
        }
        else{
          message = null;
        }
        res.render('auth/update-password',{
          pageTitle :' new- Password',
          path:'/update-password',
          errorMessage : message,
          userId: user._id.toString(),
          passwordToken : token
        });
      })
      .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
  }

  exports.postUpdatePassword = (req, res, next)=>{
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    let resetUser;
    User.findOne({
       resetToken : passwordToken,
       _id: userId, 
       resetTokenExpiration :  {$gt : Date.now()}
      })
      .then(user =>{
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then(hashedPassword =>{
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          resetUser.save()
          .then(result =>{
            res.redirect('/login');
          });
      })
      .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

  }

  