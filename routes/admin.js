var express = require('express');
const baseModule = require('hbs');
const { Db } = require('mongodb');
var router = express.Router();
var producthelper = require('../helper/producthelper')
var userhelper = require('../helper/userhelper')
var handlebars = require('express-handlebars');
const { viewCategory, deleteSubcategory, viewProduct, deleteCategory, getOrderDetials, viewSubcategory, deleteProduct, addCategory, getAllOrders, changestatus } = require('../helper/producthelper');
let admin_email = "kpshaheer123@gmail.com"
let admin_password = "123"


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

  res.render("admin-pages/dashboard", { admin: true, category: await getCategory() })
});


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
      res.render('admin-pages/edit-product', {admin:true, data })
    }
  })
});

router.post('/updateProduct', check, function (req, res, next) {
  req.body.price=parseInt(req.body.price)
  req.body.qty=parseInt(req.body.qty)

  console.log(req.body);
  producthelper.updateProduct(req.body)
    .then((id) => {
      console.log(id);
      console.log("fileeeeeeeeeeee" );
      if (!req.files) {
        res.redirect('/admin/product-mgmt')


      } else {
        let img1 = req.files.img1

        let img2 = req.files.img2
        let img3 = req.files.img3


        if (img1 && img2 && img3) {
          console.log("#####mOOOOOOONAAm");
          img1.mv('./public/product-images/' + id + "1" + '.jpg')
          img2.mv('./public/product-images/' + id + "2" + '.jpg')
          let result = img3.mv('./public/product-images/' + id + "3" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img1 && img2) {
          img1.mv('./public/product-images/' + id + "1" + '.jpg')
          img2.mv('./public/product-images/' + id + "2" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img2 && img3) {
          img3.mv('./public/product-images/' + id + "3" + '.jpg')
          img2.mv('./public/product-images/' + id + "2" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img1 && img3) {
          img3.mv('./public/product-images/' + id + "3" + '.jpg')
          img1.mv('./public/product-images/' + id + "1" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img1) {
          console.log("image one");
          img1.mv('./public/product-images/' + id + "1" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img2) {
          img2.mv('./public/product-images/' + id + "2" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else if (img3) {
          img3.mv('./public/product-images/' + id + "3" + '.jpg')
          res.redirect('/admin/product-mgmt')
        }
        else {
          res.redirect('/admin/product-mgmt')

        }

      }



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
    console.log(res);

    res.render("admin-pages/add-product", { admin: true, result, category: await getCategory() })

  })

});

router.post('/add-product', check, function (req, res, next) {

req.body.price=parseInt(req.body.price)
req.body.qty=parseInt(req.body.qty)
console.log(req.body);

  producthelper.addProduct(req.body)
    .then((id) => {
      console.log(id);
      console.log(req.body);
      let img1 = req.files.img1
      console.log(img1);
      let img2 = req.files.img2
      let img3 = req.files.img3

      img1.mv('./public/product-images/' + id + "1" + '.jpg', (err, done) => {

        if (!err) {

          img2.mv('./public/product-images/' + id + "2" + '.jpg', (err, done) => {

            if (!err) {
              img3.mv('./public/product-images/' + id + "3" + '.jpg', (err, done) => {

                if (!err) {
                  res.redirect('/admin/product-mgmt')
                } else {
                  console.log("errrrr");
                }
              })

            } else {
              console.log("errrrr");
            }
          })
        } else {
          console.log("errrrr");
        }
      })
    })
});



router.get('/user-management', check, function (req, res, next) {
  userhelper.viewUsers().then(async (result) => {
    res.render("admin-pages/user-management", { admin: true, result, category: await getCategory() })
  })
});

router.get('/order-management', check, async (req, res) => {
  getAllOrders().then((result) => {
    console.log("rrr",result);
    res.render('admin-pages/order-mgmt', { result, admin: true })
  })


})


router.get('/view-order-details/:id', check, async (req, res) => { 
  producthelper.viewOrderDetails(req.params.id).then((result) => {
    console.log("reusltttt",result);
    res.render('admin-pages/order-details', { result, admin: true })
  })


})

router.post('/changestatus', check, async (req, res) => { 
  console.log("changestatus post",req.body);
  let result=await changestatus(req.body.proid,req.body.id,req.body.newVal)
    console.log("reusltttt",result);
   res.json({status:true})
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


module.exports = router;
