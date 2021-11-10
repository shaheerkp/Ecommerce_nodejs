var mongoClient = require('mongodb').MongoClient;
const state={
    db:null
}

module.exports.connect=(callback)=>{
    var url = "mongodb+srv://shaheer:1234@ecom.t0nbn.mongodb.net/test";
    var dbname="Ecommerce"
    mongoClient.connect(url,(err,data)=>{
        if(err) return callback(err)
        state.db=data.db(dbname)
        callback()


    })

}

module.exports.get=()=>{
    return state.db
}
