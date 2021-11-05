import IMessageExecuter from "./IMessageExecuter";
import ISongsManager from "../managers/ISongsManager";
import receiveKeyModel from "../requesters/models/receiveKeyModel";
import Song from "../../domainModel/song";

export default class UpdateSongKeyExecuter implements IMessageExecuter{
    songsManager: ISongsManager
    constructor(songsManager: ISongsManager) {
        this.songsManager = songsManager;
    }
    async executeMessage(message: string) {
        let request:receiveKeyModel = JSON.parse(message)
        let song = await this.songsManager.getSongById(request.songId!)
        song.url += "?"+request.key!
        await this.songsManager.updateSongById(request.songId!, song)
    }
}
