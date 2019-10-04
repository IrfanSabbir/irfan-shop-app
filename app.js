const path =  require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');
const helmet= require('helmet');
const User = require('./models/user');
const errControllers = require('./controllers/err');
const compression = require('compression');
const morgan = require('morgan');

const MONGODB_URI =
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-bbsb6.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();

const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

const store = new MongoDbStore({
   uri : MONGODB_URI,
   collection : 'session'
});



const csrfProtection = csrf(); 


let count =0;
const fileStorage = multer.diskStorage({
  
  destination : (req, file, cb)=>{
     cb(null, 'images');
  },
  filename : (req, file, cb)=>{
    count++;
     cb(null, new Date().toISOString() +' ' +count +'-' + file.originalname);
  }
});

const fileFilter= (req, file, cb)=>{
 if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
  cb(null, true);
 }
 else{
  cb(null, false);
 }
};

app.set('view engine','ejs');
app.set('views','view');

const adminRouts = require('./routes/admin');
const shopRout = require('./routes/shop');
const authRout = require('./routes/auth');

const accessUserLog = fs.createWriteStream(
    path.join(__dirname,'access.log'),
    {flag:'a'}
  );

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream: accessUserLog}));

app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(multer({storage : fileStorage, fileFilter : fileFilter }).single('image'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));

app.use(session( {
    secret:'my-secret', 
    resave : false,
    saveUninitialized : false,
    store : store
  }));


  
  app.use(flash());

  app.use((req, res, next)=>{
    res.locals.isAuthenticated= req.session.isLoggedIn;
    next();
  });

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
    
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      //console.log(err)
      // throw new Error(err);
      next(new Error(err));
    });
});
app.post('/create-order', isAuth, shopController.postOrders);
app.use(csrfProtection);
app.use((req, res, next)=>{
  res.locals.scrfToken = req.csrfToken();
  next();
});
app.use('/admin',adminRouts);
app.use(shopRout);
app.use(authRout);


app.get('/500', errControllers.err500);

app.use(errControllers.err404);

app.use((error, req, res, next)=>{
//  res.redirect('/500');
  res.status(500).render('500',{
    pageTitle:'Error!',
    path : '/500',
    isAuthenticated : req.session.isLoggedIn
});
})
//"start": "MONGO_USER=Irfan MONGO_PASSWORD=AVOID12345 MONGO_DEFAULT_DATABASE=shop STRIPE_KEY=sk_test_gDu7t07xZH6Fn5G1CEs4Vzf900YCQ9HLlU node app.js",

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true })
  .then(result =>{

      app.listen(process.env.PORT || 3000);
  })


// mongoConnect(() =>{
  
//     app.listen(3000);
// });
