var db = require('../config/connection')
var uuid = require('uuid');
const objectId = require('mongodb').ObjectId;
const { ObjectId } = require('bson');
var moment = require('moment'); 


module.exports = {
    addProduct: (product) => {
        return new Promise((resolve, reject) => {
            let id = uuid.v4()
            product._id = id
            product.price = parseInt(product.price)
            product.qty = parseInt(product.qty)
            console.log(product);

            db.get().collection("product").insertOne(product, (err, data) => {

                resolve(id)


            })

        })

    },
    viewProduct: (data) => {
      

        return new Promise(async (resolve, reject) => {

            let result = await db.get().collection("product").find({ "category": data }).toArray()

            resolve(result)

        })
    },

    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {

            let result = await db.get().collection("product").find({}).toArray()

            resolve(result)

        })
    },
    deleteProduct: (data) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection("product").remove({ "_id": data }).then((result) => {
              

                resolve(result)
            })



        })
    },
    findProduct: (id) => {
        return new Promise(async (resolve, reject) => {

         
            let result = await db.get().collection("product").find({ _id: id }).toArray()
         
            if (result) {
                
                resolve(result)

            }
            else {
                
                resolve("Invalid url")
            }


        })


    },
    findProductByName: (name) => {
        console.log(name);
        return new Promise(async (resolve, reject) => {

         
            let result = await db.get().collection("product").find({ sub_category: name }).toArray()
         
            if (result) {
                
                resolve(result)

            }
            else {
                
                resolve("Invalid url")
            }


        })


    },
    updateProduct: (id) => {
        let res = id._id;
      
        return new Promise(async (resolve, reject) => {
            await db.get().collection("product").updateOne({ _id: id._id }, {
                $set: {
                    product_name: id.product_name,
                    category: id.category,
                    description: id.description,
                    price: id.price,
                    sub_category: id.sub_category,
                    qty: id.qty

                }
            }).then((result) => {
              
                resolve(res)
            })
        })
    },
    addCategory: (name) => {

        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").findOne({ category: name })
           
            if (!result) {
                db.get().collection("categories").insertOne({ category: name, subcategories: [] }).then((result) => {
                    resolve(true)
                })

            } else {
                resolve(false)

            }


        })
    },
    deleteCategory: (name) => {
       

        return new Promise(async (resolve, reject) => {

            db.get().collection("categories").remove({ category: name }).then((result) => {
                resolve(true)


            })



        })
    },
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").find({}).toArray()
            resolve(result)

        })

    },
    viewSubcategory: (data) => {

        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").find({ "category": data }).toArray()
            resolve(result)

        })
    },
    updateSubcategory: (oldValue, newValue) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection("categories").updateOne({ "subcategories.name": oldValue }, { $set: { "subcategories.$.name": newValue } }).then((result) => {
               

                resolve(result)
            })

        })


    },
    addSubcategory: (cat, sub_cat) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").findOne({ category: cat, "subcategories.name": sub_cat })
           
            if (!result) {
                await db.get().collection("categories").updateOne({ category: cat }, { $push: { "subcategories": { name: sub_cat } } }).then((result) => {
                    resolve(true)
                })
            }
            else {
                resolve(false)
            }
        })
    },
    deleteSubcategory: (name) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection("categories").update({}, { $pull: { subcategories: { $in: [{ "name": name }] } } }, { multi: true }).then((result) => {
              

                resolve(result)
            })
        })
    },
    addtoCart: (userid, prodid) => {
       
        let proOb = {
            item: prodid,
            quantity: 1,
            staus:"placed"
        }

    
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection("cart").findOne({ user: userid })

          

            if (user) {
                let proExsist = user.products.findIndex(product => product.item == prodid)
               
                if (proExsist != -1) {
                    db.get().collection("cart")
                        .updateOne({ user: userid, 'products.item': prodid },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve(true)
                        })
                }
                else {
                  

                    db.get().collection("cart").updateOne({ user: userid }, {
                        $push: { products: proOb }
                    }).then(() => {
                        resolve(true)
                    })
                }

            }
            else {
                let cartobj = {
                    user: userid,
                    products: [proOb]
                }
               
                db.get().collection("cart").insertOne(cartobj).then((result) => {
                    resolve(true)
                })
            }
        })
    },
    deletecart: (id) => {
        return new Promise((resolve, request) => {
            db.get().collection("cart").update({}, { $pull: { products: { item: id } } }, { multi: true }).then((result) => {
                resolve(true)
            })

        })

    },
    getCartProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
          
            let cartitem = await db.get().collection("cart").aggregate([
                {
                    $match: { user: userid }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: 1,subtotal:{$multiply:['$quantity','$products.price']},off_subtotal:{$multiply:['$quantity','$products.offer_price']}
                    }
                },
                



            ]).toArray()

            let offer_total=0
           
            for(let i=0;i<cartitem.length;i++){
            
                if (cartitem[i].off_subtotal) {
                    offer_total+=cartitem[i].off_subtotal
                    
                }
                else{
                    offer_total+=cartitem[i].subtotal
                }
              


            }
           
           

         
            if (cartitem) {

                resolve([cartitem,offer_total])
            } else (
                reject(false)
            )
        })

    },


    getTotalAmount: (userid) => {
        console.log("user id vannuuu " + userid);

        return new Promise(async (resolve, reject) => {
       
            let total = await db.get().collection("cart").aggregate([
                {
                    $match: { user: userid }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }
                
                
            ]).toArray()
            
            console.log("cart totalll",total);
            let offer_total=0
           
            for(let i=0;i<total.length;i++){
            
                if (total[i].products.offer_price) {
                    offer_total+=(total[i].products.offer_price*total[i].quantity)
                    
                }
                else{
                    offer_total+=(total[i].products.price*total[i].quantity)
                }
              



            }
            console.log("$$$$",offer_total);
            total={
                _id:null,
                total:offer_total,
            }


            if (total) {

                resolve(total)
            } else (
                reject(false)
            )
        })
    },
    // getSubAmount: (userid) => {
    //     console.log("user id vannuuu " + userid);

    //     return new Promise(async (resolve, reject) => {
       
    //         let subtotal = await db.get().collection("cart").aggregate([
    //             {
    //                 $match: { user: userid }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'product',
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, products: { $arrayElemAt: ['$product.price', 0] }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id:null,
    //                      total: { $multiply: ['$quantity', '$products'] }
    //                 }
    //             },
             


    //         ]).toArray()
    //         console.log(subtotal);
          
    //         if (subtotal) {

    //             resolve(subtotal)
    //         } else (
    //             reject(false)
    //         )
    //     })
    // },

    cartCount: (userid) => {
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection("cart").find({ user: userid }).toArray()
            if (user[0]) {
                let cart_count = user[0].products.length
                resolve(cart_count)
            }
            else {
                resolve(0)
            }

        })
    },
    changeQuantity: (cartid, prodid, count, qty) => {
        count = parseInt(count)
        qty = parseInt(qty)
      



        return new Promise((resolve, reject) => {

            if (count == -1 && qty == 1) {
             

                db.get().collection("cart").update({}, { $pull: { products: { _id: objectId(cartid) } } }, { multi: true }).then((result) => {
                    resolve(false)
                })

            } else {

                db.get().collection("cart")
                    .updateOne({ _id: objectId(cartid), 'products.item': prodid },
                        {
                            $inc: { 'products.$.quantity': count }
                        }
                    ).then(() => {

                        resolve(true)
                    })
            }


        })

    },
    placeOrder: (sel,address, products, total_amount) => {
        console.log("sadddddd",products);
      
   if(sel.sudden){
    return new Promise((resolve, reject) => {
           
        let ok = address.mode == "cod" ? 'placed' : 'pending'
        let orderObj = {
            delivery_address: {
                name: sel.name,
                email: sel.email,
                city: sel.city,
                pin: sel.pin,
                address: sel.address,
                state: sel.state,
               
            },
            userid: address.userid,
            payment:address.mode,
            amount: total_amount.total,
            products: products,
            status: ok,
            date:moment().format('mmmm do yyyy, h:mm:ss a')

        }
        console.log("obj",orderObj);
        db.get().collection('orders').insertOne({ orderObj }).then(() => {
          
            resolve(true)
        })
    })
       
   }else{
        return new Promise((resolve, reject) => {
            console.log("??????",products);
           console.log("%%%%%%",total_amount);
            let ok = address.mode == "cod"|| address.mode == "p_pal" ? 'placed' : 'pending'
            let orderObj = {
                delivery_address: {
                    name: sel.name,
                    email: sel.email,
                    city: sel.city,
                    pin: sel.pin,
                    address: sel.address,
                    state: sel.state,
                },
                userid: address.userid,
                payment:address.mode,
                amount: total_amount.total,
                products: products,
                status: ok,
                date:moment().format('MMMM Do YYYY, h:mm:ss a')

            }
            console.log("VVVVVV{{{{",orderObj);
            db.get().collection('orders').insertOne({ orderObj }).then((result) => {
                if(address.mode=="cod"||address.mode=="p_pal"){
                    
                            db.get().collection('cart').remove({ user: address.userid })
                            resolve(result.insertedId)

                }else{
                    resolve(result.insertedId)
                }

                
            })
        })
    }
    },

    deleteFinalcart:(userid)=>{
        return new Promise((resolve, reject) => {
            console.log(userid);

            db.get().collection('cart').remove({ user: userid })
            resolve()
        })

    },
    buynowplaceOrder: (s_add,address, products, total_amount) => {

    },
    getOrderDetials: (user) => {
        return new Promise(async(resolve,reject)=>{
           
            let ordered_items=await db.get().collection('orders').aggregate([
                {
                    $match: { "orderObj.userid": user}
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        quantity: '$orderObj.products.quantity',
                        status:'$orderObj.products.staus',
                        isCanceled:'$orderObj.products.isCancel',
                        isDelivered:'$orderObj.products.isDelivered'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1,status:1,isCanceled:1,isDelivered:1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }


            ]).toArray()
            console.log("oooooo",ordered_items);
          
            if(ordered_items){

                resolve(ordered_items)
            }
            else{
                resolve(false)

            }


        })



    },
    getAllOrderDetials: () => {
        return new Promise(async(resolve,reject)=>{
           
            let ordered_items=await db.get().collection('orders').aggregate([
                {
                    $match: { }
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        userId:'$orderObj.userid',
                        payment:'$orderObj.payment',

                        quantity: '$orderObj.products.quantity',
                        status:'$orderObj.products.staus',
                        isCanceled:'$orderObj.products.isCancel',
                        isDelivered:'$orderObj.products.isDelivered',
                        date:"$orderObj.date",
                        amount:"$orderObj.amount"
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,userId:1,payment:1, quantity: 1,status:1,date:1,amount:1,isCanceled:1,isDelivered:1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }


            ]).toArray()
            console.log("oooooo",ordered_items);
          
            if(ordered_items){

                resolve(ordered_items)
            }
            else{
                resolve(false)

            }


        })



    },

    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let all_orders= await db.get().collection('orders').find({}).sort({}).toArray()
        
            resolve(all_orders)

        })

    },
    orderStatus:(user)=>{
        
        return new Promise(async(resolve,reject)=>{
            let order=await db.get().collection('orders').find({"orderObj.userid":user}).toArray()
           
                 resolve(order[0].orderObj.status)

           

        })

    },
    getCartProductList: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection('cart').find({ user: userid }).toArray()
            resolve(cart[0].products)
        })

    },

    changestatus:(id,proid,newVal)=>{
        console.log(id);
        return new Promise (async(resolve,reject)=>{
            if(newVal=="Order Canceled"||newVal=="Delivered"||newVal=="User cancelled"){
                db.get().collection('orders').updateOne({_id:ObjectId(id),"orderObj.products.item":proid},{$set:{"orderObj.products.$.staus":newVal,"orderObj.products.$.isCancel":true,"orderObj.products.$.isDelivered":true}}).then((result)=>{
                    console.log(result);
                    resolve(true)
                })

            }
            else{
                
                db.get().collection('orders').updateOne({_id:ObjectId(id),"orderObj.products.item":proid},{$set:{"orderObj.products.$.staus":newVal,"orderObj.products.$.isCancel":false,"orderObj.products.$.isDelivered":false}}).then((result)=>{
                    console.log(result);
                    resolve(true)
                })
            }
        })

    },
    getOfferProducts:(id)=>{
        console.log("iddd",id);
        return new Promise (async(resolve,reject)=>{
            let result= await db.get().collection('product').find({_id:id}).toArray()
            console.log(result);
            resolve(result[0])
        })

    },
    deleteOffer:(id)=>{
        console.log("iddd",id);
        return new Promise (async(resolve,reject)=>{
           db.get().collection('product').updateOne({_id:id},{$unset:{exp_date:1,off:1,offer:1,offer_price:1}}).then((result)=>{
               console.log(("delete aaayii",result));
               resolve(true)
           })
        })

    },
    addOffer:(id,price,per,date)=>{
      
        
        let off_price=price-(price*per/100)

        console.log("offer",off_price);
        return new Promise((resolve,reject)=>{
            db.get().collection('product').update({_id:id},{$set:{offer:true,off:per,offer_price:off_price,exp_date:date}}).then((res)=>{
                
                console.log(res);
                resolve(res)
            })
        })

    },
    addCatOffer:async(sub,per,date)=>{
        exp_date=new Date(date)
        console.log("date2",date);


       return new Promise(async(resolve,reject)=>{
         let products=await db.get().collection('product').find({sub_category:sub}).toArray()
         console.log("sadasd",products);
         console.log("###",sub,per,date);
         for(let i=0;i<products.length;i++){
             if (products[i].offer) {
                if(products[i].off<per){
                    products[i].off=per
                    
                    let off=products[i].price*per/100
                    console.log("price",off);
                    products[i].exp_date=exp_date
                    
                    products[i].offer_price+=off
                }   
              

             }
             else{
                 products[i].offer=true
                products[i].off=per
                products[i].offer_price=products[i].price-products[i].price*per/100
                products[i].exp_date=exp_date
             }
              db.get().collection('product').updateOne({_id:products[i]._id},{$set:{exp_date:products[i].exp_date,off:products[i].off,offer:true,offer_price:products[i].offer_price}})
             
             
            }
            


        })  
  
    },
    validateCoupon:(code,total)=>{
        return new Promise (async(resolve,reject)=>{
        let coupon=await db.get().collection('coupon').find({code:code}).toArray()
        if(coupon[0]){
            console.log(coupon[0]);
            console.log(coupon[0].min,total);
            if (coupon[0].min_amount<=total) {
                off_price=total-total*coupon[0].off/100
                resolve({coupon:true,amount:off_price,mes:"Coupon Applied"})
            }
            else{
                resolve({coupon:false,mes:`Valid for Minimum ${coupon[0].min_amount} ` })
            }

        }else{
            resolve({coupon:false,mes:"Invalid Coupon"})
        }
        })
    },



    viewOrderDetails:(id)=>{
        console.log("iddd",id);
        return new Promise (async(resolve,reject)=>{
            let ordered_items=await db.get().collection('orders').aggregate([
                {
                    $match: { _id: ObjectId(id)}
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        quantity: '$orderObj.products.quantity',
                        status:'$orderObj.products.staus',
                        isCanceled:'$orderObj.products.isCancel',
                        isDelivered:'$orderObj.products.isDelivered'

                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1,status:1,isCanceled:1,isDelivered:1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log("agrrrr",ordered_items);
            resolve(ordered_items)

        })

    }


}