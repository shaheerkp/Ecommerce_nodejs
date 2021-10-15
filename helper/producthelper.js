var db = require('../config/connection')
var uuid = require('uuid');
const objectId = require('mongodb').ObjectId

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
        console.log(data);

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
                console.log(result);

                resolve(result)
            })



        })
    },
    findProduct: (id) => {
        return new Promise(async (resolve, reject) => {

            console.log(id);
            let result = await db.get().collection("product").find({ _id: id }).toArray()
            console.log("find product");
            console.log(result)
            if (result) {
                console.log("YEs I Found The Productsssssssssss");
                resolve(result)

            }
            else {
                console.log("product ilaaaaaaa");
                reject("Invalid url")
            }


        })


    },
    updateProduct: (id) => {
        let res = id._id;
        console.log(res);
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
                console.log(id);
                resolve(res)
            })



        })


    },
    addCategory: (name) => {

        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").findOne({ category: name })
            console.log(result);
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
        console.log(name);

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
                console.log(result);

                resolve(result)
            })

        })


    },
    addSubcategory: (cat, sub_cat) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection("categories").findOne({ category: cat, "subcategories.name": sub_cat })
            console.log(result);
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
                console.log(result);

                resolve(result)
            })
        })
    },
    addtoCart: (userid, prodid) => {
        console.log("#####");
        let proOb = {
            item: prodid,
            quantity: 1
        }

        console.log(userid);
        console.log(prodid);

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection("cart").findOne({ user: userid })

            console.log(user);

            if (user) {
                let proExsist = user.products.findIndex(product => product.item == prodid)
                console.log(proExsist);
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
                    console.log("-1 elseeeeee");

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
                console.log("else is working");
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
            console.log("panii thodangiiii");
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
                }


            ]).toArray()
            console.log("cartItems");
            console.log(cartitem);
            if (cartitem) {

                resolve(cartitem)
            } else (
                reject(false)
            )
        })

    },

    getTotalAmount: (userid) => {
        console.log("user id vannuuu " + userid);

        return new Promise(async (resolve, reject) => {
            console.log("panii thodangiiii");
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
                {
                    $group: {

                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                    }

                }


            ]).toArray()
            console.log(total);
            if (total) {

                resolve(total[0])
            } else (
                reject(false)
            )
        })
    },

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
        console.log("change quantity");
        console.log(count + " " + qty)



        return new Promise((resolve, reject) => {

            if (count == -1 && qty == 1) {
                console.log("%%%%%%%%%");
                console.log(cartid);
                console.log(prodid);

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
    placeOrder: (address, products, total_amount) => {
        return new Promise((resolve, reject) => {
            console.log(address, products, total_amount);
            let ok = address.mode == "cod" ? 'placed' : 'pending'
            let orderObj = {
                delivery_address: {
                    name: address.firstname,
                    email: address.email,
                    city: address.city,
                    pin: address.pin,
                    address: address.address,
                    state: address.state,
                    country: address.country,
                },
                userid: address.userid,
                status: address.mode,
                amount: total_amount.total,
                products: products,
                status: ok,
                date:new Date()

            }
            db.get().collection('orders').insertOne({ orderObj }).then(() => {
                db.get().collection('cart').remove({ user: address.userid })
                resolve(true)
            })
        })
    },
    getOrderDetials: (user) => {
        return new Promise(async(resolve,reject)=>{
            console.log("#@@#@@",user);
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
                        quantity: '$orderObj.products.quantity'
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
                }
                // {
                //     $group: {

                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                //     }

                // }


            ]).toArray()
            resolve(ordered_items)

        })



    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let all_orders= await db.get().collection('orders').find({}).toArray()
            console.log(all_orders);
        
            resolve(all_orders)

        })

    },
    orderStatus:(user)=>{
        console.log(user);
        return new Promise(async(resolve,reject)=>{
            let order=await db.get().collection('orders').find({"orderObj.userid":user}).toArray()
            console.log(")))))))((((((((",order[0].orderObj.status);
            resolve(order[0].orderObj.status)

        })

    },
    getCartProductList: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection('cart').find({ user: userid }).toArray()
            resolve(cart[0].products)
        })

    }


}