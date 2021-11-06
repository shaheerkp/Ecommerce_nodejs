var db = require('../config/connection')
var uuid = require('uuid');
const objectId = require('mongodb').ObjectId;
const { ObjectId } = require('bson');
var moment = require('moment');
const { payment } = require('paypal-rest-sdk');


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
            staus: "placed"
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
    deletewishlist: (id) => {
        return new Promise((resolve, request) => {
            db.get().collection("wishlist").update({}, { $pull: { products: { item: id } } }, { multi: true }).then((result) => {
                resolve(true)
            })

        })

    },
    getWishlistProducts: (userid) => {
        return new Promise(async (resolve, reject) => {

            let wishlist = await db.get().collection("wishlist").aggregate([
                {
                    $match: { user: userid }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
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
                        item: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },

            ]).toArray()
            console.log("wishlist", wishlist);
            resolve(wishlist)
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
                        item: 1, quantity: 1, products: 1, subtotal: { $multiply: ['$quantity', '$products.price'] }, off_subtotal: { $multiply: ['$quantity', '$products.offer_price'] }
                    }
                },
            ]).toArray()

            let offer_total = 0

            for (let i = 0; i < cartitem.length; i++) {

                if (cartitem[i].off_subtotal) {
                    offer_total += cartitem[i].off_subtotal

                }
                else {
                    offer_total += cartitem[i].subtotal
                }



            }




            if (cartitem) {

                resolve([cartitem, offer_total])
            } else (
                reject(false)
            )
        })

    },

    getSingle: (userId, cartId, prodId) => {
        return new Promise(async (resolve, reject) => {
            let single = await db.get().collection("cart").aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $match: { 'products.item': prodId }
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
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        total: { $multiply: ['$quantity', '$product.price'] },
                        off_total: { $multiply: ['$quantity', '$product.offer_price'] },
                    }
                },
                // {
                //     $group: {
                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$product.price'] } },
                //         offertotal: { $sum: { $multiply: ['$quantity', '$product.offerprice'] } }
                //     }
                // },

            ]).toArray()
            console.log("___________________", single);
            resolve(single)
        })
    },


    getNewSalesReport: (type) => {
        const numberOfDays = type === 'weekly' ? 7 : type === 'monthly' ? 31 : type === 'yearly' ? 365 : type == "daily" ? 1 : 0

        console.log("number of days", numberOfDays);

        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection('orders').aggregate([
                {
                    $match: {
                        "orderObj.createdAt": { $gte: new Date(new Date() - numberOfDays * 60 * 60 * 24 * 1000) },
                    },
                },
            ]).toArray()
            console.log("___________", data);
            resolve(data)

        })
    },



    getTotalAmount: (userid) => {


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
            console.log("total" ,total);

            let offer_total = 0

            for (let i = 0; i < total.length; i++) {

                if (total[i].products.offer_price) {
                    offer_total += (total[i].products.offer_price * total[i].quantity)

                }
                else {
                    offer_total += (total[i].products.price * total[i].quantity)
                }




            }
            console.log("$$$$", offer_total);
            total = {
                _id: null,
                total: offer_total,
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

    placeOrder: (sel, address, products, total_amount, c_code) => {


        if (sel.sudden) {
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
                    payment: address.mode,
                    amount: total_amount.total,
                    products: products,
                    status: ok,
                    date: moment().format('mmmm do yyyy, h:mm:ss a'),
                    createdAt: new Date()

                }
                console.log("obj", orderObj);
                db.get().collection('orders').insertOne({ orderObj }).then(() => {

                    resolve(true)
                })
            })

        } else {
            return new Promise((resolve, reject) => {
                let ok = address.mode == "cod" || address.mode == "p_pal" ? 'placed' : 'pending'



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
                    payment: address.mode,
                    amount: total_amount.total,
                    products: products,
                    createdAt: new Date(),
                    status: ok,
                    date: moment().format('MMMM Do YYYY, h:mm:ss a'),

                }
                db.get().collection('orders').insertOne({ orderObj }).then(async (result) => {

                    let coupon = await db.get().collection('coupon').find({ code: c_code }).toArray()

                    if (coupon[0]) {
                        db.get().collection('users').update({ _id: objectId(address.userid) }, { $push: { "coupons": { _id: coupon[0]._id } } })

                    }



                    if (address.mode == "cod" || address.mode == "p_pal") {

                        db.get().collection('cart').remove({ user: address.userid })
                        resolve(result.insertedId)

                    } else {
                        resolve(result.insertedId)
                    }


                })
            })
        }
    },

    deleteFinalcart: (userid) => {
        return new Promise((resolve, reject) => {
            console.log(userid);

            db.get().collection('cart').remove({ user: userid })
            resolve()
        })

    },

    getWeeklySales: async () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection('orders').aggregate([
                {
                    $match: {
                        "orderObj.createdAt": { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$orderObj.createdAt' }, count: { $sum: 1 } } },
            ]).toArray()

            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            console.log(salesOfLastWeekData);

            resolve(salesOfLastWeekData)

        })
    },


    getPaymentCount: () => {

        return new Promise(async (resolve, reject) => {
            let cod = await db.get().collection('orders').find({ "orderObj.payment": "cod" }).count()
            let p_pal = await db.get().collection('orders').find({ "orderObj.payment": "p_pal" }).count()
            let rpay = await db.get().collection('orders').find({ "orderObj.payment": "r_pay" }).count()
            pay = [cod, p_pal, rpay]
            resolve(pay)


            console.log("coddddddd", cod, p_pal, rpay);

        })


    },

    thisMonthIncome: () => {
        let total = 0
        let orders = 0
        date = moment().format('MMMM do yyyy, h:mm:ss a')
        date = date.split(' ')
        month = date[0]
        year = date[2]
        console.log(date);
        return new Promise(async (resolve, reject) => {
            let cod = await db.get().collection('orders').find({}).toArray()

            let cus = await db.get().collection('users').find({}).count()
            cod.forEach(element => {
                val = element.orderObj.date.split(" ")
                if (val[0] == month && val[2] == year) {
                    total += element.orderObj.amount
                    orders++

                }


            });
            console.log(total);
            console.log(orders);
            resolve({ tot: total, ord: orders, cust: cus })



        })


    },


    getWeeklyStatus: async () => {
        return new Promise(async (resolve, reject) => {
            const delivered = await db.get().collection('orders').find({ "orderObj.products": { $elemMatch: { staus: "Delivered" } } }).count()
            const placed = await db.get().collection('orders').find({ "orderObj.products": { $elemMatch: { staus: "placed" } } }).count()
            const canceled = await db.get().collection('orders').find({ "orderObj.products": { $elemMatch: { staus: "User cancelled" } } }).count()
            const Shipped = await db.get().collection('orders').find({ "orderObj.products": { $elemMatch: { staus: "Shipped" } } }).count()
            console.log("shipped", delivered, placed, canceled, Shipped);

            let ord_status = [delivered, placed, canceled, Shipped];
            resolve(ord_status)



        })

        // const dayOfYear = (date) =>
        //     Math.floor(
        //         (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
        //     )
        // return new Promise(async (resolve, reject) => {
        //     const data = await db.get().collection('orders').aggregate([
        //         {
        //             $match: {
        //                 "orderObj.status":"placed",
        //                 "orderObj.createdAt": { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
        //             },
        //         },

        //         { $group: { _id: { $dayOfYear: '$orderObj.createdAt' }, count: { $sum: 1 } } },
        //     ]).toArray()

        //     const thisday = dayOfYear(new Date())
        //     let salesOfLastWeekData = []
        //     for (let i = 0; i < 8; i++) {
        //         let count = data.find((d) => d._id === thisday + i - 7)

        //         if (count) {
        //             salesOfLastWeekData.push(count.count)
        //         } else {
        //             salesOfLastWeekData.push(0)
        //         }
        //     }

        //     console.log("123333",data);

        //     resolve(salesOfLastWeekData)

        // })
    },





    searchBetween: (date) => {
        console.log(date.date1, date.date2, "asdada");

        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection('orders').aggregate([
                {
                    $match: { "orderObj.createdAt": { $gte: new Date(date.date1), $lte: new Date(date.date2) } }
                }
            ]).toArray()

            resolve(orders)

        })
    },


    searchProduct: (keyword) => {
        return new Promise(async (resolve, reject) => {
            key = keyword.toUpperCase();
            console.log("asdas",key);
            p_name=await db.get().collection("product").find({ "product_name": key }).toArray()
            cat=await db.get().collection("product").find({ "category": key }).toArray()
            sub=await db.get().collection("product").find({ "sub_category": key }).toArray()
            console.log(p_name[0],cat[0],sub[0]);
          
                if(p_name[0]){
                    console.log("p_name");

                    resolve(p_name)
                }
                else if(cat[0]){
                    console.log("cat");


                    resolve(cat)
                }
                else if(sub[0]){
                    console.log("sub");


                    resolve(sub)
                }
                else{
                    console.log("false");

                    resolve(false)
                }

           


        })

    },






    getOrderDetials: (user) => {
        return new Promise(async (resolve, reject) => {

            let ordered_items = await db.get().collection('orders').aggregate([
                {
                    $match: { "orderObj.userid": user }
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        quantity: '$orderObj.products.quantity',
                        status: '$orderObj.products.staus',
                        isCanceled: '$orderObj.products.isCancel',
                        isDelivered: '$orderObj.products.isDelivered'
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
                        item: 1, quantity: 1, status: 1, isCanceled: 1, isDelivered: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }


            ]).toArray()
            console.log("oooooo", ordered_items);

            if (ordered_items) {

                resolve(ordered_items)
            }
            else {
                resolve(false)

            }


        })



    },
    getAllOrderDetials: () => {
        return new Promise(async (resolve, reject) => {

            let ordered_items = await db.get().collection('orders').aggregate([
                {
                    $match: {}
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        userId: '$orderObj.userid',
                        payment: '$orderObj.payment',

                        quantity: '$orderObj.products.quantity',
                        status: '$orderObj.products.staus',
                        isCanceled: '$orderObj.products.isCancel',
                        isDelivered: '$orderObj.products.isDelivered',
                        date: "$orderObj.date",
                        amount: "$orderObj.amount"
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
                        item: 1, userId: 1, payment: 1, quantity: 1, status: 1, date: 1, amount: 1, isCanceled: 1, isDelivered: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }


            ]).toArray()


            if (ordered_items) {

                resolve(ordered_items)
            }
            else {
                resolve(false)

            }


        })



    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let all_orders = await db.get().collection('orders').find({}).sort({}).toArray()

            resolve(all_orders)

        })

    },
    orderStatus: (user) => {

        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection('orders').find({ "orderObj.userid": user }).toArray()

            resolve(order[0].orderObj.status)



        })

    },
    getCartProductList: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection('cart').find({ user: userid }).toArray()
            resolve(cart[0].products)
        })

    },

    changestatus: (id, proid, newVal) => {
        console.log(id);
        return new Promise(async (resolve, reject) => {
            if (newVal == "Order Canceled" || newVal == "Delivered" || newVal == "User cancelled") {
                db.get().collection('orders').updateOne({ _id: ObjectId(id), "orderObj.products.item": proid }, { $set: { "orderObj.products.$.staus": newVal, "orderObj.products.$.isCancel": true, "orderObj.products.$.isDelivered": true } }).then((result) => {
                    console.log(result);
                    resolve(true)
                })

            }
            else {

                db.get().collection('orders').updateOne({ _id: ObjectId(id), "orderObj.products.item": proid }, { $set: { "orderObj.products.$.staus": newVal, "orderObj.products.$.isCancel": false, "orderObj.products.$.isDelivered": false } }).then((result) => {
                    console.log(result);
                    resolve(true)
                })
            }
        })

    },
    getOfferProducts: (id) => {
        console.log("iddd", id);
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection('product').find({ _id: id }).toArray()
            console.log(result);
            resolve(result[0])
        })

    },
    deleteOffer: (id) => {
        console.log("iddd", id);
        return new Promise(async (resolve, reject) => {
            db.get().collection('product').updateOne({ _id: id }, { $unset: { exp_date: 1, off: 1, offer: 1, offer_price: 1 } }).then((result) => {
                console.log(("delete aaayii", result));
                resolve(true)
            })
        })

    },
    addOffer: (id, price, per, date) => {


        let off_price = price - (price * per / 100)

        console.log("offer", off_price);
        return new Promise((resolve, reject) => {
            db.get().collection('product').update({ _id: id }, { $set: { offer: true, off: per, offer_price: off_price, exp_date: date } }).then((res) => {

                console.log(res);
                resolve(res)
            })
        })

    },
    addCatOffer: async (sub, per, date) => {
        exp_date = new Date(date)
        console.log("date2", date);


        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection('product').find({ sub_category: sub }).toArray()
            console.log("sadasd", products);
            console.log("###", sub, per, date);
            for (let i = 0; i < products.length; i++) {
                if (products[i].offer) {
                    if (products[i].off < per) {
                        products[i].off = per

                        let off = products[i].price * per / 100
                        console.log("price", off);
                        products[i].exp_date = exp_date

                        products[i].offer_price += off
                    }


                }
                else {
                    products[i].offer = true
                    products[i].off = per
                    products[i].offer_price = products[i].price - products[i].price * per / 100
                    products[i].exp_date = exp_date
                }
                db.get().collection('product').updateOne({ _id: products[i]._id }, {
                    $set: {
                        exp_date: products[i].exp_date,
                        off: products[i].off, offer: true, offer_price: products[i].offer_price
                    }
                })


            }

        })

    },
    validateCoupon: (code, total, id) => {

        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection('coupon').find({ code: code }).toArray()

            if (coupon[0]) {

                coupon_id = coupon[0]._id
                let uservalid = await db.get().collection('users').find({ _id: objectId(id) }).toArray()

                let couponid = uservalid[0].coupons.find(element => element._id.equals(coupon_id))
                console.log("match", coupon_id, couponid);
                if (couponid) {
                    resolve({ coupon: false, mes: "Coupon already used" })

                } else {

                    if (coupon[0].min_amount <= total) {
                        off_price = total - total * coupon[0].off / 100
                        resolve({ coupon: true, amount: off_price, mes: "Coupon Applied" })
                    }
                    else {
                        resolve({ coupon: false, mes: `Valid for Minimum ${coupon[0].min_amount} ` })
                    }
                }


            } else {

                resolve({ coupon: false, mes: "Invalid Coupon" })

            }



        })
    },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection('coupon').find().toArray()
            resolve(response)
        })


    },

    addCoupon: (data) => {

        ccode = data.code
        coff = parseInt(data.off)
        cmin_amount = parseInt(data.min_amount)
        cexp_date = new Date(data.exp_date)

        console.log(data);
        return new Promise(async (resolve, reject) => {
            db.get().collection('coupon').insertOne({ code: ccode, off: coff, min_amount: cmin_amount, exp_date: cexp_date }).then((response) => {
                resolve()
            })

        })


    },
    delCoupon: (id) => {
        console.log("flag");
        return new Promise(async (resolve, reject) => {
            db.get().collection('coupon').deleteOne({ _id: objectId(id) }).then((response) => {
                resolve()
            })

        })


    },



    viewOrderDetails: (id) => {
        console.log("iddd", id);
        return new Promise(async (resolve, reject) => {
            let ordered_items = await db.get().collection('orders').aggregate([
                {
                    $match: { _id: ObjectId(id) }
                },
                {
                    $unwind: '$orderObj.products'
                },
                {
                    $project: {
                        item: '$orderObj.products.item',
                        quantity: '$orderObj.products.quantity',
                        status: '$orderObj.products.staus',
                        isCanceled: '$orderObj.products.isCancel',
                        isDelivered: '$orderObj.products.isDelivered'
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
                        item: 1, quantity: 1, status: 1, isCanceled: 1, isDelivered: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log("agrrrr", ordered_items);
            resolve(ordered_items)

        })

    }

}