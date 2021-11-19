var express = require("express");
var router = express.Router();
var db = require("../helper/userhelper");
const { OAuth2Client } = require("google-auth-library");
const {
  viewCategory,
  findProduct,
  addtoCart,
  getCartProducts,
  getTotalAmount,
  cartCount,
  deletecart,
  changeQuantity,
  changestatus,
  placeOrder,
  getCartProductList,
  getOrderDetials,
  orderStatus,
  buynowplaceOrder,
  deleteFinalcart,
  findProductByName,
  deleteOffer,
  validateCoupon,
  getSubAmount,
  getSingle,
  getWishlistProducts,
  deletewishlist,
  searchProduct,
  checksearchProduct,
  checksearchProductbetween,
} = require("../helper/producthelper");
const { token } = require("morgan");
const {
  googleSign,
  googleSignin,
  userSignup,
  getNumber,
  getuserAddress,
  getAddress,
  addAddress,
  deleteAddress,
  saveChanges,
  getUserById,
  changePassword,
  addtoWishList,
  editAddress,
} = require("../helper/userhelper");
const userhelper = require("../helper/userhelper");
const CLIENT_ID =
  "360791234082-kap1r32c2bjt3fg3ip28qvp6fplu26ui.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
var uuid = require("uuid");
const { response } = require("express");
const fs = require("fs");
var moment = require("moment");

const paypal = require("paypal-rest-sdk");
const producthelper = require("../helper/producthelper");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AbidnDRDKGuxMeFNLQT9ZRWVkCv2Cwy1A1HW4KKxsENJHi4XZ1_uFYs1W6kowr00bSkqg9O45qafPoyl",
  client_secret:
    "EC8huVJhjUe6fkxtJoArO-DUP6CDKg70mpUAIu-JUgS4WaerK799erkx8at0rqX4Gm7JrGeMpJ8vH6cg",
});

const serviceSID = "VA233b542e6e55ddb7942545ac51720ed9";
const accountSID = "AC9f86a3864a33d5791cbd030931c46150";
const authToken = "832f6ab4aa8fdd625d254544e2febd59";
const twilio = require("twilio")(accountSID, authToken);

const getCategory = async () => {
  let categories = await viewCategory();
  return categories;
};

const checkLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

function checkauth(req, res, next) {
  let token = req.cookies["session-token"];
  let user = {};

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.isLoggedin = true;
  }
  verify()
    .then(() => {
      next();
    })
    .catch((err) => {
      next();
    });
}

router.post("/pay", async (req, res) => {
  console.log("pay");

  console.log(req.body);
  let price = 0;
  if (!req.body.prodid == "") {
    console.log("if");
    let products = await findProduct(req.body.prodid);

    price = products[0].price;
  } else {
    console.log("else");
    let total_amount = await getTotalAmount(req.body.userid);

    price = total_amount.total;
  }
  let add = await getAddress(req.body.address, req.session.user.email);
  let selectedAddress = add.address.find(
    (address) => address.id == req.body.address
  );
  if (selectedAddress) {
    console.log("addresss undddd");
    console.log(price);
    req.session.user.price = price;
    req.session.user.body = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://ecom.shaheerkp.tech/success",
        cancel_url: "https://ecom.shaheerkp.tech/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Red Sox Hat",
                sku: "001",
                price: price,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: price,
          },
          description: "Hat for the best team ever",
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      console.log(payment);
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            console.log(payment.links[i].href);
            res.json({ status: true, link: payment.links[i].href });
          }
        }
      }
    });
  } else {
    console.log("no adddressss");
    res.json({
      status: false,
      msg: "Please select a address",
    });
  }
});

