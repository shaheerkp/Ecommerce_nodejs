var db=require('../config/connection')
var uuid = require('uuid');
const objectId=require('mongodb').ObjectId

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
    },
    findProduct:(id)=>{
        return new  Promise(async(resolve,reject)=>{
            let result= await db.get().collection("product").find({"_id":id}).toArray()
            console.log(result[0])
            if (result[0]){
                console.log("YEs I Found The Productsssssssssss");
                console.log(result)
                resolve(result)

            }
            else{
                console.log("product ilaaaaaaa");
                console.log(result)
                reject("Invalid url")
            }
           

        })
        

    },
    viewCategory:(data)=>{

        return new Promise(async(resolve,reject)=>{
            let result= await db.get().collection("categories").find({}).toArray()
            resolve(result)

        })
    },
    viewSubcategory:(data)=>{

        return new Promise(async(resolve,reject)=>{
            let result= await db.get().collection("categories").find({"category":data}).toArray()
            resolve(result)

        })
    },
    updateSubcategory:(oldValue,newValue)=>{
        return new Promise(async(resolve,reject)=>{
             await db.get().collection("categories").updateOne({"subcategories.name":oldValue},{$set:{"subcategories.$.name":newValue}}).then((result)=>{
                 console.log(result);
                 
                 resolve(result)
             })

        })
       

    },
    addSubcategory:(cat,sub_cat)=>{
        return new Promise(async(resolve,reject)=>{
            let result =await db.get().collection("categories").findOne({category:cat,"subcategories.name":sub_cat})
            console.log(result);
            if(!result){
               await db.get().collection("categories").updateOne({category:cat},{$push:{"subcategories":{name:sub_cat}}}).then((result)=>{
                    
                    
                    resolve(true)
                })
            }
            else{
                resolve(false)        }
          
             

        })
       

    },
    deleteSubcategory:(name)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection("categories").update({},{$pull:{subcategories:{$in:[{"name":name}]}}},{multi:true}).then((result)=>{
                 console.log(result);
                 
                 resolve(result)
             })

        })
       

    },
   
    

    
}