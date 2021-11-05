import Song from "../../domainModel/song";

export default interface IDataBase{
    insertSong(song:Song):Promise<string>
    getSongs(query:Song): Promise<Song[]>
    getSong(query:Song): Promise<Song>
    updateSong(query:Song, song:Song):Promise<boolean>
    deleteSong(query:Song):Promise<boolean>
}
