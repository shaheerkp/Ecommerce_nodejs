var express = require('express');
const baseModule = require('hbs');
const fs = require('fs');
const { Db } = require('mongodb');
var router = express.Router();
var producthelper = require('../helper/producthelper')
var userhelper = require('../helper/userhelper')
var handlebars = require('express-handlebars');
const { viewCategory, deleteSubcategory, viewProduct, deleteCategory, getOrderDetials, viewSubcategory, deleteProduct, addCategory, getAllOrders, changestatus,getOfferProducts, findProductByName, addOffer, deleteOffer, addCatOffer, getAllOrderDetials, validateCoupon, getAllCoupons, addCoupon, delCoupon, thisMonthIncome, searchBetween, getNewSalesReport } = require('../helper/producthelper');
const { addListener } = require('process');
let admin_email = "kpshaheer123@gmail.com"
let admin_password = "123"
var moment = require('moment');
const { response } = require('express');



const getCategory = async () => {
  let categories = await viewCategory()
  return categories;
}

function check(req, res, next) {
  if (req.session.admin) {
    next()

  }
  else {
    res.redirect('/admin')
  }
}

router.get('/', function (req, res, next) {
  let err;
  if (req.session.admin) {
    res.redirect('/admin/dashboard')

  } else {

    if (req.session.err) {
      err = req.session.err
      res.render('admin-pages/admin-login', { err, noheader: true });
      req.session.err = null

    } else {
      res.render('admin-pages/admin-login', { noheader: true });
    }
  }
});

router.get('/dashboard', check, async function (req, res, next) {
  let products=await producthelper.getAllProducts()
  products=products.length
  let orders=await getAllOrderDetials()
  orders=orders.length
  let monthStatus=await thisMonthIncome()
  console.log("month ",monthStatus);
 
  await producthelper.getWeeklySales()


  res.render("admin-pages/dashboard", {monthStatus,orders, products,admin: true, category: await getCategory() })
});


router.post('/weeklySalesReport',async function(req,res){
 let sales =await producthelper.getWeeklySales()
 let payment=await producthelper.getPaymentCount()
 let ord_status=await producthelper.getWeeklyStatus()

 res.json({data:sales,pay:payment,status:ord_status})


 
})


router.post('/search-by-date',(req,res)=>{
 
  searchBetween(req.body).then((response)=>{
    console.log(response);
    res.json({response})
  })


})


router.post('/dashboard', function (req, res, next) {

  if (admin_email == req.body.email && admin_password == req.body.password) {
    req.session.admin = req.body
    req.session.admin.isLoggedin = true

    res.redirect("/admin/dashboard")
  }
  else {
    req.session.err = "invalid credential"
    res.redirect('/admin')
  }
});

router.get('/signout', async function (req, res, next) {
  delete req.session.admin
  res.redirect("/admin")
});



router.get('/product-mgmt', check, function (req, res, next) {
  producthelper.getAllProducts().then(async (result) => {
    res.render("admin-pages/product-mgmt", { admin: true, result, category: await getCategory() })

  })

});




router.get('/a/:name', check, function (req, res, next) {
  viewProduct(req.params.name).then(async (result) => {
    res.render('admin-pages/product-mgmt', { result, admin: true, category: await getCategory() })

  })
});


router.get('/deleteProduct/:id', check, function (req, res, next) {

  deleteProduct(req.params.id).then(async (result) => {

    res.redirect('/admin/product-mgmt')

  })

});

router.get('/updateProduct/:id', check, function (req, res, next) {


  producthelper.findProduct(req.params.id).then((result) => {
    if (result == "Invalid url") {

    } else {
      let data = result[0]
      res.render('admin-pages/edit-product', { admin: true, data })
    }
  })
});

