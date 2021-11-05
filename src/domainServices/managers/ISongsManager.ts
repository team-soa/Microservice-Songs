import Song from "../../domainModel/song";

export default interface ISongsManager{
    createSong(song: Song): Promise<boolean>
    getSongById(id:string): Promise<Song>
    getPrivateSongs(user: string, query:Song): Promise<Song[]>
    getPublicSongs(query:Song): Promise<Song[]>
    updateSongById(id:string, song:Song): Promise<boolean>
    deleteSongById(id:string): Promise<boolean>
}
