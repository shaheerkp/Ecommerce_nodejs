var db = require('../config/connection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const { LoopDetected } = require('http-errors')

module.exports = {

    getNumber:(num)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection('users').findOne({Number:num})
            if(user){
                resolve(user)
            }
            else{
                resolve(false)
                        }

        })

    },
    googleSign: (gmail) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection('users').findOne({ email: gmail })
            console.log(user);
            if (!user) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    },
    userSignup: (data) => {
        return new Promise(async (resolve, reject) => {
            
           console.log(data);
           data.blocked=false;
            let users = await db.get().collection('users').findOne({ email: data.email })
            if (!users) {

                data.password = await bcrypt.hash(data.password, 10)
                db.get().collection('users').insertOne(data).then((data) => {
                    console.log("******Data inserted*****");
                    let message = {
                        mes: "Data inserted",
                        status: true
                    }

                    resolve(message)
                })

            }
            else {
                console.log("&&&&&exist***");
                let message = {
                    mes: "User exist",
                    status: false

                }
                resolve(message)
            }
        })

    },
    googleSignin: (data) => {
        console.log(data);
        let email=data.email
        return new Promise(async (resolve, reject) => {
            if (data.email_verified) {
                var d = await db.get().collection("users").findOne({ "email": email })
                if (!d) {
                   let user={
                       blocked:false,
                       firstname:data.given_name,
                       lastname:data.family_name,
                       email:data.email,
                       password:null,
                       number:null

                   }
                   db.get().collection("users").insertOne(user)
                   resolve(user)
                    
                   
    
                } else {
                    resolve(d)
        
                }
                
            }
          

        })
    },

    userSignin: (data) => {
        return new Promise(async (resolve, reject) => {

            var d = await db.get().collection("users").findOne({ "email": data.email })
            if (!d) {

                resolve(false)
                console.log("Something fishyyyyyyyyyy");


            }

            else if (d.blocked) {

                resolve("block")
                console.log(d.blocked);
                console.log("BOLCKAAAANUUUUUUUUU");

            }

            else if (d) {
                console.log(data.password);
                console.log(d.password);
                bcrypt.compare(data.password, d.password, (err, res) => {
                    console.log("Passwooooord okkk anooo");
                    
                    
                    console.log(res);

                    if (!res) {
                        console.log("errr", res);
                        console.log("Passwoorddd thettanuuuuu");
                        resolve(res)
                    }
                    else {
                        console.log("Email inndd password correcr");
                        resolve(d)
                    }
                })

            }

        })
    },
    viewProducts: (data) => {


        return new Promise(async (resolve, reject) => {

            let result = await db.get().collection("product").find({ "sub_category": data }).toArray()
            resolve(result)

        })

    },
    getuserAddress:(eml)=>{
        return new Promise(async (resolve,reject)=>{
            let address=await db.get().collection("address").find({email:eml}).toArray()
            resolve(address)

        })
            
    },
    getAddress:(add_id,eml)=>{
        return new Promise(async(resolve,reject)=>{
            let address=await db.get().collection("address").findOne({email:eml},{address:{$eleMatch:{id:add_id}}})
            resolve(address)
        })
    },
    addAddress:(data)=>{
        return new Promise(async(resolve,reject)=>{
       
            console.log(data);
            let eml=data.email
           let user= await db.get().collection('address').find({email:eml}).toArray()
       
           if(user[0]){
               
               db.get().collection('address').updateOne({email:eml},{$push:{address:data}})
               resolve(true)
           }
           else{
               db.get().collection('address').insertOne({email:eml,address:[data]})
               resolve(true)
           }
          

        })
    },
    deleteAddress:(eml,i)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('address').update({email:eml},{$pull:{address:{id:i}}}).then((result)=>{
                resolve(true)
            })
        })


    },

    viewUsers: () => {

        return new Promise(async (resolve, reject) => {

            let result = await db.get().collection("users").find().toArray()
            resolve(result)

        })

    },
    blockUser: (id) => {

        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection('users').findOne({ "_id": objectId(id) })
            let status = users.blocked
            db.get().collection('users').updateOne({ "_id": objectId(id) }, { $set: { blocked: !status } }).then((result) => {
                resolve(result)
            })



        })

    }







}