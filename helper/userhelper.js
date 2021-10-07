var db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectId

module.exports={
    userSignup:(data)=>{
        return new Promise(async(resolve,reject)=>{

            let users=await db.get().collection('users').findOne({email:data.email})
            if(!users){

                data.password= await bcrypt.hash(data.password,10)
        db.get().collection('users').insertOne(data).then((data)=>{
            console.log("******Data inserted*****");
            let message={
                mes:"Data inserted",
                status:true
            }
           
            resolve(message)
        })

       }
       else{
           console.log("&&&&&exist***");
           let message={
            mes:"User exist",
            status:false
           
        }
        resolve(message)
       }
        })

    },

    userSignin:(data)=>{
        return new Promise(async(resolve,reject)=>{
    
            var d= await db.get().collection("users").findOne({"email":data.email})
            if(!d){
               
                    resolve(false)
                    console.log("Something fishyyyyyyyyyy");
                
    
            }
            
            else if(d.blocked){
                resolve("block")
                console.log(d.blocked);
                console.log("BOLCKAAAANUUUUUUUUU");

            }
            
            else if(d){
               bcrypt.compare(data.password,d.password,(err,res)=>{
                   if(err){
                    console.log("errr",err);
                    console.log("Passwoorddd thettanuuuuu");
                   }                    
                   else{
                       console.log("Email inndd password correcr");
                    resolve(res)
                   } 
               })
               
            }
           
        })
    },
    viewProducts:(data)=>{
        return new Promise(async(resolve,reject)=>{

            let result= await db.get().collection("product").find({"sub-category":"Shrits"}).toArray()
            resolve(result)
       
        })
        
    },

    viewUsers:()=>{

        return new Promise(async(resolve,reject)=>{

            let result= await db.get().collection("users").find().toArray()
            console.log(result);
            resolve(result)
       
        })

    },
    blockUser:(id)=>{

        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection('users').findOne({"_id":objectId(id)})
            let status=users.blocked
            db.get().collection('users').updateOne({"_id":objectId(id)},{$set:{blocked:!status}}).then((result)=>{
                   resolve(result)
        })
        
            

        })

    }
   
        
    




}