import Song from "../models/song";
import song from "../models/song";

var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId
var database = require('../public/javascripts/DataBaseInterface');
var cors = require('cors')
var {app, corsOptions, songsManager} = require('../app')
var uuid = require('uuid');
const keycloak2 = require('../../../config/keycloak.js').getKeycloak();



router.get('/', cors(corsOptions), async function(req:any, res:any, next:any) {
  try{
    let query = <Song>{artista: new RegExp(req.query.artista,"i"),
                      nombre: new RegExp(req.query.nombre,"i"),
                      album: new RegExp(req.query.album,"i"),
                      letraCruda: new RegExp(req.query.letraCruda,"i")}
    let songs: Song[]
    let user = req.query.user
    if(user){
      if(req.kauth.grant.access_token.content.preferred_username === req.query.user){
        songs = songsManager.getPrivateSongs(user, query)
      }else{
        res.status(403).jsonp({message: "Access Denied to the requested resources"});
        return
      }
    }else{
      songs = songsManager.getPublicSongs(query)
    }
    res.jsonp(songs);
  }
  catch(error){
    console.log(error)
    res.status(500).jsonp({message:"Internal Server Error"});
  }
});


 router.get('/:id',  cors(corsOptions), async function(req:any, res:any, next:any) {
  try{
    let id = req.params.id
    let song = await songsManager.getSongById(id)
    if(song){
      if(req.kauth.grant.access_token.content.preferred_username === song.owner || song.owner === "public"){
        res.jsonp(song);
      }else{
        res.status(403).jsonp({message: "Access Denied to the requested resources"});
        return
      }
    }else{
      res.status(404).jsonp({message:"No songs matched the id"});
    }
  }
  catch(error){
    console.log(error)
    res.status(500).jsonp({message:"Internal Server Error"});
  }
});



  router.put('/:id',  cors(corsOptions), async function(req:any, res:any, next:any) {
    try{
      const id = req.params.id
      let song = await songsManager.getSongById(id);
      if(song ){
        if(req.kauth.grant.access_token.content.preferred_username === song.owner){
          let newSong:Song = req.body
          const updated = await songsManager.updateSongById(id, newSong)
          if(updated){
            res.jsonp({message:"Successfully edited one song."});
          }else{
            res.status(404).jsonp({message:"No songs matched the query. Edited 0 songs."});
          }       
        }else{
          res.status(403).jsonp({message: "Access Denied to the requested resources"});
          return
        }
      }else{
        res.status(404).jsonp({message:"No songs matched the query. Edited 0 songs."});
      }
    }catch(error){
      console.log(error)
      res.status(500).jsonp({message:"Internal Server Error"});
    }
  
});




 router.post('/',  cors(corsOptions), async function(req:any, res:any, next:any) {
  try{
    const song:Song = req.body
    song.owner = req.kauth.grant.access_token.content.preferred_username
    let result = await songsManager.createSong(song)
    if(result){
      res.status(201).jsonp({message:"Successfully added one song.", song});
    }else{
      res.status(502).jsonp({message:"An error ocurred. The song was not uploaded"});
    }
  }
  catch(error){
    console.log(error)
    res.status(500).jsonp({message:"Internal Server Error"});
  }
});


router.delete('/:id',  cors(corsOptions), async function(req:any, res:any, next:any) {
  try{
    let id = req.params.id
    let song = await songsManager.getSongById(id);
    if(song){
      if(req.kauth.grant.access_token.content.preferred_username !== song.owner){
        res.status(403).jsonp({message: "Access Denied to the requested resources"});
        return
      }else{
        const result = await songsManager.deleteSongById(id)
        if(result.deletedCount === 1){
          res.jsonp({message:"Successfully deleted one song", result});
        }else{
          res.status(404).jsonp({message:"The song was not deleted.", result});
        }
      }
    }else{
      res.status(404).jsonp({message:"No songs matched the query. Deleted 0 songs"});
      return
    }
  }
  catch(error){
    res.status(500).jsonp({message:"Internal Server Error"});
  }
});


module.exports = router;
router.options('/', cors(corsOptions)) // enable pre-flight request for DELETE request
router.options('/:id', cors(corsOptions)) // enable pre-flight request for DELETE request
