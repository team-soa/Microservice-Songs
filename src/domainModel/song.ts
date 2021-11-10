import Toms from "./toms";

export default class Song{
    album: string|RegExp| undefined
    artista: string|RegExp|undefined
    filename: string|RegExp|undefined
    letra: Toms[]|undefined
    letraCruda: string|RegExp|undefined
    nombre: string|RegExp|undefined
    owner: string|undefined
    language: string|undefined
    url: string|undefined
    _id: any
}
