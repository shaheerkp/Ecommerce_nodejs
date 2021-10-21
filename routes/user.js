var express = require('express');
var router = express.Router();
var db = require('../helper/userhelper')
const { OAuth2Client } = require('google-auth-library');
const { viewCategory, findProduct, addtoCart, getCartProducts, getTotalAmount, cartCount, deletecart, changeQuantity, changestatus, placeOrder, getCartProductList, getOrderDetials, orderStatus, buynowplaceOrder, } = require('../helper/producthelper');
const { token } = require('morgan');
const { googleSign, googleSignin, userSignup, getNumber, getuserAddress, getAddress, addAddress, deleteAddress } = require('../helper/userhelper');
const CLIENT_ID = "360791234082-kap1r32c2bjt3fg3ip28qvp6fplu26ui.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);



const serviceSID = "VA233b542e6e55ddb7942545ac51720ed9"
const accountSID = "AC9f86a3864a33d5791cbd030931c46150"
const authToken = "832f6ab4aa8fdd625d254544e2febd59"
const twilio = require('twilio')(accountSID, authToken)

const getCategory = async () => {
  let categories = await viewCategory();
  return categories;
}




const checkLogin = (req, res, next) => {
  if (req.session.user) {

    next()
  }
  else {
    res.redirect('/login')
  }

}


// const cart_count=async(req,res,next)=>{
//   if(req.session.user){
//     let count=await cartCount(req.session.user._id)
//     req.session.user.cart_count=count
//     next()
//   }
//   else{
//     next
//   }

// }

function checkauth(req, res, next) {
  let token = req.cookies['session-token'];
  let user = {}

  async function verify() {

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    })
    const payload = ticket.getPayload()
    user.name = payload.name
    user.email = payload.email
    user.isLoggedin = true
  }
  verify().then(() => {
    next()
  }).catch((err) => {
    next()
  })
}


/* GET home page. */
router.get('/', checkauth, async function (req, res, next) {
  let count = null
  if (req.session.user) {
    await cartCount(req.session.user._id).then(async (cart_count) => {
      cart_count = await cartCount(req.session.user._id)
      req.session.user.isLoggedin = true
      user = req.session.user
      res.render('user-pages/user-home', { user, cart_count, category: await getCategory() });
    })
  }
  else {
    res.render('user-pages/user-home', { category: await getCategory() });
  }


});


router.get('/viewProducts/:sub', async function (req, res) {
  let cart_count
  user = req.session.user
  if (req.session.user) {
    cart_count = await cartCount(req.session.user._id)

  }
  else {

    cart_count = 0

  }

  db.viewProducts(req.params.sub).then(async (result) => {
    let cat=result[0].sub_category
    console.log("first");
    console.log("@##@#@#@#@#",result[0]);
    

    res.render('user-pages/shirts', { user, cart_count, result, cat, category: await getCategory() });

  })
});

router.post('/addtocart', (req, res) => {
  let userid = req.session.user._id
  let productid = req.body.id
  if (userid) {
    addtoCart(userid, productid).then((result) => {
      if (result) {
        res.json({ status: true })

      }

    })

  } else {
    res.json({ status: false })
  }



})

router.post('/removecart', (req, res) => {

  let productid = req.body.id
  deletecart(req.body.id).then((result) => {

    if (result) {
      res.json({ status: true, mes: "removed from cart" })
    }
  })





})


router.get('/cart', checkLogin, async (req, res) => {

  let items = await getCartProducts(req.session.user._id)

  let cart_count = await cartCount(req.session.user._id)
  let total = await getTotalAmount(req.session.user._id)

  console.log(items);
  res.render('user-pages/cart', { items,total, user, cart_count, category: await getCategory() });

})




router.post('/changequantity', (req, res) => {
  let cartId = req.body.cartid
  let prodId = req.body.proid
  let count = req.body.count
  let qty = req.body.qty
  console.log(cartId);
  console.log(prodId);
  console.log(count);
  changeQuantity(cartId, prodId, count, qty).then((result) => {
    if (result) {
      res.json({ status: true })
    }
  })


})



router.get('/signup', function (req, res) {
  if (req.session.user) {
    res.redirect('/')
  }
  else {
    res.render('user-pages/user-signup', { noheader: true })

  }


});

