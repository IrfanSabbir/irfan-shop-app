const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const Product = require('../models/product');

const { validationResult } = require('express-validator/check');


exports.getAddProduct= (req, res, next) =>{
    res.render('admin/edit-product',{
        pageTitle:'add product',
        path : '/admin/add-product',
        editing: false,
        errorMessage:'',
        haserror : false,
        validationError: []
    })
};

exports.postAddProduct = (req, res, next) =>{
   
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
     if(!image){
        return res.status(422).render('admin/edit-product',{
            pageTitle:'add product',
            product : {
                title : title,
                price :price,
                description : description
            },
            haserror : true,
            errorMessage :'Image is invalid or empty !',
            editing :false,
            validationError : [],
            path : '/admin/add-product'
            
        })
     }
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).render('admin/edit-product',{
            pageTitle:'add product',
            product : {
                title : title,
                price :price,
                description : description
            },
            haserror : true,
            errorMessage :error.array()[0].msg,
            editing :false,
            validationError : error.array(),
            path : '/admin/add-product'
            
        })
    }
    const imageUrl = image.path;
    const product = new Product({
        
        title : title,
        price : price,
        description: description,
        imageUrl : imageUrl,
        userId : req.user
    });
    product.save()
    .then(result => {
      console.log(result);
      res.redirect('/admin/products');
    })
    .catch(err => {
     // console.log(err);
    //  res.redirect('/500')
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
    });
   
};

exports.getEditProduct = (req, res, next)=>{
    const editMode  = req.query.edit;
    if(!editMode ){
       return res.redirect('/');
    }
    const prodId= req.params.productId;
    Product.findById(prodId)
        .then(product =>{
            if(!product){
               res.redirect('/');
            }
           
        res.render('admin/edit-product',{
            pageTitle :'Edit Product',
            product : product,
            editing :editMode,
            haserror: false,
            errorMessage :'',
            validationError : [],
            path : '/admin/edit-product'
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.postEditProduct = (req,res,next)=>{
    const productId= req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).render('admin/edit-product',{
            pageTitle:'Edit product',
            product : {
                title : updatedTitle,
                description : updatedDescription,
                _id : productId
            },
            haserror : true,
            errorMessage :error.array()[0].msg,
            editing :true,
            validationError : error.array(),
            path : '/admin/edit-product'
            
        })
    }
    Product.findById(productId).then(product =>{
        if(product.userId.toString() !==  req.user._id.toString()){
            return res.redirect('/');
        }
        product.title =updatedTitle;
        product.price = updatedPrice;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.description = updatedDescription;
        return product.save().then(result =>{
            console.log("updated");
            res.redirect('/admin/products');
    
            })
    })
       
    .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getPrduct= (req, res, next)=>{
   Product.find({userId : req.user._id})
   //.populate('userId', 'name email')
   .then(products =>{ 
   //    console.log(products)
        res.render('admin/products',{
            pageTitle:'products',
            prods : products,
            path : '/admin/products'
           });

    })
    .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    };

    exports.deleteProduct = (req,res,next)=>{
        const prodId = req.params.productId;
        Product.findById(prodId)
        .then(product =>{
            if(!product){
               return next(new Error('No product Found'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({_id : prodId, userId : req.user._id})

        })
        
        .then(result =>{
                res.status(200).json({message : 'Successfull'});
            })
            .catch( err => {
                res.status(500).json({message : 'Deletion Failed'});
            });

        
    }