router.post('/updateProduct', check, function (req, res, next) {
  req.body.price = parseInt(req.body.price)
  req.body.qty = parseInt(req.body.qty)



  let image1 = req.body.img1
  let image2 = req.body.img2
  let image3 = req.body.img3



  let product = {
    _id: req.body._id,
    product_name: req.body.product_name,
    category: req.body.category,
    sub_category: req.body.sub_category,
    description: req.body.description,
    price: req.body.price,
    qty: req.body.qty
  }

  producthelper.updateProduct(product)
    .then((id) => {
      console.log(id);
      console.log("fileeeeeeeeeeee");

      let path1 = `./public/product-images/${id}1.jpg`
      let path2 = `./public/product-images/${id}2.jpg`
      let path3 = `./public/product-images/${id}3.jpg`


      console.log(path1);

      let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      let img2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      let img3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, "")

      if(img1&&img2&&img3){


      fs.writeFileSync(path1, img1, { encoding: 'base64' })
      fs.writeFileSync(path2, img2, { encoding: 'base64' })
      fs.writeFileSync(path3, img3, { encoding: 'base64' })
    }else if(img1&&img2){
      fs.writeFileSync(path1, img1, { encoding: 'base64' })
      fs.writeFileSync(path2, img2, { encoding: 'base64' })

    }else if(img2&&img3){
      fs.writeFileSync(path2, img2, { encoding: 'base64' })
      fs.writeFileSync(path3, img3, { encoding: 'base64' })

    }
    else if(img1&&img3){
      fs.writeFileSync(path1, img1, { encoding: 'base64' })
      fs.writeFileSync(path3, img3, { encoding: 'base64' })

    }
    else if(img1){
      fs.writeFileSync(path1, img1, { encoding: 'base64' })
     
    }
    else if(img2){
      fs.writeFileSync(path2, img2, { encoding: 'base64' })
     

    }
    else if(img3){
      fs.writeFileSync(path3, img3, { encoding: 'base64' })
    }     

    

      res.redirect('/admin/product-mgmt')

 



      // img1.mv('./public/product-images/'+id+"1"+'.jpg',(err,done)=>{

      //   if(!err){

      //     img2.mv('./public/product-images/'+id+"2"+'.jpg',(err,done)=>{

      //       if(!err){
      //         img3.mv('./public/product-images/'+id+"3"+'.jpg',(err,done)=>{

      //           if(!err){
      //             res.redirect('/admin')
      //           }else{
      //             console.log("errrrr");
      //           }
      //         })

      //       }else{
      //         console.log("errrrr");
      //       }
      //     })
      //          }else{
      //     console.log("errrrr");
      //   }
      // })

    })
});




router.get('/add-product', check, function (req, res, next) {
  viewCategory().then(async (result) => {
    console.log(result);

    res.render("admin-pages/add-product", { admin: true, result, category: await getCategory() })

  })

});

router.post('/add-product', check, function (req, res, next) {
  console.log("I am hereeeeeeeeeeeeeeee");
  let price = parseInt(req.body.price)
  let qty = parseInt(req.body.qty)

 

  let image1 = req.body.img1
  let image2 = req.body.img2
  let image3 = req.body.img3




  let product = {
    _id: req.body._id,
    product_name: req.body.product_name,
    category: req.body.category,
    sub_category: req.body.sub_category,
    description: req.body.description,
    price: req.body.price,
    qty: req.body.qty
  }





  producthelper.addProduct(product)
    .then((id) => {

      let path1 = `./public/product-images/${id}1.jpg`
      let path2 = `./public/product-images/${id}2.jpg`
      let path3 = `./public/product-images/${id}3.jpg`

      console.log(path1);

      let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      let img2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, "")
      let img3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, "")


      fs.writeFileSync(path1, img1, { encoding: 'base64' })
      fs.writeFileSync(path2, img2, { encoding: 'base64' })
      fs.writeFileSync(path3, img3, { encoding: 'base64' })

      res.redirect('/admin/product-mgmt')

    })
});



router.get('/user-management', check, function (req, res, next) {
  userhelper.viewUsers().then(async (result) => {
    res.render("admin-pages/user-management", { admin: true, result, category: await getCategory() })
  })
});

router.get('/order-management', check, async (req, res) => {
  getAllOrders().then((result) => {
    console.log("rrr", result);
    res.render('admin-pages/order-mgmt', { result, admin: true })
  })


})


router.get('/view-order-details/:id', check, async (req, res) => {
  producthelper.viewOrderDetails(req.params.id).then((result) => {
    console.log("reusltttt", result);
    res.render('admin-pages/order-details', { result, admin: true })
  })


})

router.post('/changestatus', check, async (req, res) => {
  console.log("changestatus post", req.body);
  let result = await changestatus(req.body.proid, req.body.id, req.body.newVal)
  console.log("reusltttt", result);
  res.json({ status: true })
})

router.get('/coupons',check,async(req,res)=>{
  producthelper.viewCategory().then(async (result) => {
    console.log("sortcheyanda ",result);
    res.render('admin-pages/coupons',{admin:true,result,category: await getCategory()})
  })


})

