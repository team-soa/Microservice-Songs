import Song from "../models/song";
import IDataBase from "../database/IDataBase";
import {ObjectId} from "mongodb";
import Toms from "../models/toms";
import ISongsManager from "./ISongsManager";
import IDeleteSongRequester from "./IDeleteSongRequester";
import IUserKeyRequester from "./IUserKeyRequester";
import { songsManager } from "../app";
const uuid = require('uuid');

export default class SongsManager implements ISongsManager{
    dataBase:IDataBase
    storageURL: string
    deleteSongRequester: IDeleteSongRequester
    userKeyRequester: IUserKeyRequester

    constructor(dataBase: IDataBase, storageURL: string, deleteSongRequester: IDeleteSongRequester, userKeyRequester: IUserKeyRequester) {
        this.dataBase = dataBase;
        this.storageURL = storageURL;
        this.deleteSongRequester = deleteSongRequester;
        this.userKeyRequester = userKeyRequester;
    }

    async createSong(song: Song): Promise<boolean>{
        delete song._id
        song.filename = uuid.v1();
        song.url = this.storageURL+'/'+song.owner+'/'+song.filename
        if(song.letra){
            song.letraCruda = "";
            song.letra.forEach((content:Toms) => song.letraCruda +=" "+ content.words)
        }
        let songId =  await this.dataBase.insertSong(song)
        if(songId){
            this.userKeyRequester.requestKey(<string>song.owner, songId);
            return true
        }else {
            return false
        }
    }
    async getSongById(id:string): Promise<Song>{
        let query:Song = <Song>{_id: new ObjectId(id)}
        return await this.dataBase.getSong(query)
    }
    async getPrivateSongs(user: string, query:Song): Promise<Song[]>{
        query.owner = user
        return await this.dataBase.getSongs(query)
    }
    async getPublicSongs(query:Song): Promise<Song[]>{
        query.owner = "public"
        return await this.dataBase.getSongs(query)
    }
    async updateSongById(id:string, song:Song):Promise<boolean>{
        const query:Song = <Song>{_id: new ObjectId(id)}
        delete song._id
        if(song.letra){
            song.letraCruda = "";
            song.letra.forEach((content:Toms) => song.letraCruda +=" "+ content.words)
        }
        return await this.dataBase.updateSong(query, song)
    }
    async deleteSongById(id:string): Promise<boolean>{
        let query =<Song> {_id: new ObjectId(id)}
        let song = await this.getSongById(id)
        let result = await this.dataBase.deleteSong(query)
        if(result){
            this.deleteSongRequester.requestDelete( <string> song.filename, <string>song.owner)
        }
        return result
    }
}
