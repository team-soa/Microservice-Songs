import IDataBase from "./IDataBase"
import Song from "../models/song";

const MongoClient = require('mongodb').MongoClient

export default class MongoDataBase implements IDataBase{
    songsCollection:any
    constructor(connectionString:string){
        MongoClient.connect(connectionString, { useUnifiedTopology: true })
        .then((client:any) => {
          console.log('Connected to Database')
          const db = client.db("songs")
          this.songsCollection = db.collection('songs')
      }).catch((e:any)=> console.log(e))      
    }
    
    async insertSong(song:Song):Promise<string>{
      let result = await this.songsCollection.insertOne(song)
      return result.insertedId
    }

    async getSongs(query:Song): Promise<Song[]>{
      let songs:Song[] = []
      let data = await this.songsCollection.find(query)
        await data.forEach((song:Song) => {
            songs.push(song)
        });
      return songs
    }

    async getSong(query:Song): Promise<Song>{
        return await this.songsCollection.findOne(query)
    }


    async updateSong(query:Song, song:Song):Promise<boolean>{
        const result = this.songsCollection.updateOne(query, {"$set":song})
        return result.matchedCount === 1;
    }

    async deleteSong(query:Song):Promise<boolean> {
        const result = await database.songs.deleteOne(query)
        return result.deletedCount === 1
    }
}
