import { EmbedFieldData, Message, MessageEmbed, User } from "discord.js";

export class TokenContract {
    type: 'TokenContract';
    stake: number;
    name: string;
    quantity: number;
    minter: string;
    description: string;
    holderCount: number;
    distribution: {[id: string] : number};
    constructor(tokenName: string, quantity: number, minter: string, description: string, stake: number){
        this.type = 'TokenContract';
        this.name = tokenName;
        this.quantity = quantity;
        this.minter = minter,
        this.description = description;
        this.holderCount = 1;
        this.distribution = {id: quantity};
        this.stake = stake;
    }
    toEmbed(): MessageEmbed {
        let fields: EmbedFieldData[] = [];
        fields.push({name: 'Quantity', value: this.quantity+'', inline: true})
        fields.push({name: 'Token Creator', value: `<@!${this.minter}>`, inline: true})
        let embed = new MessageEmbed()
            .setTitle(this.name)
            .addFields(fields)
            .setDescription(this.description)
        return embed;
    }
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