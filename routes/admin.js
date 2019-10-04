const express = require('express');
const { body } = require('express-validator/check');
 
const path = require('path');

const router = express.Router();

const productControll = require('../controllers/admin');


const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, productControll.getAddProduct);

 router.get('/products', isAuth, productControll.getPrduct);

router.post('/add-product',
[
    body('title','Title is not proper').isLength({min : 3}).isString().trim(),
    body('price','price should be float number').isFloat(),
    body('description','description is not must be minimum 5 and maximum 400').isLength({min : 5, max :400})
]
,
 isAuth, productControll.postAddProduct);

router.get('/edit-product/:productId', isAuth, productControll.getEditProduct);

 router.post('/edit-product',
 [
    body('title','Title is not proper').isLength({min :3}).isString().trim(),
    body('price','price should be float number').isFloat(),
    body('description','description is not must be minimum 5 and maximum 400').isLength({min : 5, max :400})
],
 isAuth,productControll.postEditProduct);

 router.delete('/product/:productId',isAuth, productControll.deleteProduct);

module.exports = router;


