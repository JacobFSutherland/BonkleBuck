import { EmbedFieldData, MessageEmbed } from "discord.js";

export class TokenContract {
    type: 'TokenContract';
    stake: number;
    name: string;
    quantity: number;
    minter: string;
    description: string;
    distribution: {[id: string] : number};
    constructor(tokenName: string, quantity: number, minter: string, description: string, stake: number){
        this.type = 'TokenContract';
        this.name = tokenName;
        this.quantity = quantity;
        this.minter = minter,
        this.description = description;
        this.distribution = {};
        this.distribution[minter] = quantity;
        this.stake = stake;
    }
}

export function toEmbed(t: TokenContract): MessageEmbed[] {
    let fields: EmbedFieldData[] = [];
    let holderBals: string = '';
    let users: string[] = Object.keys(t.distribution);
    fields.push({name: 'Quantity', value: t.quantity+'', inline: true})
    fields.push({name: 'Token Creator', value: `<@!${t.minter}>`, inline: true})
    
    for(let i = 0; i < users.length; i++){
        holderBals += `<@!${users[i]}> holds ${t.distribution[users[i]]} ${t.name}\n`
    }

    let embed = new MessageEmbed()
        .setTitle(t.name)
        .addFields(fields)
        .setDescription(t.description)

    let holders = new MessageEmbed()
        .setTitle('Holders: ')
        .setDescription(holderBals)

    return [embed, holders];
}

export class WorkContract {
    type: 'WorkContract';
    name: string;
    description: string;
    bounty: string;
    minter: string;
    fulfillers: string[];
    constructor(name: string, description: string, bounty: string, minter: string){
        this.type = 'WorkContract'
        this.name = name;
        this.description = description;
        this.bounty = bounty;
        this.minter = minter;
        this.fulfillers = [];
    }

    addFulfiller(fulfillerID: string): boolean {
        return this.fulfillers.push(fulfillerID) > 0;
    }


}