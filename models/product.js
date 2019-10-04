const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema ({
    title:{
        type : String,
        required : true
    },
    price:{
        type : Number,
        required : true
    },
    imageUrl :{
        type : String,
        required : true
    },
    description :{
        type : String,
        required : true
    },
    userId :{
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    }
});
module.exports = mongoose.model('Product',productSchema);


// const mongodb =  require('mongodb');
// const getDb = require('../util/database').getDb;


// class Product {
//   constructor(title, price, description, imageUrl, id, userId){
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }
//   save(){
//     const db= getDb();
//     let dbop;
//     if(this._id){
//       //Update
//        dbop = db.collection('products')
//          .updateMany({_id : this._id},{ $set: this});

//     }else{
//       // new insert
//       dbop =db.collection('products').insertOne(this);

//     }
//     return dbop
//       .then(result =>{
//         console.log(result);
//       })
//       .catch(err => console.log(err));
//   }
//   static fatchAll(){
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then( result =>{
//         return result;
//       })
//       .catch(err => console.log(err));
//   }
//   static findById(prodId){
//     const db = getDb(); 
//     return db
//       .collection('products')
//       .find({_id : new mongodb.ObjectId(prodId)})
//       .next()
//       .then(product =>{
//         console.log(product);
//         return product;
//       })
//       .catch(err => console.log(err));
//   }
//   static deleteById (id) {
//     const db= getDb();
//     return db.collection('products').deleteOne({_id : new mongodb.ObjectId(id)})
//       .then(result =>{
//         console.log("deleted");
//       })
//       .catch(err => console.log(err));
//    }
// }



// module.exports = Product;