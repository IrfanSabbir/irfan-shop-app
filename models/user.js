const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
   
    email:{
        type : String,
        required : true 
    },
    password :{
        type : String,
        required : true
    },
    resetToken : String,
    resetTokenExpiration: Date,
    cart: {
        items: [
          {
            productId: { type: Schema.Types.ObjectId,ref:'Product', required: true },
            quantity: { type: Number, required: true }
          }
        ]
      }
});

userSchema.methods.addToCart = function(product){

    const updatedCartItems = [...this.cart.items];
            let newQunatity =1;
            const cartProductIndex = updatedCartItems.findIndex(cp => {
                return cp.productId.toString() === product._id.toString();
            });
            if(cartProductIndex >= 0){
                newQunatity = updatedCartItems[cartProductIndex].quantity +1;
                updatedCartItems[cartProductIndex].quantity=newQunatity;
            }
            else{
                updatedCartItems.push({
                    productId : product._id ,
                    quantity : newQunatity
                });
            }
            const updatedCart = {items : updatedCartItems};
            
           this.cart = updatedCart;
           return this.save();
};

userSchema.methods.RemoveFromCart =  function(productId){
    const cartProduct = this.cart.items.filter(items =>{
        return items.productId.toString() !== productId.toString();
     });
     this.cart.items = cartProduct;
     return this.save();

};
userSchema.methods.clearCart = function(){
    this.cart = {items : []};
    return this.save();
};


module.exports = mongoose.model('User',userSchema );


// const mongodb = require('mongodb');

// const getDb = require('../util/database').getDb;

// class User {
//     constructor(name, email, cart, id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id= id;
//     }
//     save(){
//         const db= getDb();
//          return db.collection('users').insertOne(this)
//             .then(user =>{
//                // console.log(user);
//             })
//             .catch(err => console.log(err));
//     }
//     addToCart(product){
//         const updatedCartItems = [...this.cart.items];
       
//         let newQunatity =1;
//         const cartProductIndex = updatedCartItems.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         if(cartProductIndex >= 0){
//             newQunatity = updatedCartItems[cartProductIndex].quantity +1;
//             updatedCartItems[cartProductIndex].quantity=newQunatity;
//         }
//         else{
//             updatedCartItems.push({productId : product._id , quantity : newQunatity});
//         }
//         const updatedCart = {items : updatedCartItems};
//         const db= getDb();
//         return db.collection('users')
//           .updateOne(
//               {_id : new mongodb.ObjectId(this._id)},
//               {$set : {cart : updatedCart}})
//               .then(result =>{
//                //   console.log(result);
//               })
//               .catch(er => console.log(err));
//     }
    
//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(m =>{
//             return m.productId;
//         });
//         return db.collection('products')
//              .find({ _id: { $in: productIds } })
//              .toArray()
//              .then(products =>{
//                 return products.map(p => {
//                     return {
//                     ...p,
//                      quantity : this.cart.items.find(i =>{
                         
//                         return i.productId.toString() == p._id.toString();
//                         }).quantity 
//                    };

//                  });
//              });
             
//     }
//  deleteCartItem(productId){
//      const cartProduct = this.cart.items.filter(items =>{
//          return items.productId.toString() !== productId.toString();
//      });
//      const db= getDb();
//      return db.collection('users')
//      .updateOne(
//          { _id : new mongodb.ObjectId(this._id)},
//         {$set : {cart : { items : cartProduct}}
//          }) ;
//   }
  
//   addOrder(){
//      const db = getDb();

//     return this.getCart()
//       .then(products =>{
//           const orders = {
//               items :  products,
//               user :{
//                   _id : new mongodb.ObjectId(this._id),
//                   name : this.name
//               }
//           };
//           return db.collection('orders').insertOne(orders);
//       })
//        .then(reesult =>{
//          this.cart= {items : []} ;
//          return db.collection('users')
//           .updateOne({_id : new mongodb.ObjectId(this._id)},
//           { $set :{ cart :{items:[]} }}
//           );
//        });
     
//   }
  
//     getOrder(){
//         const db = getDb();
//         return db.collection('orders').find({'user._id' : this._id}).toArray();
//     }

//     static findById(id){
//         const db= getDb();
//         return db.collection('users').
//            findOne({_id : new mongodb.ObjectId(id)})
//            .then((user) =>{
//                //console.log(user);
//                return user;
//            })
//            .catch(err => console.log(err));

//     }


// }

// module.exports = User;