router.post('/signup', function (req, res) {
  db.userSignup(req.body).then((data) => {
    if (data.status) {

      res.json({ status: true })

    }
    else {
      res.json({ status: false })
    }


  })

});

router.get('/login', function (req, res) {



  if (req.session.user) {
    res.redirect('/')
  }
  else {
    res.render('user-pages/user-login', { noheader: true })

  }

});


router.post('/login-google', function (req, res) {
  let token = req.body.token
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    payload;
    return payload

  }
  verify().then((payload) => {

    googleSignin(payload).then((result) => {


      if (result) {

        req.session.user = result

        res.cookie('session-token', token)
        res.send("Success")


      } else {
        res.send(false)

      }
    })


  }).catch(console.error);

});

router.post('/login', function (req, res) {

  db.userSignin(req.body).then((loggedin) => {

    if (loggedin == "block") {
      res.json({ status: false, message: "blocked by user" })

    }
    else if (loggedin) {

      req.session.user = req.body
      req.session.user._id = loggedin._id
      req.session.user.isLoggedin = true
      console.log(req.session);
      res.json({ status: true })

    }
    else {
      res.json({ status: false, message: "Invalid credential" })

    }


  })

});


router.get('/product-detail', function (req, res, next) {
  let detail = req.query.id

  findProduct(detail).then(async (result) => {

    if (req.session.user) {
      let cart_count = await cartCount(req.session.user._id)

      let details = result[0]
      if (details) {

        console.log("pppppppppprrrrrooooo111", details);
        res.render('user-pages/product-detail', { details, cart_count, user, category: await getCategory() })
      }
      else {
        res.redirect('/')

      }

    }
    else {
      let details = result[0]
      console.log("pppppppppprrrrrooooo2222222");
      if (details) {
        res.render('user-pages/product-detail', { details, user, category: await getCategory() })

      }
      else {
        res.redirect('/')
      }


    }


  }).catch((result) => {
    res.redirect("/")
  })

});










router.post('/mobile_otp', (req, res) => {
  console.log(req.body.number);
  getNumber(req.body.number).then((result)=>{
    console.log("resukt",result);

    if(result){
      
        twilio.verify.services(serviceSID)
  .verifications.create({
    to:`+916282237744`,
    channel:"sms",
    message:"thsfasd"
  }).then((response)=>{
    let status=response.status
     if(status=="pending"){
       res.json({status:true})
     }

  }) 

    }
    else{
      res.json({status:"nonum",mes:"Number not registered"})

    }
  }

  )

})

router.post('/verify-otp', (req, res) => {

  let otp=req.body.oneTime
  let number=req.body.number
  console.log("verify_otp");
  console.log(otp,number);
    twilio.verify.services(serviceSID)
    .verificationChecks.create({
      to:`+91${number}`,
      code:otp
    }).then((response)=>{
      let status=response.status
      let valid=response.valid
      console.log(response);
       if(status=="approved"&&valid==true){
        getNumber(number).then((result)=>{
          req.session.user = result
          req.session.user._id=result._id
          req.session.user.isLoggedin=true
          req.session.user.email=result.email
          res.json({status:true})
        })
       }
       else{
         res.json({status:false})
         console.log("declined");
       }
  
    }).catch((error)=>{
      console.log(error);

    })
  
  })
  


router.post('/otp',(req,res)=>{
  client.verify(serviceSID)
  .verifications.create()

})

router.get('/order-details', checkLogin, async (req, res) => {
  let orderdetails = await getOrderDetials(req.session.user._id)
  console.log("?????", orderdetails);
  if (orderdetails[0]) {

    let cart_count = await cartCount(req.session.user._id)
    let status = await orderStatus(req.session.user._id)
    console.log(status);
    res.render('user-pages/order-details', { user, orderdetails, cart_count, status, category: await getCategory() })
  }
  else {
    res.redirect('/')
  }

})



