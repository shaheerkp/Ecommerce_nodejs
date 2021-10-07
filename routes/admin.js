var express = require('express');
const baseModule = require('hbs');
const { Db } = require('mongodb');
var router = express.Router();
var producthelper=require('../helper/producthelper')
var userhelper=require('../helper/userhelper')
var handlebars=require('express-handlebars')


/* GET users listing. */





router.get('/', function(req, res, next) {
  res.render('admin-pages/admin-login',{noheader:true});
});

router.get('/dashboard', function(req, res, next) {
  res.render("admin-pages/dashboard",{admin:true})
});

router.get('/product-mgmt', function(req, res, next) {
  res.render("admin-pages/product-mgmt",{admin:true})
});

router.get('/topwear', function(req, res, next) {

  producthelper.viewProduct("top wear").then((result)=>{
    res.render("admin-pages/view-products",{admin:true,result,name:"TOPWEAR"})

    
  })
  
});

router.get('/bottomwear', function(req, res, next) {
  producthelper.viewProduct("bottom wear").then((result)=>{
    res.render("admin-pages/view-products",{admin:true,result,name:"BOTTOMWEAR"})

    
  })
});


router.get('/accessories', function(req, res, next) {

  producthelper.viewProduct("Accessories").then((result)=>{
    res.render("admin-pages/view-products",{admin:true,result,name:"ACCESSORIES"})

    
  }) 
  
});

router.get('/add-product', function(req, res, next) {

 
  res.render("admin-pages/add-product",{admin:true})
});

router.post('/add-product', function(req, res, next) {
   
  producthelper.addProduct(req.body)
  .then((id)=>{
    console.log(id);
    let img1=req.files.img1
    console.log(img1);
    let img2=req.files.img2
    let img3=req.files.img3

    img1.mv('./public/product-images/'+id+"1"+'.jpg',(err,done)=>{
  
      if(!err){

        img2.mv('./public/product-images/'+id+"2"+'.jpg',(err,done)=>{
  
          if(!err){
            img3.mv('./public/product-images/'+id+"3"+'.jpg',(err,done)=>{
  
              if(!err){
                res.render('admin-pages/add-product',{admin:true})
              }else{
                console.log("errrrr");
              }
            })
           
          }else{
            console.log("errrrr");
          }
        })
             }else{
        console.log("errrrr");
      }
    })
  })
});



router.get('/user-management', function(req, res, next) {
userhelper.viewUsers().then((result)=>{
  res.render("admin-pages/user-management",{admin:true,result})
}) 
});

router.get('/blockUser', function(req, res, next) {
  userhelper.blockUser(req.query.id).then(()=>{
  res.redirect('/admin/user-management')
  })
  });

module.exports = router;
