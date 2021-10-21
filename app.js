var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const handlebars=require('express-handlebars')
var db=require('./config/connection')
var fileUpload=require('express-fileupload')
const session = require('express-session');
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID="360791234082-kap1r32c2bjt3fg3ip28qvp6fplu26ui.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);



const passport = require('passport');
var userProfile;


var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',handlebars({
  extname:'hbs',
defaultLayout:'layout',
layoutsDir:__dirname+'/views/layouts',
partialsDir:__dirname+'/views/partials',


helpers:{
  calculation:function(value){
    return value+1

  }  
}
}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge:6000000 }
}))

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});



app.use(passport.initialize());
app.use(passport.session());




db.connect((err)=>{
  if(err) console.log("error",err);
  else console.log("data base connected");

})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

module.exports = app;
