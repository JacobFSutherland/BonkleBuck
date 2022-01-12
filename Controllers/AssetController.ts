import { COCK_SERVER_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, TRADING_COMMISSION } from "../env"
import { BonkleBuck, Option, OptionMap, OptionValue, Stock, Trade, Transaction } from "../models"
import { Message, MessageEmbed } from 'discord.js'
import { CronJob } from 'cron';

export class AssetController {
    private currentBalances: {[id: string] : number}
    private currentNFTs: {[id: string] : string[]}
    private currentStocks: {[id: string] : {[ticker: string]: number}}
    private currentOptions: {[id: string]: {[ticker: string]: {[strike: number]: OptionValue}}} 
    constructor(){
        this.currentBalances = {};
        this.currentNFTs = {};
        this.currentStocks = {};
        this.currentOptions = {};
    }
    
    withdrawReward(b: number){
        this.currentBalances['BLOCK_REWARD'] -= b;
    }

    syncNetwork(blocks: Message<boolean>[], fullSync: boolean): Transaction[] {
        let ordersToFulfill: Transaction[] = [];
        blocks.forEach(block => {
            let blockTransactions = block.embeds[0].fields;
            for(let i = 2; i < blockTransactions.length; i++){
                let t = JSON.parse(blockTransactions[i].value.slice(1, blockTransactions[i].value.length-1)) as Transaction;
                if(this.syncTransaction(t, fullSync)) ordersToFulfill.push(t);
            }
        });
        return ordersToFulfill;
    }