router.post('/buynow-place-order', async function (req, res) {
  console.log("buy now place order")
  console.log(req.body);
  let products = await findProduct(req.body.productid)
  total_amount = req.body.total_amount


  let add = await getAddress(req.body.address,req.session.user.email);
  let selectedAddress = add.address.find((address)=>address.id==req.body.address);


  let product = [{
    item: products[0]._id,
    quantity: 1,
    staus: "placed"
  }]
  console.log(total_amount);
  buynowplaceOrder(selectedAddress,req.body, product).then((result) => {
    console.log(result);
    res.json({ status: true })
  })

})
router.post('/place-order', async function (req, res) {
  let products = await getCartProductList(req.body.userid)
  let total_amount = await getTotalAmount(req.body.userid)
  let add = await getAddress(req.body.address,req.session.user.email);
  let selectedAddress = add.address.find((address)=>address.id==req.body.address);
  if(selectedAddress){
    console.log("selected",selectedAddress);
    placeOrder(selectedAddress,req.body, products, total_amount).then((result) => {
      console.log(result);
      res.json({ status: true })
    })
  }
  else{
    console.log("no address hooooo");
  }

})

router.get('/address', checkLogin, async (req, res) => {
  console.log("addresss worked again");
  let user = req.session.user._id;
  let email=req.session.user.email
  let total_amount = await getTotalAmount(user)
  console.log(email);
  console.log(total_amount);
  let address=await getuserAddress(req.session.user.email)
  if(address[0]){
    let add=address[0].address
    console.log("add",add);
    res.render('user-pages/address', { add, user, noheader: true, total_amount })

}else{
  let total_amount = await getTotalAmount(user)
  res.render('user-pages/address', {  user, noheader: true, total_amount })

}


})

router.post('/changestatus', checkLogin, async (req, res) => {
  console.log("changestatus post", req.body);
  let result = await changestatus(req.body.proid, req.body.id, req.body.newVal)

  res.json({ status: true })
})



router.get('/buynow-add-address/:id',checkLogin, (req,res)=>{
  console.log(req.body);
  id=req.params.id
  console.log("id",id);
  user = req.session.user._id
  email=req.session.user.email
  let random = Math. floor(1000 + Math. random() * 9000)
  console.log(random);
  res.render("user-pages/buynow-add-address",{id,random,email,user,noheader: true,})

})


router.get('/add-address',checkLogin, (req,res)=>{
  console.log(req.body);
  user = req.session.user._id
  email=req.session.user.email
  let random = Math. floor(1000 + Math. random() * 9000)
  console.log(random);
  res.render("user-pages/add-address",{random,email,user,noheader: true,})

})
router.post('/add-address',(req,res)=>{
 
  addAddress(req.body).then((result)=>{
    console.log("result vannuuu",result)
    res.json({status:result})
  })
  

})



router.get('/buynow/:id', checkLogin, async (req, res) => {
  user = req.session.user._id
  console.log("paramuuuu");
  console.log(req.params)
  let proId = req.params.id;
  console.log("proid");
  console.log(proId);
  let address=await getuserAddress(req.session.user.email)
  if(address[0]){
    
    let add=address[0].address
    let result=await findProduct(proId)
      console.log(result);
      let total_amount = result[0].price
      let productsid=result[0]._id
      console.log(total_amount);
      res.render('user-pages/buynow', { productsid ,add,proId, user, noheader: true, total_amount })
  
 
  }else{
    findProduct(id).then((result) => {
      console.log(result);
      let total_amount = result[0].price
      let productsid=result[0]._id
      console.log(total_amount);
      res.render('user-pages/buynow', { productsid ,id, user,proId, noheader: true, total_amount })
  
    })

  }

})  

router.post('/buynow-add-address',(req,res)=>{
  console.log("result vannuuu")
  console.log(req.body.proid);
 
  addAddress(req.body).then((result)=>{
    console.log(result);
   res.redirect(`buynow/${req.body.proid}`)
  })
  

})

router.post('/add-address',(req,res)=>{
 
  addAddress(req.body).then((result)=>{
    console.log("result vannuuu",result)
    res.json({status:result})
  })
  

})

router.get('/delete-address/:id',(req,res)=>{


  let id=req.params.id
  let email=req.session.user.email
  console.log(email,id);
 
  deleteAddress(email,id).then((result)=>{
    res.redirect('/address');
    
  })
  

})


router.get('/buynow-delete/:id/:prodid',(req,res)=>{
  console.log(req.params);


  let id=req.params.id
  let proid=req.params.prodid
  console.log("#########",id);
  let email=req.session.user.email
  console.log(email,id);
 
  deleteAddress(email,id).then((result)=>{
    res.redirect(`/buynow/${proid}`)
    
  })
  

})





router.get('/signout', function (req, res, next) {
  delete req.session.user
  res.clearCookie('session-token')
  res.redirect('/')

});



module.exports = router;