router.get("/success", (req, res) => {
  console.log("sucessssss");

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let total = req.session.user.price;

  console.log("session", req.session.user.body);

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: total,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      let products;
      let total_amount;
      if (error) {
        throw error;
      } else {
        if (!req.session.user.body.prodid == "") {
          console.log("if");
          products = await findProduct(req.session.user.body.prodid);
          products = [
            {
              item: products[0]._id,
              quantity: 1,
              staus: "placed",
            },
          ];
          console.log("if products", products);
          total_amount = {
            _id: null,
            total: products[0].price,
          };
        } else {
          req.session.user.ordersuccess = true;
          products = await getCartProductList(req.session.user.body.userid);
          console.log("else", products);
          total_amount = await getTotalAmount(req.session.user.body.userid);
          console.log("total amount", total_amount);
        }

        let add = await getAddress(
          req.session.user.body.address,
          req.session.user.email
        );
        let selectedAddress = add.address.find(
          (address) => address.id == req.session.user.body.address
        );
        console.log(selectedAddress);
        req.session.user.ordersuccess = true;
        placeOrder(
          selectedAddress,
          req.session.user.body,
          products,
          total_amount
        ).then((result) => {
          res.redirect("/suc");
        });
      }
    }
  );
});

router.get("/cancel", (req, res) => {
  res.redirect("/");
  delete req.session.user.price;
  delete req.session.user.body;
});

router.post("/verifypayment", (req, res) => {
  userhelper.verifyPayment(req.body).then((result) => {
    userhelper
      .changePaymentStatus(req.body["order[receipt]"])
      .then((result) => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: "Payment failed" });
      });
  });
});

router.get("/", checkauth, async function (req, res, next) {
  let shirts = await findProductByName("Shirts");
  let tshirt = await findProductByName("Tshirt");
  let Pantss = await findProductByName("Pantss");
  let Shorts = await findProductByName("Shorts");

  let count = null;
  if (req.session.user) {
    await cartCount(req.session.user._id).then(async (cart_count) => {
      cart_count = await cartCount(req.session.user._id);
      req.session.user.isLoggedin = true;
      user = req.session.user;
      res.render("user-pages/user-home", {
        user,
        cart_count,
        category: await getCategory(),
      });
    });
  } else {
    res.render("user-pages/user-home", { category: await getCategory() });
  }
});

router.get("/viewProducts/:sub", async function (req, res) {
  let cart_count;
  user = req.session.user;
  if (req.session.user) {
    cart_count = await cartCount(req.session.user._id);
  } else {
    cart_count = 0;
  }

  db.viewProducts(req.params.sub).then(async (result) => {
    console.log("viewwww", result);
    if (result[0]) {
      let cat = result[0].sub_category;
      for (let i = 0; i < result.length; i++) {
        var dt = new Date();
        if (result[i].offer) {
          diff = result[i].exp_date < dt ? true : false;

          console.log("diffff", diff);
          if (diff) {
            deleteOffer(result[i]._id);
          }
        }
      }

      res.render("user-pages/shirts", {
        user,
        cart_count,
        result,
        cat,
        category: await getCategory(),
      });
    } else {
      res.render("user-pages/shirts", {
        user,
        cart_count,
        category: await getCategory(),
      });
    }
  });
});

router.post("/addtocartcheck", (req, res) => {
  console.log("eles ffff");

  let productid = req.body.id;
  console.log("pro", productid);

  if (req.session.user) {
    console.log("iffff");
    res.redirect(`/addtocart/${productid}`);
  } else {
    console.log("else");
    req.session.guest = productid;
    res.json({ status: false });
  }
});

router.get("/addtocart/:id", (req, res) => {
  let userid = req.session.user._id;
  let productid = req.params.id;
  console.log("____-");
  console.log(productid[0]);
  let abc;
  if (userid) {
    addtoCart(userid, productid).then(async (result) => {
      let cart_count = await cartCount(req.session.user._id);

      if (req.session.guest) {
        console.log("ifilll kerrriiii ");
        delete req.session.guest;
        res.redirect("/cart");
      } else {
        res.json({ status: true, count: cart_count });
      }
    });
  } else {
    res.json({ status: false });
  }
});

