import { COCK_SERVER_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, TRADING_COMMISSION } from "../env"
import { BonkleBuck, Option, OptionMap, OptionValue, Stock, toEmbed, Token, TokenContract, Trade, Transaction } from "../models"
import { Message, MessageEmbed } from 'discord.js'

export class AssetController {

    private currentBalances: {[id: string] : number}
    private currentNFTs: {[id: string] : string[]}
    private currentStocks: {[id: string] : {[ticker: string]: number}}
    private currentOptions: {[id: string]: {[ticker: string]: {[strike: number]: OptionValue}}} 
    private currentTokens: {[name: string] : TokenContract}
    constructor(){
        this.currentBalances = {};
        this.currentNFTs = {};
        this.currentStocks = {};
        this.currentOptions = {};
        this.currentTokens = {};
    }

    getTokenEmbed(token: string): MessageEmbed[] {
        
        if(this.currentTokens[token]){
            //console.log('return big chungus'); 
            let t = this.currentTokens[token];
            //console.log(`embed: `, JSON.stringify(t));
            let embed = toEmbed(t);
            return embed;
        }
        console.log('return nothing');
        return [new MessageEmbed().setTitle('Coin not found')];

    }

    getAllTokens(): string {
        return JSON.stringify(this.currentTokens);
    }
    
    withdrawReward(b: number){
        this.currentBalances['BLOCK_REWARD'] -= b;
    }

    verifyUniqueToken(name: string): boolean {
        name = name.trim();
        return !this.currentTokens[name];
    }

    getTokenBalance(token: string, id: string) {
        if(this.verifyUniqueToken(token)) return 0;
        if(!this.currentTokens[token].distribution[id])
            this.currentTokens[token].distribution[id] = 0;
        return this.currentTokens[token].distribution[id]
    }

    sendToken(token: string, reciever: string, sender: string, ammount: number): Transaction {
        let medium: Token = {
            type: 'Token',
            tokenName: token,
            ammount,
        }
        let t: Transaction = {
            sender,
            reciever,
            medium
        }
        return t;
    }

    verifyEnoughToken(token: string, userID: string, quantity: number): boolean{
        if(this.verifyUniqueToken(token)) return false;
        if(!this.currentTokens[token].distribution[userID])
            this.currentTokens[token].distribution[userID] = 0;
        this.currentTokens[token].distribution[userID] -=quantity;
        if(this.currentTokens[token].distribution[userID] >= 0){
            return true;
        }
        this.currentTokens[token].distribution[userID] +=quantity;
        return false;
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
        let type = t.medium.type;
        switch(type){
            case 'BonkleBuck':
                let m = t.medium as BonkleBuck;
                this.addBonkleDelta(t.reciever, m.ammount)
                if(fullSync){
                    this.addBonkleDelta(t.sender, -m.ammount);
                } 
                return false;
            case 'DiscordInvite':
                this.addBonkleDelta(t.sender, -50);
                return !fullSync;
            case 'Stock':
                let s = t.medium as Stock;
                this.addStockDelta(t.reciever, s.ticker, s.ammount);
                if(fullSync){
                    this.addStockDelta(t.sender, s.ticker, -s.ammount);
                }
                return true;

            case 'Option':
                let o = t.medium as Option;
                this.addOptions(t.reciever, o);
                if(fullSync){
                    this.removeOptions(t.sender, o);
                }
                return false;
            case 'Mute':
                return false;
            case 'NFT':
                return false;
            case 'Token':
                let token = t.medium as Token;
                this.addTokenDelta(t.reciever, token.tokenName, token.ammount);
                if(fullSync){
                    this.addTokenDelta(t.sender, token.tokenName, -token.ammount);
                }
                return false;
            case 'TokenContract':
                let contract = t.medium as TokenContract;
                this.currentTokens[contract.name] = contract;
                return false;
        }
    }


    verifyEnoughBonkle(discordID: string, bucks: number): Boolean {
        if(!this.currentBalances[discordID]){
            this.currentBalances[discordID] = 0;
        }
        if(bucks > 0){
            this.currentBalances[discordID] -= bucks;
            if(this.currentBalances[discordID] >= 0){
                return true; 
            }
            this.currentBalances[discordID] += bucks;
        }
        return false;
    }

