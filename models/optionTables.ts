import { Message, MessageEmbed } from "discord.js";
import got from "got/dist/source";
import parse from "node-html-parser";
import { Table, TableRow } from ".";

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
            let r: TableRow = {
                Strike: (Math.round(Number(strike) * 100) / 100).toFixed(2),
                Bid: (Math.round(Number(this.Calls[Number(strike)].bid) * 100) / 100).toFixed(2),
                Ask: (Math.round(Number(this.Calls[Number(strike)].ask) * 100) / 100).toFixed(2)

            }
            t.push(r);
        });
        embed.setDescription(t.printTable());
        return embed;
    }

    putsToStringEmbed(numberOfStrikes: number | undefined): MessageEmbed{
        if(!numberOfStrikes) numberOfStrikes = 10;
        let embed = new MessageEmbed;
        embed.setTitle('Puts: ');
        let t: Table = new Table();
        let strikes = Object.keys(this.Puts).sort((a,b)=>{return Number(a)-Number(b)});
        let lowerIndex = findLowerStrikeIndex(strikes, this.currentPrice);
        let upperIndex = findUpperStrikeIndex(strikes, this.currentPrice);
        lowerIndex = ((lowerIndex - numberOfStrikes/2) <= 0) ? 0 : (lowerIndex - numberOfStrikes/2)
        upperIndex = ((upperIndex + numberOfStrikes/2) >= strikes.length) ? strikes.length : (upperIndex + numberOfStrikes/2)
        console.log('Lower: ', strikes[lowerIndex]);
        console.log('Upper: ', strikes[upperIndex]);
        strikes = strikes.splice(lowerIndex, upperIndex-lowerIndex+1);
        strikes.forEach(strike => {
            let r: TableRow = {
                Strike: (Math.round(Number(strike) * 100) / 100).toFixed(2),
                Bid: (Math.round(Number(this.Puts[Number(strike)].bid) * 100) / 100).toFixed(2),
                Ask: (Math.round(Number(this.Puts[Number(strike)].ask) * 100) / 100).toFixed(2)            
            }
            t.push(r);
        });
        embed.setDescription(t.printTable());
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

export async function getStockPrice(ticker: string): Promise<number> {
    try{
        let res = await got({
            'method': 'GET',
            'url': `https://finance.yahoo.com/quote/${ticker}/`,
            'headers': {
              'pragma': 'no-cache',
              'cache-control': 'no-cache',
              'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
              'dnt': '1',
              'sec-ch-ua-mobile': '?0',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
              'sec-ch-ua-platform': '"Windows"',
              'accept': '*/*',
              'sec-fetch-site': 'same-origin',
              'sec-fetch-mode': 'cors',
              'sec-fetch-dest': 'empty',
              'accept-language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,zh-TW;q=0.6,zh;q=0.5',
            }
        });
        let html = parse(res.body);
        //document.querySelectorAll('#quote-header-info')[0].children[2].children[0].children[0].children[0].innerText
        let price = html.querySelectorAll('#quote-header-info')[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].innerText.replace(/,/g, '')
        console.log(price);
        return Number(price);

    }catch(e){
        console.log(e);
        console.log('Stock Error');
        return 0;
    }
}

export async function getOptions(ticker: string): Promise<OptionMap> {
    try{
        let res = await got({
            'method': 'GET',
            'url': `https://finance.yahoo.com/quote/${ticker}/options`,
            'headers': {
              'pragma': 'no-cache',
              'cache-control': 'no-cache',
              'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
              'dnt': '1',
              'sec-ch-ua-mobile': '?0',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
              'sec-ch-ua-platform': '"Windows"',
              'accept': '*/*',
              'sec-fetch-site': 'same-origin',
              'sec-fetch-mode': 'cors',
              'sec-fetch-dest': 'empty',
              'accept-language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,zh-TW;q=0.6,zh;q=0.5',
            }
        });
        let html = parse(res.body);
        let price = html.querySelectorAll('#quote-header-info')[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0].innerText.replace(/,/g, '');
        let optionMap: OptionMap = new OptionMap(Number(price));
        //document.querySelectorAll('#quote-header-info')[0].children[2].children[0].children[0].children[0].innerText
        console.log('Scraping Calls and Puts');
        console.log(html.querySelectorAll('tbody').length);
        let calls = html.querySelectorAll('tbody')[0].childNodes;
        let puts = html.querySelectorAll('tbody')[1].childNodes;
        console.log('Scraped Calls and Puts');
        let callTable: OptionTable = {};
        let putTable: OptionTable = {}
        console.log('Inserting Calls into Table');
        calls.forEach(option => {
            let optionStat: OptionStat = {
                bid: Number(option.childNodes[4].innerText.replace(/,/g, '')),
                ask: Number(option.childNodes[5].innerText.replace(/,/g, ''))
            }
            callTable[Number(option.childNodes[2].innerText.replace(/,/g, ''))] = optionStat;
        });
        console.log('Inserting Puts into Table');
        puts.forEach(option => {
            let optionStat: OptionStat = {
                bid: Number(option.childNodes[4].innerText.replace(/,/g, '')),
                ask: Number(option.childNodes[5].innerText.replace(/,/g, ''))
            }
            putTable[Number(option.childNodes[2].innerText.replace(/,/g, ''))] = optionStat;
        });
        optionMap.Calls = callTable;
        optionMap.Puts = putTable;
        return optionMap;
    }catch(e){
        console.log(e);
        console.log('Option Error');
        return new OptionMap(0);
    }
}