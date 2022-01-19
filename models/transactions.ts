export interface Transaction {
    reciever: string
    medium: BonkleBuck | Stock | Option | NFT | Mute | DiscordInvite
    sender: string
};

export interface BonkleBuck {
    type: 'BonkleBuck'
    ammount: number
}

export interface Stock {
    type: 'Stock'
    ticker: string,
    ammount: number,
}

export interface Option {
    type: 'Option'
    ticker: string,
    strike: number,
    contracts: number,
    option: 'Calls' | 'Puts',
    expiration: number, 
}

export interface NFT {
    type: 'NFT'
    id: string,
    image: string,
}

export interface DiscordInvite {
    type: 'DiscordInvite'
    ammount: number
}

export interface Mute {
    type: 'Mute'
    target: string
    sex: number
}

export interface Trade {
    sender: Transaction,
    reciever: Transaction,
}

export function createTransaction(sender: string, reciever: string, ammount: number){
    let medium: BonkleBuck = {
        type: 'BonkleBuck',
        ammount,
    }
    let t: Transaction = {
        sender, reciever, medium
    }
    return t;   
}

export function createShopTransaction(reciever: string, medium: BonkleBuck | Stock | Option | NFT | Mute | DiscordInvite){
    let t: Transaction = {
        sender: 'Bonkle Buck Broker', reciever, medium
    }
    return t;
}