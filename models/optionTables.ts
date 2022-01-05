import { Message, MessageEmbed } from "discord.js";
import Table from "easy-table"

export interface OptionStat {
    bid: number,
    ask: number,
}

export interface OptionValue {
    Calls: number,
    Puts: number,
}

export interface OptionTable {
    [strike: number]: OptionStat,
}

export class OptionMap {
    currentPrice: number;
    Calls: OptionTable;
    Puts: OptionTable;
    constructor(price: number){
        this.Calls = {};
        this.Puts = {};
        this.currentPrice = price;
    }



    callsToStringEmbed(numberOfStrikes: number | undefined): MessageEmbed{
        if(!numberOfStrikes) numberOfStrikes = 10;
        let embed = new MessageEmbed;
        embed.setTitle('Calls: ');
        let t = new Table();
        let strikes = Object.keys(this.Calls).sort((a,b)=>{return Number(a)-Number(b)});
        let lowerIndex = findLowerStrikeIndex(strikes, this.currentPrice);
        let upperIndex = findUpperStrikeIndex(strikes, this.currentPrice);
        lowerIndex = ((lowerIndex - numberOfStrikes/2) <= 0) ? 0 : (lowerIndex - numberOfStrikes/2)
        upperIndex = ((upperIndex + numberOfStrikes/2) >= strikes.length) ? strikes.length : (upperIndex + numberOfStrikes/2)
        console.log('Lower: ', strikes[lowerIndex]);
        console.log('Upper: ', strikes[upperIndex]);
        strikes = strikes.splice(lowerIndex, upperIndex-lowerIndex+1);
        strikes.forEach(strike => {
            t.cell('Strike', (Math.round(Number(strike) * 100) / 100).toFixed(2));
            t.cell('Bid', (Math.round(Number(this.Calls[Number(strike)].bid) * 100) / 100).toFixed(2));
            t.cell('Ask', (Math.round(Number(this.Calls[Number(strike)].ask) * 100) / 100).toFixed(2));
            t.newRow();

        });
        embed.setDescription(t.toString());
        return embed;
    }

    putsToStringEmbed(numberOfStrikes: number | undefined): MessageEmbed{
        if(!numberOfStrikes) numberOfStrikes = 10;
        let embed = new MessageEmbed;
        embed.setTitle('Puts: ');
        let t = new Table();
        let strikes = Object.keys(this.Puts).sort((a,b)=>{return Number(a)-Number(b)});
        let lowerIndex = findLowerStrikeIndex(strikes, this.currentPrice);
        let upperIndex = findUpperStrikeIndex(strikes, this.currentPrice);
        lowerIndex = ((lowerIndex - numberOfStrikes/2) <= 0) ? 0 : (lowerIndex - numberOfStrikes/2)
        upperIndex = ((upperIndex + numberOfStrikes/2) >= strikes.length) ? strikes.length : (upperIndex + numberOfStrikes/2)
        console.log('Lower: ', strikes[lowerIndex]);
        console.log('Upper: ', strikes[upperIndex]);
        strikes = strikes.splice(lowerIndex, upperIndex-lowerIndex+1);
        strikes.forEach(strike => {
            t.cell('Strike', (Math.round(Number(strike) * 100) / 100).toFixed(2));
            t.cell('Bid', (Math.round(Number(this.Puts[Number(strike)].bid) * 100) / 100).toFixed(2));
            t.cell('Ask', (Math.round(Number(this.Puts[Number(strike)].ask) * 100) / 100).toFixed(2));
            t.newRow();
        });
        embed.setDescription(t.toString());
        return embed;
    }

    isEmpty(): Boolean {
        return (Object.keys(this.Calls).length === 0 && Object.keys(this.Puts).length === 0)
    }

}

function findUpperStrikeIndex(strikeArr: string[], price: Number): number{
    for(let i = 0; i < strikeArr.length; i++){
        if(Number(strikeArr[i]) > price) return i;
    }
    return strikeArr.length;
}

function findLowerStrikeIndex(strikeArr: string[], price: Number): number{
    for(let i = strikeArr.length; i > 0; i--){
        if(Number(strikeArr[i]) < price) return i;
    }
    return 0;
}