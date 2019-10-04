const fs= require('fs');
const path = require('path');

const pdfDocomentation = require('pdfkit');
const stripe = require('stripe')(`${process.env.STRIPE_KEY}`);
const Product = require('../models/product');
const Order = require('../models/order');
const page_limit =2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalPage;
Product.find().countDocuments()
.then(numProduct=>{
  totalPage = numProduct;
  return Product.find()
  .skip((page-1) *page_limit)
  .limit(page_limit);
})
  .then(products =>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Productsp',
      path: '/products',
      currentPage : page,
      totalProducts : totalPage,
      hasNextPage : page * page_limit< totalPage,
      hasPrevious : page>1,
      nextPage : page+1,
      prevousPage : page-1,
      lastPage : Math.ceil(totalPage/page_limit)
    });
  })
  .catch( err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
  
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(products =>{
    console.log(products);
    res.render('shop/product-detail', {
      product: products,
      pageTitle: products.title,
      path: '/products'
    });

  })
  .catch( err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});

};


exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalPage;
Product.find().countDocuments()
.then(numProduct=>{
  totalPage = numProduct;
  return Product.find()
  .skip((page-1) *page_limit)
  .limit(page_limit);
})
  .then(products =>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage : page,
      totalProducts : totalPage,
      hasNextPage : page * page_limit< totalPage,
      hasPrevious : page>1,
      nextPage : page+1,
      prevousPage : page-1,
      lastPage : Math.ceil(totalPage/page_limit)
    });
  })
  .catch( err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
  
};



exports.getCart = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(users =>{
     console.log(users.cart.items);
     const products = users.cart.items;
      res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
            });

    })
    .catch( err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
 
 
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
   .then(product=>{
    return req.user.addToCart(product);
   })
   .then(result =>{
     console.log(result);
     res.redirect('/cart');
   })
   .catch( err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});

};


exports.postDeleteCart = (req,res, next)=>{
  const prodId = req.body.productId;
  req.user.RemoveFromCart(prodId).then(newCart =>{
    res.redirect('/cart');
  })

};


exports.getCheckout =(req, res, next)=>{
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(users =>{
    
     const products = users.cart.items;
     let totalPrice=0;
     products.forEach(p=>{
      totalPrice+= p.quantity*p.productId.price;
     });
      res.render('shop/checkout', {
              path: '/checkout',
              pageTitle: 'checkout',
              products: products,
              totalSum: totalPrice
            });

    })
    .catch( err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
};

exports.postOrders = (req, res, next) => {
  const token = req.body.stripeToken; 
  let totalSum =0;
   req.user
   .populate('cart.items.productId')
   .execPopulate()
   .then(user =>{
     user.cart.items.forEach(p =>{
       totalSum += p.quantity * p.productId.price;
     })
     const products = user.cart.items.map(i =>{
      // console.log(user.cart.items);
       return {quantity : i.quantity , product : {...i.productId._doc}};
     });
     const order = new Order ({
       user :{
         email : req.user.email,
         userId : req.user._id
       },
       products :products
      });
        return order.save();
       })
        .then(result =>{
          const charge = stripe.charges.create({
            amount: totalSum * 100,
            currency: 'usd',
            description: 'Demo Order',
            source: token,
            metadata: { order_id: result._id.toString() }
          });
           return req.user.clearCart();
         })
           .then(() =>{
             res.redirect('/orders')
           })
           .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
     
};

exports.getOrders = (req, res, next)=>{
  Order.find({'user.userId' : req.user._id})
     .then(orders =>{
       console.log(orders);
      res.render('shop/orders', {
        orders : orders,
        path: '/orders',
        pageTitle: 'Your Orders'
       
      });
     })
     .catch( err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });

};

exports.getInvoice =(req, res, next)=>{
  const orderId= req.params.orderId;
 
  Order.findById(orderId)
  .then(orders =>{
    if(!orders){
      return next(new Error('No order found'));
    }
    if(orders.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('unauthorized'));
    }
    const invoiceName = 'invoice-'+orderId+ '.pdf'; 
    const invpoicePath = path.join('data','invoices',invoiceName);

    const pdfDoc = new pdfDocomentation();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Inline',
        'inline; filename="' + invoiceName + '"'
      );
    pdfDoc.pipe(fs.createWriteStream(invpoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize('26').text('INVOICE',{
      underline : true
    });
  pdfDoc.text('-----------------------------')
  pdfDoc.fontSize('14').text('Here is order Details !');
  let totalPrice = 0;
orders.products.forEach(prod =>{
   totalPrice += prod.quantity*prod.product.price;

   pdfDoc.fontSize('14').text(
     prod.product.title +
     ' - ' +
     prod.quantity +
     ' x ' +
     '$' +
     prod.product.price
   );
  
})
pdfDoc.text('---');
pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
pdfDoc.end();
  
  //   fs.readFile (invpoicePath, (err, data)=>{
  //     if(err){
  //       return next(err);
  //     }
  //      res.setHeader('Content-Type', 'application/pdf');
  //      res.setHeader(
  //         'Content-Disposition',
  //         'inline; filename="' + invoiceName + '"'
  //       );
  //       res.send(data);
      
  //   });
  })
  .catch(err=>{
     next(err)
  });

}
