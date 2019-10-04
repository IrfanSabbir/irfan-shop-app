const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callBack)=>{
    MongoClient.connect(
        'mongodb+srv://Irfan:AVOID12345@cluster0-bbsb6.mongodb.net/shop?retryWrites=true&w=majority',
        { useNewUrlParser: true })
        .then(client =>{
            _db = client.db();
            callBack();
        })
        .catch(err =>{
            console.log(err)
            throw err;
        });
};

const getDb =()=>{
  if(_db){
      return _db;
  } 
  else{
     throw "no data base foud "; 
  }
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', '12345' ,{
//     dialect : 'mysql',
//     host: 'localhost'
// });

// module.exports = sequelize; 



/*const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database : 'node-complete',
    password: '12345'

});

module.exports = pool.promise();*/