router.post("/removecart", (req, res) => {
  let productid = req.body.id;
  deletecart(req.body.id).then((result) => {
    if (result) {
      res.json({ status: true, mes: "removed from cart" });
    }
  });
});

router.post("/removewishlist", (req, res) => {
  let productid = req.body.id;
  deletewishlist(req.body.id).then((result) => {
    if (result) {
      res.json({ status: true, mes: "removed from  wishlist" });
    }
  });
});

router.post("/profilepic", (req, res) => {
  id = req.session.user._id;
  console.log("profieeee");
  image1 = req.body.file;

  let path1 = `./public/user-images/${id}.jpg`;

  let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "");

  fs.writeFileSync(path1, img1, { encoding: "base64" });

  res.json({ status: true });
});

router.get("/cart", checkLogin, async (req, res) => {
  let item = await getCartProducts(req.session.user._id);
  items = item[0];
  offer_total = item[1];

  let cart_count = await cartCount(req.session.user._id);
  let total = await getTotalAmount(req.session.user._id);
  user = req.session.user;

  console.log("items", offer_total);
  res.render("user-pages/cart", {
    items,
    offer_total,
    total,
    user,
    cart_count,
    category: await getCategory(),
  });
});

router.get("/wishlist", checkLogin, async (req, res) => {
  let item = await getWishlistProducts(req.session.user._id);
  console.log("item", item);
  // items = item[0]
  // offer_total = item[1]
  let cart_count = await cartCount(req.session.user._id);
  // let total = await getTotalAmount(req.session.user._id)
  user = req.session.user;

  res.render("user-pages/wishlist", {
    item,
    user,
    cart_count,
    category: await getCategory(),
  });
});

router.post("/wishlist", (req, res) => {
  console.log("wishassdf", req.body);

  console.log("else ifffff");
  if (req.session.user) {
    userid = req.session.user._id;
    console.log("if");
    addtoWishList(userid, req.body.id).then((response) => {
      console.log(response);
      res.json(response);
    });
  } else {
    console.log("else");
    res.json({ status: false });
  }
});


router.post("/apply_coupon", (req, res) => {
  let total = parseInt(req.body.total);

  console.log(req.session.user._id);
  validateCoupon(req.body.code, total, req.session.user._id).then(
    (response) => {
      res.json(response);
    }
  );
});


router.post("/changequantity", (req, res) => {
  let cartId = req.body.cartid;
  let prodId = req.body.proid;
  let count = req.body.count;
  let qty = req.body.qty;
  console.log(cartId);
  console.log(prodId);
  console.log(count);
  changeQuantity(cartId, prodId, count, qty).then(async (result) => {
    let subtotal = await getSingle(req.session.user._id, cartId, prodId);

    let tot = await getTotalAmount(req.session.user._id);

    console.log("total$$", tot);

    if (result) {
      res.json({ status: true, total: tot, sub: subtotal[0] });
    }
  });
});

router.get("/signup", function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user-pages/user-signup", { noheader: true });
  }
});

router.post("/signup", function (req, res) {
  db.userSignup(req.body).then((data) => {
    if (data.status) {
      res.json({ status: true });
    } else {
      res.json({ status: false, mes: "User alredy exist Please login" });
    }
  });
});

router.get("/login", function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user-pages/user-login", { noheader: true });
  }
});

router.post("/login-google", function (req, res) {
  let token = req.body.token;
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    payload;
    return payload;
  }
  verify()
    .then((payload) => {
      googleSignin(payload).then((result) => {
        if (result) {
          req.session.user = result;

          res.cookie("session-token", token);
          res.send("Success");
        } else {
          res.send(false);
        }
      });
    })
    .catch(console.error);
});

