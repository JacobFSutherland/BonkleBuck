import { TokenContract } from ".";

export interface Transaction {
    reciever: string
    medium: BonkleBuck | Stock | Option | NFT | Mute | DiscordInvite | Token | TokenContract | Sound | ChangeNickname
    sender: string
};

export interface SupplyDetails {
    reward: number,
    circulatingSupply: number,
    deadWalletBal: number,
    cocksinoBal: number,
    brokerBal: number
}

export interface Token {
    type: 'Token'
    tokenName: string
    ammount: number
}

export interface Sound {
    type: 'Sound',
    ammount: number
}

export interface BonkleBuck {
    type: 'BonkleBuck'
    ammount: number
}

export interface Stock {
    type: 'Stock'
    ticker: string
    ammount: number
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
}

export interface ChangeNickname {
    type: 'ChangeNickname'
    target: string
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

export function createShopTransaction(reciever: string, medium: BonkleBuck | Stock | Option | NFT | Mute | DiscordInvite | Sound | ChangeNickname){
    let t: Transaction = {
        sender: 'Bonkle Buck Broker', reciever, medium
    }
    return t;
}