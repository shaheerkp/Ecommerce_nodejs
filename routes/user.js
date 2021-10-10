var express = require('express');
var router = express.Router();
var db = require('../helper/userhelper')
const { OAuth2Client } = require('google-auth-library');
const { viewCategory,findProduct } = require('../helper/producthelper');
const CLIENT_ID = "360791234082-kap1r32c2bjt3fg3ip28qvp6fplu26ui.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

const getCategory = async () => {
  let categories = await viewCategory();
  return categories;
}



var productdetails = null;



/* GET home page. */
router.get('/', async function (req, res, next) {
  user = req.session.user
  res.render('user-pages/user-home', { user, category: await getCategory() });
});


router.get('/viewProducts/:sub', function (req, res) {
  user = req.session.user
  console.log(req.params.sub);

  db.viewProducts(req.params.sub).then(async (result) => {
    cat=result[0].category;
    
    res.render('user-pages/shirts', { user, result,cat, category: await getCategory() });
 
  })
});



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
  console.log(token);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log(payload);

  }
  verify().catch(console.error);

});

router.post('/login', function (req, res) {

  db.userSignin(req.body).then((loggedin) => {
    if (loggedin == "block") {
      res.json({ status: false, message: "blocked by user" })

    }
    else if (loggedin) {
      req.session.user = req.body
      req.session.user.isLoggedin = true
      res.json({ status: true })

    }
    else {
      res.json({ status: false, message: "Invalid credential" })

    }


  })

});


router.get('/product-detail', function (req, res, next) {
  let detail = req.query
  findProduct(detail.id).then(async(result)=>{
    let details=result[0]
    res.render('user-pages/product-detail', { details, user,category: await getCategory() })

  }).catch((result)=>{
    res.send(result)
  })
  
});

router.get('/signout', function (req, res, next) {
  req.session.user = null
  res.redirect('/')

});



module.exports = router;
