var db=require('../config/connection')
var uuid = require('uuid');

module.exports={
    addProduct:(product)=>{
        return new Promise((resolve,reject)=>{
            let id=uuid.v4()
            product._id=id
            console.log(id);

            db.get().collection("product").insertOne(product,(err,data)=>{
                
               resolve(id)


            })

        })
         
    },
    viewProduct:(data)=>{

        return new Promise(async(resolve,reject)=>{
            let result= await db.get().collection("product").find({"category":data}).toArray()
            resolve(result)

        })
    }
}