import IPreSender from "../messages/PreSender/IPreSender";
import RequestKeyModel from "../models/requestKeyModel";
import IUserKeyRequester from "./IUserKeyRequester";

export default class UserKeyRequester implements IUserKeyRequester{
    requestUserKeySender: IPreSender
    constructor(requestUserKeySender: IPreSender) {
        this.requestUserKeySender = requestUserKeySender
    }
    requestKey(user:string, songId:string){
        let requestKeyModel = <RequestKeyModel>{user, songId}
        this.requestUserKeySender.send(JSON.stringify(requestKeyModel))
    }
}