router.post('/filter',(req,res)=>{
  console.log("_____________________");
  console.log(req.body);
  getNewSalesReport(req.body.day).then((response)=>{
    res.json({filtered_item:response})

  })
  




})





router.get('/category-management', check, function (req, res, next) {
  producthelper.viewCategory().then(async (result) => {
    res.render("admin-pages/category-management", { admin: true, result, category: await getCategory() })
  })
});

router.get('/blockUser', check, function (req, res, next) {
  userhelper.blockUser(req.query.id).then(() => {
    res.redirect('/admin/user-management')
  })
});

router.post('/add-category', check, function (req, res, next) {
  console.log(req.body);
  addCategory(req.body.name).then((result) => {
    if (result) {
      res.json({ status: true, mes: "Category added" })
    }
    else {
      res.json({ status: false, mes: "Category exsist" })

    }

  })


});

router.post('/deletecat', check, function (req, res, next) {
  console.log(req.body.name);
  deleteCategory(req.body.name).then((result) => {
    if (result) {
      res.json({ status: true, mes: "Category deleted" })
    }
    else {
      res.json({ status: false, mes: "" })

    }

  })


});




router.post('/get-subcategory', check, function (req, res, next) {
  producthelper.viewSubcategory(req.body.id).then((result) => {
    data = result[0].subcategories;
    res.json({ data })
  })

});

router.post('/update-subcategory', check, function (req, res, next) {
  console.log(req.body.oldValue);
  producthelper.updateSubcategory(req.body.oldValue, req.body.newValue).then((result) => {
    res.json({ success: true, mes: "Sucessfull updated subcategory" })

  })

});

router.post('/add-subcategory', check, function (req, res, next) {
  console.log("Evdeee ethiooooo?");
  console.log(req.body.cat);
  producthelper.addSubcategory(req.body.cat, req.body.sub_cat).then((result) => {
    console.log(result);
    if (result) {
      res.json({ success: true, mes: "Sucessfull updated subcategory" })
    }
    else {
      res.json({ success: false, mes: "Already exsist" })

    }

  })

});


router.post('/delete-subcategory', check, function (req, res) {
  console.log(req.body);
  deleteSubcategory(req.body.oldValue).then((result) => {
    res.json({ success: true, mes: "Sucessfull deleted subcategory" })
  })

})

router.post('/get-offer-product',check,(req,res)=>{
  findProductByName(req.body.sub_cat).then((data)=>{
    res.json({data})
  })
  
})

router.get('/add-offer',check,async(req,res)=>{
  console.log("asdasdasd",req.query.id);
  getOfferProducts(req.query.id).then((result)=>{
    res.render("admin-pages/offer-details",{admin:true,result})
  })
 
})
router.get('/delete-offer',check,async(req,res)=>{
  console.log("deletee",req.query.id);
  deleteOffer(req.query.id).then((result)=>{
   res.redirect("/admin/coupons")
  })
 
})



router.get('/category-offer',check,async(req,res)=>{

  producthelper.viewCategory().then(async (result) => {
    console.log("sortcheyanda ",result);
    res.render('admin-pages/categoryoffer-details',{admin:true,result,category: await getCategory()})
  })
  })



  router.post('/add-category-offer',check,(req,res)=>{

    console.log("asdasdasd",req.body);
    let per=parseInt(req.body.perentage)
    let date=req.body.exp_date
    addCatOffer(req.body.sub_category,per,date)
    
  })





router.post("/add-offer",check,(req,res)=>{
  console.log(req.body);
  id=req.body._id
  price=parseInt(req.body.price)
  per=parseInt(req.body.perentage)
  date=new Date(req.body.exp_date)
  addOffer(id,price,per,date).then((result)=>{
    res.json({status:true})
  })

  
})

router.get('/salesreport',check,(req,res)=>{
  getAllOrderDetials().then((result)=>{
  
    console.log("order details",result)
    res.render("admin-pages/salesreport",{admin:true,result})
    
})
})


router.get('/coupon-offer',check,(req,res)=>{
 getAllCoupons().then((result)=>{
   console.log(result);
    res.render("admin-pages/coupon-offer",{admin:true,result})
    
})
})

router.post('/add-coupons',(req,res)=>{
 addCoupon(req.body).then((response)=>{
   res.json({status:true,mes:"Coupon Added"})
 })

})
router.post('/del-coupons',(req,res)=>{
  console.log("deleted "); 
  delCoupon(req.body.id).then((response)=>{
    res.json({status:true,mes:"Coupon Deleted"})
  })
 
 })




module.exports = router;
