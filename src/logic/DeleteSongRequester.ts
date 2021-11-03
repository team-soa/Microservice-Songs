import IPreSender from "../messages/PreSender/IPreSender";
import RequestSongDeleteModel from "../models/requestSongDeleteModel";
import IDeleteSongRequester from "./IDeleteSongRequester";

export default class DeleteSongRequester implements  IDeleteSongRequester{
    deleteStorageSender: IPreSender
    constructor(deleteStorageSender: IPreSender) {
        this.deleteStorageSender = deleteStorageSender
    }
    requestDelete(filename:string){
        let requestDelete = <RequestSongDeleteModel>{file:filename}
        this.deleteStorageSender.send(JSON.stringify(requestDelete))
    }
}
