import IDataBase from "../applicationServices/database/IDataBase";
import MongoDataBase from "../applicationServices/database/MongoDataBase";
import ISongsManager from "../domainServices/managers/ISongsManager";
import SongsManager from "../domainServices/managers/SongsManager";
import IDeleteSongRequester from "../domainServices/requesters/IDeleteSongRequester";
import DeleteSongRequester from "../domainServices/requesters/DeleteSongRequester";
import IMessageExecuter from "../domainServices/executers/IMessageExecuter";
import UpdateSongKeyExecuter from "../domainServices/executers/UpdateSongKeyExecuter";
import IUserKeyRequester from "../domainServices/requesters/IUserKeyRequester";
import UserKeyRequester from "../domainServices/requesters/UserKeyRequester";
import IMessageReceiver from "../applicationServices/messages/listener/IMessageReceiver";
import MessageReceiver from "../applicationServices/messages/listener/MessageReceiver";
import IPreSender from "../applicationServices/messages/PreSender/IPreSender";
import QueuePreSender from "../applicationServices/messages/PreSender/QueuePreSender";
import IQueueSender from "../applicationServices/messages/senders/IQueueSender";
import RabbitSender from "../applicationServices/messages/senders/RabbitSender";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const keycloak = require('../applicationServices/config/keycloak').initKeycloak();
var session = require('express-session');

var songsRouter = require('../applicationServices/routes/songs');

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
const rabbitHost = "amqp://"+process.env.rabbit_url
const connectionString =  'mongodb+srv://client:HzKRkF8M52TTjidj@cluster0.uaqcj.mongodb.net/test'
const deleteSongQueue = 'deleteFile'
const requestStorageKeyQueue = 'requestUserKey'
const updateSongKeyQueue = 'updateSongKey'


let dataBase: IDataBase = new MongoDataBase(connectionString)
let sender: IQueueSender = new RabbitSender(rabbitHost);
let deleteSongPreSender: IPreSender = new QueuePreSender(sender, deleteSongQueue)
let requestKeyPreSender: IPreSender = new QueuePreSender(sender, requestStorageKeyQueue)
let deleteSongRequester: IDeleteSongRequester = new DeleteSongRequester(deleteSongPreSender)
let userKeyRequester: IUserKeyRequester = new UserKeyRequester(requestKeyPreSender)
let messageReceiver: IMessageReceiver = new MessageReceiver(rabbitHost)
let songsManager: ISongsManager = new SongsManager(dataBase, storageURL, deleteSongRequester, userKeyRequester)
let updateSongKeyExecuter: IMessageExecuter = new UpdateSongKeyExecuter(songsManager)

messageReceiver.setListener(updateSongKeyQueue, updateSongKeyExecuter)

export {app, corsOptions, songsManager}
