import IDataBase from "./database/IDataBase";
import MongoDataBase from "./database/MongoDataBase";
import ISongsManager from "./logic/ISongsManager";
import SongsManager from "./logic/SongsManager";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const keycloak = require('../../config/keycloak.js').initKeycloak();
var session = require('express-session');

var songsRouter = require('./routes/songs');

var corsOptions = {
  origin: ['http://localhost:4200/', 'http://168.62.39.210:3000/'],
  optionsSuccessStatus: 200
}

var app = express();

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/songs', songsRouter);

// catch 404 and forward to error handler
app.use(function(req: any, res: any, next: (arg0: any) => void) {
    next(createError(404));
  });
  
// error handler
app.use(function(err:any, req:any, res:any, next:any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const storageURL = 'https://soakaraokestorage.blob.core.windows.net';
const rabbitHost = "amqp://localhost"
const connectionString =  'mongodb+srv://client:HzKRkF8M52TTjidj@cluster0.uaqcj.mongodb.net/test'

let dataBase: IDataBase = new MongoDataBase(connectionString)
let songsManager: ISongsManager = new SongsManager(dataBase, storageURL)

export {app, corsOptions, songsManager}