    syncTransaction(t: Transaction, fullSync: boolean): boolean{
        if(t.medium.type === 'BonkleBuck'){
            this.currentBalances[t.reciever] = (this.currentBalances[t.reciever]) ? this.currentBalances[t.reciever] += t.medium.ammount : t.medium.ammount;
            if(fullSync) this.currentBalances[t.sender] = (this.currentBalances[t.sender])? this.currentBalances[t.sender]-=t.medium.ammount : -t.medium.ammount;
        }else if(t.medium.type === 'Stock'){
            if(!this.currentStocks[t.reciever]){
                this.currentStocks[t.reciever] = {};
            }
            if(!this.currentStocks[t.reciever][t.medium.ticker]){
                this.currentStocks[t.reciever][t.medium.ticker] = 0;
            }
            console.log(`adding ${t.medium.ammount} to ${t.medium.ticker} for ${t.reciever}`)
            this.currentStocks[t.reciever][t.medium.ticker] += Number(t.medium.ammount);
            console.log(`${t.reciever} now has ${this.currentStocks[t.reciever][t.medium.ticker]} ${t.medium.ticker}`)

            if(fullSync) {
                if(!this.currentStocks[t.sender]){
                    this.currentStocks[t.sender] = {};
                }
                if(!this.currentStocks[t.sender][t.medium.ticker]){
                    this.currentStocks[t.sender][t.medium.ticker] = 0;
                }
                console.log(`removing ${t.medium.ammount} from ${t.medium.ticker} for ${t.sender}`)
                this.currentStocks[t.sender][t.medium.ticker] -= Number(t.medium.ammount);
                console.log(`${t.sender} now has ${this.currentStocks[t.sender][t.medium.ticker]} ${t.medium.ticker} left`)
            }
        }else if(t.medium.type === 'DiscordInvite' || t.medium.type === 'Mute'){
            return !fullSync;

        }else if(t.medium.type === 'Option'){
            if(!this.currentOptions[t.reciever]) this.currentOptions[t.reciever] = {};
            if(!this.currentOptions[t.reciever][t.medium.ticker]) this.currentOptions[t.reciever][t.medium.ticker] = [];
            if(!this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike]) this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike] = {Calls: 0, Puts: 0};
            this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike][t.medium.option] += t.medium.contracts;
            console.log(`${t.reciever} now has ${this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike][t.medium.option]} ${t.medium.ticker} options at the ${t.medium.strike} strike`)

            if(fullSync) {
                if(!this.currentOptions[t.sender]) this.currentOptions[t.sender] = {};
                if(!this.currentOptions[t.sender][t.medium.ticker]) this.currentOptions[t.sender][t.medium.ticker] = [];
                if(!this.currentOptions[t.sender][t.medium.ticker][t.medium.strike]) this.currentOptions[t.sender][t.medium.ticker][t.medium.strike] = {Calls: 0, Puts: 0};
                this.currentOptions[t.sender][t.medium.ticker][t.medium.strike][t.medium.option] -= t.medium.contracts;
                console.log(`${t.sender} now has ${this.currentOptions[t.sender][t.medium.ticker][t.medium.strike][t.medium.option]} ${t.medium.ticker} options at the ${t.medium.strike} strike`)
            }
        }
        return false;

    }

    verifyEnoughBonkle(discordID: string, bucks: string): Boolean {
        if(!this.currentBalances[discordID]){
            this.currentBalances[discordID] = 0;
        }
        if(validPositiveNumber(bucks)){
            this.currentBalances[discordID] -= Number(bucks);
            if(this.currentBalances[discordID] >= 0){
                return true; 
            }
            this.currentBalances[discordID] += Number(bucks);
        }
        return false;
    }

    sendBonkle(reciever: string, sender: string, a: string): Transaction{
        let bonkle: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: Number(a),
        }
        let t: Transaction = {
            reciever,
            sender,
            medium: bonkle
        }
        return t;
    }

    returnFrozenAssets(discordID: string, bucks: string): void {
        this.currentBalances[discordID] += Number(bucks);
    }

    freezeAssets(discordID: string, bucks: string): void {
        this.currentBalances[discordID] -= Number(bucks);
    }

    /*
        Verification Functions
    */
    
    verifyBuyStock(discordID: string, ticker: string, stockPrice: number, quantity: string): Boolean {
        if(!validPositiveInteger(quantity) && !validPositiveInteger(stockPrice+'')) return false;
        let totalCost = (Number(quantity) * stockPrice + TRADING_COMMISSION) + '';
        return this.verifyEnoughBonkle(discordID, totalCost);
    }

    verifySellStock(discordID: string, ticker: string, stockPrice: number, quantity: string): Boolean {
        if(ticker.charAt(0) !== '$'){
            ticker = '$' + ticker;
        }
        if(!this.currentStocks[discordID][ticker]){
            this.currentStocks[discordID][ticker] = 0;
            return false;
        }
        if(!validPositiveInteger(quantity)) return false;
        console.log('Valid Positive Quantity')
        this.currentStocks[discordID][ticker] -= Number(quantity)
        if(this.currentStocks[discordID][ticker] < 0){
            console.log('Not enough stock');
            console.log('user has ', this.currentStocks[discordID][ticker])
            console.log('user wanted to sell ', quantity)
            this.currentStocks[discordID][ticker] += Number(quantity)
            return false;
        } 

        let totalCost = Number(quantity) * stockPrice - TRADING_COMMISSION;
        console.log(totalCost);
        return (totalCost > 0);
    }

    verifyBuyOption(discordID: string, optionChain: OptionMap, input: string[]): Boolean {
        let type: 'Calls' | 'Puts' | undefined = (input[2].indexOf('call') != -1)? 
            'Calls': (input[2].indexOf('put') != -1)? 
            'Puts': undefined;
        if(type === undefined || optionChain.isEmpty() || !validPositiveInteger(input[4])) return false;
        console.log('Trying to buy ', type);
        let contracts = Number(input[4]);
        let strike = Number(input[3]);
        let optionPrice = optionChain[type][strike].ask;
        if(!Number(contracts) && optionPrice <= 0) return false;
        let totalCost = (optionPrice * Number(contracts) * 100 + TRADING_COMMISSION) + '';
        console.log(`Total cost: ${totalCost}`);
        return this.verifyEnoughBonkle(discordID, totalCost);
    }
    

    verifySellOption(discordID: string, optionChain: OptionMap, input: string[]): Boolean {
        let type: 'Calls' | 'Puts' | undefined = (input[2].indexOf('call') != -1)? 
        'Calls': (input[2].indexOf('put') != -1)? 
        'Puts': undefined;
        if(type === undefined || !Number(input[4]) || optionChain.isEmpty() ||
            !Number(input[3]) || validPositiveInteger(input[4])) return false;

        let contracts = Number(input[4]);
        let strike = Number(input[3]);
        let optionPrice = optionChain[type][strike].ask;
        if(!Number(contracts) && optionPrice <= 0) return false;
        let totalCost = (optionPrice * Number(contracts) * 100 - TRADING_COMMISSION);
        return (totalCost > 0);
    }


    /*
        End of Verification Functions
    */

    tradeStock(buyer: string, seller: string, ticker: string, stockPrice: number, quantity: string): Trade {
        let stockCost = Number(quantity)*stockPrice;
        let commission = (Number(buyer))? TRADING_COMMISSION: -TRADING_COMMISSION;
        console.log(stockCost);
        console.log(commission);
        let stockMedium: Stock = {
            ticker: `$${ticker}`,
            type: 'Stock',
            ammount: Number(quantity)
        }
        let stockTransaction: Transaction = {
            sender: seller,
            reciever: buyer,
            medium: stockMedium
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: stockCost + commission,
        }
        let bonkleBuckTransaction: Transaction = {
            sender: buyer,
            reciever: seller,
            medium: bonkleBuckMedium
        }
        let t: Trade = {
            sender: bonkleBuckTransaction,
            reciever: stockTransaction,
        }
        return t;
    }
    
    /*
    Start of Trades
    */

    tradeOption(buyer: string, seller: string, optionChain: OptionMap, input: string[]): Trade {
        let option: 'Calls' | 'Puts' = (input[2].indexOf('call') != -1)? 
        'Calls': 'Puts'
        let ticker = input[1].replace('$', '');
        let contracts = Number(input[4]);
        let strike = Number(input[3]);
        let optionPrice = optionChain[option][strike].ask;
        let comission = (Number(buyer))? TRADING_COMMISSION: -TRADING_COMMISSION;
        let optionMedium: Option = {
            ticker: `$${ticker}`,
            type: 'Option',
            option,
            strike: strike,
            contracts,
            expiration: 0,
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: optionPrice*100*Number(contracts) + comission,
        }

        let optionTransaction: Transaction = {
            reciever: buyer,
            sender: seller,
            medium: optionMedium
        }

        let bonkleBuckTransaction: Transaction = {
            reciever: seller,
            sender: buyer,
            medium: bonkleBuckMedium
        }
        let t: Trade = {
            sender: bonkleBuckTransaction,
            reciever: optionTransaction,
        }
        return t;
    }

    /*
    End of Trades
    */


    getStockPortfolioEmbed(id: string): MessageEmbed[] {
        let embed: MessageEmbed[] = [];
        let stockEmbed = new MessageEmbed()
            .setTitle('Stocks')
        console.log(this.currentStocks);
        if(!this.currentStocks[id]) this.currentStocks[id] = {};
        let keys = Object.keys(this.currentStocks[id]);
        for(let i = 0; i < keys.length; i++){
            console.log(`${keys[i]}, ${this.currentStocks[id][keys[i]]}`)
            stockEmbed.addField(keys[i], this.currentStocks[id][keys[i]] + '', true)
        }
        if(keys.length == 0) stockEmbed.setDescription('Litterally nothing');

        let puts = Object.keys(this.currentOptions[id][''])
        for(let i = 0; i < puts.length; i++){

        }
        embed.push(stockEmbed);
        return embed
    }

    getBonkleBalance(id: string): number {
        if(this.currentBalances[id]){
            return this.currentBalances[id];
        }
        this.currentBalances[id] = 0;
        return 0;
    }

    getEconParticipants(): string[] {
        return Object.keys(this.currentBalances);
    }
    
}
function validPositiveInteger(n: string): boolean{
    return Boolean((Number(n) && Number(n) > 0 && Number.isInteger(Number(n))))
}

function validPositiveNumber(n: string): boolean{
    return Boolean((Number(n) && Number(n) > 0))
}
