var express = require('express');
var router = express.Router();
var db=require('../helper/userhelper')


var productdetails=null;


let check=function(req,res,next){
  if(req.session.isloggedin){
    next()
  }else{
    res.redirect('/login')
  }

}

/* GET home page. */
router.get('/', function(req, res, next) {
  user=req.session.body

  res.render('user-pages/user-home',{user});
});


router.get('/shirts', function(req, res ) {
  db.viewProducts().then((result)=>{
    console.log(req.session.body);
    productdetails=result;
    res.render('user-pages/shirts',{result});

  })
  
 
});

router.get('/signup', function(req, res) {
  res.render('user-pages/user-signup',{noheader:true})
});

router.post('/signup', function(req, res) {
  db.userSignup(req.body).then((data)=>{
    if (data.status) {

      res.json({status:true})
      
    }
    else{
      res.json({status:false})
    }


  })
 
});

router.get('/login', function(req, res) {
  res.render('user-pages/user-login',{noheader:true})
});

router.post('/login', function(req, res) {
 
 db.userSignin(req.body).then((loggedin)=>{
   if(loggedin=="block"){
     res.json({status:false,message:"blocked by user"})

   }
   else if(loggedin){
     req.session.body=req.body
     req.session.body.isLoggedin=true
     res.json({status:true})

   }
   else{
     res.json({status:false,message:"Invalid credential"})

   }


 })

});


router.get('/product-detail', function(req, res, next) {
  let details=req.query
  res.render('user-pages/product-detail',{details})
});




module.exports = router;