router.post("/login", function (req, res) {
  db.userSignin(req.body).then((loggedin) => {
    let guest;

    if (loggedin == "block") {
      res.json({ status: false, message: "blocked by user" });
    } else if (loggedin) {
      if (req.session.guest) {
        guest = req.session.guest;
        console.log("guestttttttt");
      }

      req.session.user = {};
      req.session.user.email = loggedin.email;
      req.session.user._id = loggedin._id;
      req.session.user.isLoggedin = true;
      console.log(req.session);
      res.json({ status: true, guest });
    } else {
      res.json({ status: false, message: "Invalid credential" });
    }
  });
});

router.get("/product-detail", function (req, res, next) {
  let detail = req.query.id;

  findProduct(detail)
    .then(async (result) => {
      if (req.session.user) {
        let cart_count = await cartCount(req.session.user._id);

        let details = result[0];
        if (details) {
          console.log("pppppppppprrrrrooooo111", details);
          res.render("user-pages/product-detail", {
            details,
            cart_count,
            user,
            category: await getCategory(),
          });
        } else {
          res.redirect("/");
        }
      } else {
        let details = result[0];
        console.log("pppppppppprrrrrooooo2222222");
        if (details) {
          res.render("user-pages/product-detail", {
            details,
            user,
            category: await getCategory(),
          });
        } else {
          res.redirect("/");
        }
      }
    })
    .catch((result) => {
      res.redirect("/");
    });
});

router.post("/mobile_otp", (req, res) => {
  console.log(req.body.number);
  getNumber(req.body.number).then((result) => {
    console.log("resukt", result);

    if (result) {
      twilio.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.number}`,
          channel: "sms",
          message: "thsfasd",
        })
        .then((response) => {
          let status = response.status;
          if (status == "pending") {
            res.json({ status: true });
          }
        });
    } else {
      res.json({ status: "nonum", mes: "Number not registered" });
    }
  });
});

router.post("/signin-mobile_otp", (req, res) => {
  console.log(req.body.number);
  getNumber(req.body.number).then((result) => {
    console.log("resukt", result);

    if (!result) {
      twilio.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.number}`,
          channel: "sms",
          message: "thsfasd",
        })
        .then((response) => {
          let status = response.status;
          if (status == "pending") {
            res.json({ status: true });
          }
        });
    } else {
      res.json({ status: "nonum", mes: "Number already registered" });
    }
  });
});

router.post("/search-product", (req, res) => {
  searchProduct(req.body.keyword).then((result) => {
    if (result) {
      res.json({ body: result });
    } else {
      res.json({ body: false });
    }
  });
});

router.post("/checksearch", (req, res) => {
  checksearchProduct(req.body.keyword).then((result) => {
    if (result) {
      console.log("result", result);

      res.json({ body: result });
    } else {
      res.json({ body: false });
    }
  });
});

router.post("/checksearchbetween", (req, res) => {
  console.log("checkbetweeen");

  checksearchProductbetween(req.body.from, req.body.to).then((result) => {
    if (result) {
      console.log("result", result);

      res.json({ body: result });
    } else {
      res.json({ body: false });
    }
  });
});