    sendBonkle(reciever: string, sender: string, a: number): Transaction{
        let bonkle: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: a,
        }
        let t: Transaction = {
            reciever,
            sender,
            medium: bonkle
        }
        return t;
    }

    addBonkleDelta(discordID: string, bucks: number): void {
        if(!this.currentBalances[discordID]) this.currentBalances[discordID] = 0
        this.currentBalances[discordID] += bucks;
    }

    addStockDelta(discordID: string, ticker: string, ammount: number){
        if(!this.currentStocks[discordID]) this.currentStocks[discordID] = {};
        if(!this.currentStocks[discordID][ticker]) this.currentStocks[discordID][ticker] = 0;
        this.currentStocks[discordID][ticker] += ammount;
    }

    addOptions(discordID: string, o: Option){
        if(!this.currentOptions[discordID]) this.currentOptions[discordID] = {};
        if(!this.currentOptions[discordID][o.ticker]) this.currentOptions[discordID][o.ticker] = [];
        if(!this.currentOptions[discordID][o.ticker][o.strike]) this.currentOptions[discordID][o.ticker][o.strike] = {Calls: 0, Puts: 0};
        this.currentOptions[discordID][o.ticker][o.strike][o.option] += o.contracts;
    }

    addTokenDelta(DiscordID: string, tokenName: string, tokens: number): void {
        if(!this.currentTokens[tokenName]){
            console.log(`Token name ${tokenName} does not exist`);
        }
        if(!this.currentTokens[tokenName].distribution){
            console.log(`Token name ${tokenName} does not have any holders`);
        }
        if(!this.currentTokens[tokenName].distribution[DiscordID]){
            this.currentTokens[tokenName].distribution[DiscordID] = 0;
        }
        this.currentTokens[tokenName].distribution[DiscordID] += tokens;
    }


    removeOptions(discordID: string, o: Option){
        if(!this.currentOptions[discordID]) this.currentOptions[discordID] = {};
        if(!this.currentOptions[discordID][o.ticker]) this.currentOptions[discordID][o.ticker] = [];
        if(!this.currentOptions[discordID][o.ticker][o.strike]) this.currentOptions[discordID][o.ticker][o.strike] = {Calls: 0, Puts: 0};
        this.currentOptions[discordID][o.ticker][o.strike][o.option] -= o.contracts;
    }

    /*
        Verification Functions
    */
    
    initStocks(id: string, ticker: string): number {
        if(!this.currentStocks[id]) this.currentStocks[id] = {};
        if(!this.currentStocks[id][ticker]) this.currentStocks[id][ticker] = 0;
        console.log(`this.currentStocks[${id}][${ticker}] = ${this.currentStocks[id][ticker]}`);
        return this.currentStocks[id][ticker];
    }

    verifyBuyStock(discordID: string, ticker: string, stockPrice: number, quantity: string): Boolean {
        if(!validPositiveInteger(quantity) && !validPositiveInteger(stockPrice+'')) return false;
        let totalCost = (Number(quantity) * stockPrice + TRADING_COMMISSION);
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

    /*
        End of Verification Functions
    */

    tradeStock(buyer: string, seller: string, ticker: string, stockPrice: number, quantity: number): Trade {
        let stockCost = Number(quantity)*stockPrice;
        let commission = (Number(buyer))? TRADING_COMMISSION: -TRADING_COMMISSION;
        this.initStocks(seller, ticker);
        this.initStocks(buyer, ticker);
        this.currentStocks[buyer][ticker] -= quantity;
        console.log(stockCost);
        console.log(commission);
        let stockMedium: Stock = {
            ticker: `$${ticker}`,
            type: 'Stock',
            ammount: quantity,
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

    tradeOption(buyer: string, seller: string, ticker: string, optionType: 'Puts' | 'Calls', strike: number, contracts: number, cost: number): Trade {

        this.getOptions(seller, ticker, optionType, strike);
        this.currentOptions[seller][ticker][strike][optionType] -= contracts;
        let optionMedium: Option = {
            ticker: `$${ticker}`,
            type: 'Option',
            option: optionType,
            strike,
            contracts,
            expiration: 0,
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: cost
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

    getOptions(id: string, ticker: string, optionType: 'Puts' | 'Calls', strike: number): number {
        if(!this.currentOptions[id]) this.currentOptions[id] = {};
        if(!this.currentOptions[id][ticker]) this.currentOptions[id][ticker] = {};
        if(!this.currentOptions[id][ticker][strike]) this.currentOptions[id][ticker][strike] = {Puts: 0, Calls: 0};
        return this.currentOptions[id][ticker][strike][optionType];
    }


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

        let puts = new MessageEmbed()
            .setTitle('Put Options')
        let calls = new MessageEmbed()
            .setTitle('Call Options')
        let tickers = Object.keys(this.currentOptions[id])
        for(let i = 0; i < tickers.length; i++){
            let strikes = Object.keys(this.currentOptions[id][tickers[i]])
            for(let j = 0; j < strikes.length; j++){
                if(this.currentOptions[id][tickers[i]][Number(strikes[j])].Puts)
                    puts.addField(`${tickers[i]} at $${strikes[j]} Strike`, this.currentOptions[id][tickers[i]][Number(strikes[j])].Puts + '');
                if(this.currentOptions[id][tickers[i]][Number(strikes[j])].Calls)
                    calls.addField(`${tickers[i]} at $${strikes[j]} Strike`, this.currentOptions[id][tickers[i]][Number(strikes[j])].Calls + '');
            }
        }
        return [stockEmbed, puts, calls];
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
