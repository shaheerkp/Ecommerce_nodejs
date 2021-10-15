var express = require('express');
var router = express.Router();
var db = require('../helper/userhelper')
const { OAuth2Client } = require('google-auth-library');
const { viewCategory, findProduct, addtoCart, getCartProducts , getTotalAmount , cartCount, deletecart, changeQuantity, placeOrder, getCartProductList, getOrderDetials, orderStatus } = require('../helper/producthelper');
const { token } = require('morgan');
const { googleSign, googleSignin, userSignup } = require('../helper/userhelper');
const CLIENT_ID = "360791234082-kap1r32c2bjt3fg3ip28qvp6fplu26ui.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

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
    cat = result[0].category;
    console.log("############",cat);

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


router.get('/cart', checkLogin,async (req, res) => {

  let items =await getCartProducts(req.session.user._id)

    let cart_count = await cartCount(req.session.user._id)
    let total= await getTotalAmount(req.session.user._id)
    console.log(total);

 

    res.render('user-pages/cart', { items,total, user, cart_count, category: await getCategory() });
 
})


router.get('/address',checkLogin, async(req,res)=>{
  let user=req.session.user._id;
  let total_amount= await getTotalAmount(user)
  console.log(total_amount);

  res.render('user-pages/address',{user,noheader:true,total_amount}  )


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

    googleSignin(payload.email).then((result) => {


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
      if(details){

        console.log("pppppppppprrrrrooooo111",details);
        res.render('user-pages/product-detail', { details, cart_count, user, category: await getCategory() })
      }
      else{
        res.redirect('/')

      }

    }
    else {
      let details = result[0]
      console.log("pppppppppprrrrrooooo2222222");
      if(details){
        res.render('user-pages/product-detail', { details, user, category: await getCategory() })

      }
      else{
        res.redirect('/')
      }


    }


  }).catch((result) => {
    res.redirect("/")
  })

});

router.post('/place-order',async function (req,res){
  let products=await getCartProductList(req.body.userid)
  let total_amount=await getTotalAmount(req.body.userid)
  placeOrder(req.body,products,total_amount).then((result)=>{
    console.log(result);
    res.json({status:true})
  })

})

router.get('/order-details',checkLogin,async(req,res)=>{
  console.log(user);
  let orderdetails= await getOrderDetials(req.session.user._id)
  let cart_count = await cartCount(req.session.user._id)
  let status=await orderStatus(req.session.user._id)
  res.render('user-pages/order-details',{user,orderdetails,cart_count,status,category: await getCategory() })

})


router.get('/signout', function (req, res, next) {
  delete req.session.user
  res.clearCookie('session-token')
  res.redirect('/')

});



module.exports = router;