router.post("/verify-otp", (req, res) => {
  let otp = req.body.oneTime;
  let number = req.body.number;
  console.log("verify_otp");
  console.log(otp, number);
  twilio.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((response) => {
      let status = response.status;
      let valid = response.valid;
      console.log(response);
      if (status == "approved" && valid == true) {
        getNumber(number).then((result) => {
          req.session.user = result;
          req.session.user._id = result._id;
          req.session.user.isLoggedin = true;
          req.session.user.email = result.email;
          res.json({ status: true });
        });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/signin-verify-otp", (req, res) => {
  let otp = req.body.oneTime;
  let number = req.body.number;
  console.log("verify_otp");
  console.log(otp, number);
  twilio.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((response) => {
      let status = response.status;
      let valid = response.valid;
      console.log(response);
      if (status == "approved" && valid == true) {
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/otp", (req, res) => {
  client.verify(serviceSID).verifications.create();
});

router.get("/order-details", checkLogin, async (req, res) => {
  let orderdetails = await getOrderDetials(req.session.user._id);
  console.log("?????", orderdetails);
  if (orderdetails[0]) {
    let cart_count = await cartCount(req.session.user._id);
    let status = await orderStatus(req.session.user._id);
    console.log(status);
    res.render("user-pages/order-details", {
      user,
      orderdetails,
      cart_count,
      status,
      category: await getCategory(),
    });
  } else {
    res.redirect("/");
  }
});

router.post("/buynow-place-order", async function (req, res) {
  console.log("buy now place order");
  console.log(req.body);
  let products = await findProduct(req.body.productid);
  total_amount = req.body.total_amount;

  let add = await getAddress(req.body.address, req.session.user.email);
  let selectedAddress = add.address.find(
    (address) => address.id == req.body.address
  );

  let product = [
    {
      item: products[0]._id,
      quantity: 1,
      staus: "placed",
    },
  ];
  console.log(total_amount);
  buynowplaceOrder(selectedAddress, req.body, product).then((result) => {
    req.session.user.ordersuccess = true;
    console.log(result);
    res.json({ status: true });
  });
});

router.post("/place-order", async function (req, res) {
  console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", req.query);

  if (req.body.prodid == "") {
    let products = await getCartProductList(req.body.userid);
    let total_amount = await getTotalAmount(req.body.userid);
    console.log(total_amount);
    if (req.query.coupon == "true") {
      let result = await validateCoupon(
        req.query.code,
        total_amount.total,
        req.session.user._id
      );
      total_amount.total = result.amount;
    } else {
    }

    let add = await getAddress(req.body.address, req.session.user.email);
    let selectedAddress = add.address.find(
      (address) => address.id == req.body.address
    );
    if (selectedAddress) {
      console.log("selected", selectedAddress);
      if (req.body.mode == "cod") {
        req.session.user.ordersuccess = true;
        placeOrder(
          selectedAddress,
          req.body,
          products,
          total_amount,
          req.query.code
        ).then((result) => {
          console.log(result);
          res.json({ codSuccess: true });
        });
      } else if (req.body.mode == "r_pay") {
        placeOrder(selectedAddress, req.body, products, total_amount).then(
          (id) => {
            console.log("resolved order id", id);

            userhelper.generateRazorpay(id, total_amount).then((result) => {
              req.session.user.ordersuccess = true;

              res.json(result);
            });
          }
        );
      }
    } else {
      res.json({ status: "noaddress" });
    }
  } else {
    let products = await findProduct(req.body.prodid);
    product = [
      {
        item: products[0]._id,
        quantity: 1,
        staus: "placed",
      },
    ];
    let tot = products[0].price;
    req.body.sudden = true;
    total_amount = {
      id: null,
      total: tot,
    };
    let add = await getAddress(req.body.address, req.session.user.email);
    let selectedAddress = add.address.find(
      (address) => address.id == req.body.address
    );
    if (selectedAddress) {
      console.log("selected", selectedAddress);
      console.log(req.body);
      if (req.body.mode == "cod") {
        req.session.user.ordersuccess = true;
        placeOrder(selectedAddress, req.body, product, total_amount).then(
          (result) => {
            console.log(result);
            res.json({ codSuccess: true });
          }
        );
      } else if (req.body.mode == "r_pay") {
        placeOrder(selectedAddress, req.body, product, total_amount).then(
          (id) => {
            console.log("resolved order id", id);

            userhelper.generateRazorpay(id, total_amount).then((result) => {
              req.session.user.ordersuccess = true;

              res.json(result);
            });
          }
        );
      }
    } else {
      res.json({ status: "noaddress" });
    }
  }
});



router.post('/deletefakeorder',(req,res)=>{
  console.log("9999999999999999999999999999",req.body);
  producthelper.deleteFakeOrder(req.body)
})

router.get("/address", checkLogin, async (req, res) => {
  console.log(req.query);
  if (req.query.sudden == "true") {
    let user = req.session.user._id;
    let email = req.session.user.email;

    let productId = req.query.prodid;
    let single_product = await findProduct(productId);
    if (single_product) {
      console.log("suddenn", single_product);
      let tot = single_product[0].price;
      console.log("total", tot);
      total_amount = {
        id: null,
        total: tot,
      };

      let address = await getuserAddress(email);
      if (address[0]) {
        let add = address[0].address;
        console.log("add", add);
        res.render("user-pages/address", {
          productId,
          add,
          user,
          noheader: true,
          total_amount,
        });
      } else {
        res.render("user-pages/address", {
          productId,
          user,
          noheader: true,
          total_amount,
        });
      }
    } else if (single_product == "Invalid url") {
      res.redirect("/");
    }
  } else {
    console.log("addresss worked again");
    let user = req.session.user._id;
    let email = req.session.user.email;
    let total_amount = await getTotalAmount(user);
    console.log(email);
    console.log(total_amount);
    let address = await getuserAddress(req.session.user.email);
    if (address[0]) {
      let add = address[0].address;
      console.log("add", add);
      res.render("user-pages/address", {
        add,
        user,
        noheader: true,
        total_amount,
      });
    } else {
      let total_amount = await getTotalAmount(user);
      res.render("user-pages/address", { user, noheader: true, total_amount });
    }
  }
});

router.post("/changestatus", checkLogin, async (req, res) => {
  console.log("changestatus post", req.body);
  let result = await changestatus(req.body.proid, req.body.id, req.body.newVal);

  res.json({ status: true });
});

router.post("/deletefinalcart", async (req, res) => {
  let user = req.session.user;
  console.log(user);
  console.log("asdasdasdas");
  deleteFinalcart(user._id).then(() => {
    res.json({ status: true });
  });
});

router.get("/buynow-add-address/:id", checkLogin, (req, res) => {
  console.log(req.body);
  id = req.params.id;
  console.log("id", id);
  user = req.session.user._id;
  email = req.session.user.email;
  let random = Math.floor(1000 + Math.random() * 9000);
  console.log(random);
  res.render("user-pages/buynow-add-address", {
    id,
    random,
    email,
    user,
    noheader: true,
  });
});

router.get("/add-address", checkLogin, (req, res) => {
  console.log("fromprofile", req.query);
  let profile;
  if (!req.query.id == "") {
    if (req.query.profile == "true") {
      profile = req.query.profile;
    }
    console.log("profile", profile);

    let productId = req.query.id;
    console.log(req.body);
    user = req.session.user._id;
    email = req.session.user.email;
    let random = Math.floor(1000 + Math.random() * 9000);
    console.log(random);
    res.render("user-pages/add-address", {
      productId,
      profile,
      random,
      email,
      user,
      noheader: true,
    });
  } else {
    if (req.query.profile == "true") {
      profile = req.query.profile;
    }
    console.log("profile", profile);
    user = req.session.user._id;
    email = req.session.user.email;
    let random = Math.floor(1000 + Math.random() * 9000);
    console.log(random);
    res.render("user-pages/add-address", {
      random,
      profile,
      email,
      user,
      noheader: true,
    });
  }
});

router.post("/add-address", (req, res) => {
  console.log(req.query);
  addAddress(req.body).then((result) => {
    console.log("result vannuuu", result);
    if (req.query.pro == "true") {
      console.log(req.query, "true");
      res.json({ status: result, profile: true });
    } else {
      res.json({ status: result });
    }
  });
});

router.get("/profile", checkLogin, async (req, res) => {
  let user = req.session.user;
  let cart_count = await cartCount(req.session.user._id);
  user_details = await getUserById(req.session.user._id);
  let address = await getuserAddress(req.session.user.email);
  if (address[0]) {
    let add = address[0].address;
  
    console.log(user_details);
    res.render("user-pages/profile", {
      add,
      user_details,
      user,
      cart_count,
      category: await getCategory(),
    });
  } else {
    res.render("user-pages/profile", {
      user_details,
      user,
      cart_count,
      category: await getCategory(),
    });
  }
});

router.post("/change-profile", checkLogin, (req, res) => {
  console.log(req.body);
  saveChanges(req.session.user.email, req.body).then((result) => {
    res.json(result);
  });
});

router.post("/set-password",(req,res)=>{
  console.log("set password");
  userhelper.setPassword(req.session.user._id,req.body)


})

router.get("/buynow/:id", checkLogin, async (req, res) => {
  user = req.session.user._id;
  console.log("paramuuuu");
  console.log(req.params);
  let proId = req.params.id;
  console.log("proid");
  console.log(proId);
  let address = await getuserAddress(req.session.user.email);
  if (address[0]) {
    let add = address[0].address;
    let result = await findProduct(proId);
    console.log(result);
    let total_amount = result[0].price;
    let productsid = result[0]._id;
    console.log(total_amount);
    res.render("user-pages/buynow", {
      productsid,
      add,
      proId,
      user,
      noheader: true,
      total_amount,
    });
  } else {
    findProduct(id).then((result) => {
      console.log(result);
      let total_amount = result[0].price;
      let productsid = result[0]._id;
      console.log(total_amount);
      res.render("user-pages/buynow", {
        productsid,
        id,
        user,
        proId,
        noheader: true,
        total_amount,
      });
    });
  }
});
router.post("/change-password", async (req, res) => {
  let response = await changePassword(
    req.body.old_password,
    req.body.new_password,
    req.session.user.email
  );
  if (response) {
    res.json({ status: true, mes: "Password changed successfully" });
  } else {
    res.json({ status: false, mes: "password not match" });
  }
});

router.post("/add-address", (req, res) => {
  addAddress(req.body).then((result) => {
    console.log("result vannuuu", result);
    res.json({ status: result });
  });
});

router.get("/delete-address", (req, res) => {
  let profile;
  let id = req.query.id;
  if (req.query.profile == "true") {
    profile = req.query.profile;
  }
  console.log("profile", profile);
  let prodid = req.query.prodid;
  if (!prodid == " ") {
    console.log(req.query.prodid);
    console.log("vallllll", id);
    let email = req.session.user.email;
    console.log(email, id);

    deleteAddress(email, id).then((result) => {
      res.redirect(`/address?sudden=true&&prodid=${prodid}`);
    });
  } else {
    console.log(req.query.prodid);
    console.log("vallllll", id);
    let email = req.session.user.email;
    console.log(email, id);

    deleteAddress(email, id).then((result) => {
      if (req.query.profile == "true") {
        res.redirect("/profile");
      } else {
        res.redirect("/address");
      }
    });
  }
});

router.get("/edit-address", async (req, res) => {
  let add;
  user = req.session.user.email;

  console.log(user);
  console.log(req.query);
  id = req.query.id;
  getAddress(req.query.id, user).then((response) => {
    response.address.find((elem) => {
      if (elem.id == req.query.id) {
        add = elem;
      }
    });
    console.log("adddresss", add);
    res.render("user-pages/editaddress", { id, user, add, noheader: true });
  });
});

router.post("/edit", (req, res) => {
  console.log("edit addressss", req.body);
  editAddress(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.get("/buynow-delete/:id/:prodid", (req, res) => {
  console.log(req.params);

  let id = req.params.id;
  let proid = req.params.prodid;
  console.log("#########", id);
  let email = req.session.user.email;
  console.log(email, id);

  deleteAddress(email, id).then((result) => {
    res.redirect(`/buynow/${proid}`);
  });
});

router.get("/suc", checkLogin, function (req, res, next) {
  if (req.session.user.ordersuccess) {
    res.render("user-pages/success", { noheader: true });
    req.session.user.ordersuccess = false;
  } else {
    res.redirect("/");
  }
});

router.get("/signout", function (req, res, next) {
  delete req.session.user;
  res.clearCookie("session-token");
  res.redirect("/");
});

module.exports = router;
