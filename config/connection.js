var mongoClient = require('mongodb').MongoClient;
const state={
    db:null
}

module.exports.connect=(callback)=>{
    var url = "mongodb://localhost:27017/mydb";
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
