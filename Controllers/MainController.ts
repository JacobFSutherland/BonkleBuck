import { AnyChannel, Channel, Client, Collection, FetchChannelOptions, Message, TextChannel, MessageEmbed, Invite, User, GuildMember } from "discord.js";
import { parse } from 'node-html-parser';
import got from "got/dist/source";
import { CockChain, Banker, Shopkeeper, Bandit } from "../Discord/Client/DiscordBot";
import { BlockGuess, Transaction, BonkleBuck, NFT, Stock, Option, DiscordInvite, OptionTable, OptionMap, OptionStat, OptionValue } from "../models";
import { BlockController } from "./"; 
import { ENVIRONMENT_VARIABLES } from '../env'

const { BLOCK_CHANNEL_ID, BANDIT_TOKEN, COCKSINO_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, COCK_SERVER_CHANNEL_ID, MINING_CHANNEL_ID, BAAZAR_CHANNEL_ID, COCK_EXCHANGE_CHANNEL_ID, STOCK_TRANSACTION_FEE, COCKCHAIN_TOKEN, BANKER_TOKEN, BLOCK_REWARD, BLOCK_TIME, SHOPKEEPER_TOKEN } = ENVIRONMENT_VARIABLES; 

console.log('Cockchain Logging in');
let cockchain = CockChain.login(COCKCHAIN_TOKEN);

console.log('Banker Logging in');
let banker = Banker.login(BANKER_TOKEN);

console.log('Shopkeeper Logging in');
let shop = Shopkeeper.login(SHOPKEEPER_TOKEN);

console.log('Bandit Logging in');
let bandit = Bandit.login(BANDIT_TOKEN);


export class MainController{
    private currentBalances: {[id: string] : number}
    private currentNFTs: {[id: string] : string[]}
    private currentStocks: {[id: string] : {[ticker: string]: number}}
    private currentOptions: {[id: string]: {[ticker: string]: {[strike: number]: OptionValue}}}
    private BlockchainBot: Client;
    private BankerBot: Client;
    private ShopkeeperBot: Client;
    private Bandit: Client;
    private BlockController: BlockController;
    constructor(){
        this.currentBalances = {};
        this.currentNFTs = {};
        this.currentStocks = {};
        this.currentOptions = {};
        this.BlockchainBot = CockChain;
        this.BankerBot = Banker;
        this.Bandit = Bandit;
        this.ShopkeeperBot = Shopkeeper;
        this.BlockController = new BlockController(BLOCK_REWARD, BLOCK_TIME);
    }
    async start(){
        console.log('Starting Bots');
        await this.startClient();
        console.log('Creatting Block')
        this.BlockController.createNewBlock();
    }

    startClient() {
        // Block Miner
        this.startBlockChainBot();
        this.startBankerBot();
        this.startShopkeeperBot();
        this.startBandit();
    }

    startBandit() {
        this.Bandit.on('messageCreate', message => {
            if(message.author.bot) return;
            if(message.channelId === COCKSINO_CHANNEL_ID){
                console.log('Bandit Request made: ', message.content.toLowerCase());
                let msg = message.content.toLowerCase().split(' ')
                if(msg[0] === '!gamble'){
                    let banditEmbed: MessageEmbed = new MessageEmbed()
                        .setTitle('Warning: All games give you the risk to get kicked')
                        .addFields([
                            {name: 'How do I do a coin flip?', value: 'You do a coinflip with \`!flip [Bonkle Buck Wager]\` if you win, you get your wager, but if you lose, you lose your wager and there is a 1% chance you will get kicked'},
                            {name: 'How do I do a coin flip if I have no bonkle bucks?', value: 'You do a dangerous coinflip with \`!flip danger\` where you can win 50 bonkle bucks, or lose access to the server'}  
                        ])
                    message.channel.send({embeds: [banditEmbed]});
                }
                if(msg[0] === '!flip'){
                    if(msg[1]){
                        if(Number(msg[1]) && this.currentBalances[message.author.id] && this.currentBalances[message.author.id] >= Number(msg[1])){
                            this.currentBalances[message.author.id] -= Number(msg[1]);
                            let medium: BonkleBuck = {
                                type: 'BonkleBuck',
                                ammount: Number(msg[1])
                            }
                            if(Math.random() >= 0.5){
                                message.channel.send(`Unfortunate outcome! you gained ${msg[1]} Bonkle Bucks in the next block`);
                                this.currentBalances[message.author.id] += Number(msg[1]);
                                let t: Transaction = {
                                    reciever: message.author.id,
                                    medium,
                                    sender: 'COCKSINO'
                                }
                                this.BlockController.addTransactionToBlock(t);
                                return;
                            }else{
                                message.channel.send(`Congradulations! you lost ${msg[1]} Bonkle Bucks`);
                                let t: Transaction = {
                                    reciever: 'COCKSINO',
                                    medium,
                                    sender: message.author.id
                                }
                                this.BlockController.addTransactionToBlock(t);
                                if(Math.random() < 0.01){
                                    message.channel.send(`Congradulations! you also got kicked`);
                                    sleep(3000).then(()=>{
                                        message.member?.kick(); 
                                    }) 
                                }
                                return;
                            }
                            
                        }
                        if(msg[1] === 'danger'){
                            if(Math.random() >= 0.5){
                                message.channel.send(`Unfortunate outcome! you gained 50 Bonkle Bucks in the next block`);
                                let t: Transaction = {
                                    reciever: message.author.id,
                                    medium: {
                                        type: 'BonkleBuck',
                                        ammount: 50
                                    },
                                    sender: 'COCKSINO'
                                }
                                this.BlockController.addTransactionToBlock(t);
                            }else{
                                message.channel.send(`Congradulations! you got kicked`);
                                sleep(3000).then(()=>{
                                    message.member?.kick(); 
                                }) 
                            }
                        }
                        if(msg[1] === 'danger'){
                            
                        }
                    }
                        
                }
                
            }
            
        })
    }

    startShopkeeperBot() {
        this.ShopkeeperBot.on('messageCreate', message => {
            if(message.author.bot) return;
            if(message.channelId === BAAZAR_CHANNEL_ID){
                console.log('Shop Request made: ', message.content.toLowerCase());
                let msg = message.content.toLowerCase().split(' ')
                if(msg[0] === '!shop'){
                    let shopInventoryEmbed: MessageEmbed = new MessageEmbed()
                        .setTitle('Items for Sale')
                        .setDescription('These are the items for sale today')
                        .addFields(
                            {name: 'discordInvite', value: '50 Bonkle Bucks'},
                            {name: 'mute', value: '10 Bonkle Bucks'}
                        )
                    message.channel.send({embeds: [shopInventoryEmbed]})
                }
                if(msg[0] === '!buy'){
                    if(msg[1] === 'discordinvite'){

                        this.currentBalances[message.author.id] -= 50;
                        console.log('Bonkle bucks if transaction goes through: ', this.currentBalances[message.author.id]);
                        if(this.currentBalances[message.author.id] < 0){
                            message.channel.send('Cannot Buy Item, not enough Bonkle Bucks');
                            this.currentBalances[message.author.id] += 50;
                            return;
                        }
                        let purchasedGoods: DiscordInvite = {
                            type: "DiscordInvite",
                            ammount: 1
                        }
                        let goodsPurchased: Transaction = {
                            reciever: message.author.id,
                            medium: purchasedGoods,
                            sender: 'Bonkle Buck Broker',
                        }

                        let payment: BonkleBuck = {
                            type: 'BonkleBuck',
                            ammount: 50
                        }

                        let goodsPayment: Transaction = {
                            reciever: 'Bonkle Buck Broker',
                            medium: payment,
                            sender: message.author.id,
                        }

                        message.channel.send('Invite Purchased, You will recieve your invite on the next block');
                        this.BlockController.addTransactionToBlock(goodsPayment);
                        this.BlockController.addTransactionToBlock(goodsPurchased);
                        return;
                    }
                    message.channel.send(`Transaction failed, try being less poor and/or cringe`);
                    }
                    if(msg[1] === 'mute'){
                        // Mute msg[2]
                    }
                }
                
        })
    }

    startBankerBot() {
        this.BankerBot.on('messageCreate', async(message) => {
            if(message.author.bot) return;
            if(message.channelId === COCK_EXCHANGE_CHANNEL_ID){
                if(message.content.toLowerCase() === '!cock'){
                    let stockHelpEmbed: MessageEmbed = new MessageEmbed()
                            .setTitle('Commands')
                            .addFields(
                                { name: 'How do I buy stocks?', value: '\`!buy [Stock Ticker] [Ammount]\` You can only buy whole numbers of stock' },
                                { name: 'How do I sell stocks?', value: '\`!sell [Stock Ticker] [Ammount]\` You can only sell whole numbers of stock' },
                                { name: 'How do I see how much a stock is worth?', value: '\`!stock [Stock Ticker]\`'},
                                { name: 'How do I know how much a stock costs?', value: 'A stock that costs $10.25 USD on the New York Stock Exchange will cost 10.25 Bonkle Bucks'},
                                { name: 'How do I see what stocks I own?', value: '\`!portfolio\`'},
                                { name: 'How do I buy options?', value: '\`!buyOption [Stock Ticker] [Option Type] [Strike Price] [Ammount]\` You can only buy whole numbers of options'},
                                { name: 'How do I sell options?', value: '\`!sellOption [Stock Ticker] [Option Type] [Strike Price] [Ammount]\` You can only sell whole numbers of options'},
                                { name: 'What types of options are there?', value: 'Calls, and Puts'},
                                { name: 'What is a call option?', value: 'A call option is a financial contract that allows you to purchase 100 shares of the underlying stock at the specified strike price'},
                                { name: 'What is a put option?', value: 'A put option is a financial contract that allows you to sell 100 shares of the underlying stock at the specified strike price'},
                                { name: 'How do I see the current option prices?', value: 'Use \`!optionTree [Stock Ticker]\`'},
                                { name: 'When do the option contracts expire?', value: 'Every Friday at 4:00 PM PST'},
                                { name: 'Are there any transaction fees?', value: `There is a 10 Bonkle Buck commission charge per trade` },
                                { name: 'How do I get a quote for how much a transaction will cost?', value: 'For stocks: \`!quote [Stock Ticker] [Number of Shares]\`\nFor options: \`!quoteOption [Stock Ticker] [Option Type] [Strike Price] [Number of Contracts]\`'}
                            )
                    let stockTerminologyEmbed: MessageEmbed = new MessageEmbed()
                            .setTitle('Terminology')
                            .addFields(
                                { name: 'Stock Ticker', value: 'A stock ticker is a unique identifyer for a stock. To find the stock ticker for a company, google the company, and add stock ticker' },
                                { name: 'Shares', value: 'A Share is a small fraction of an entire company' },
                                { name: 'Quote', value: 'A Quote is an estimate as to how much a transaction would cost'},
                                { name: 'Portfolio', value: 'The collection of the stocks you own'},
                                { name: 'What is a call option?', value: 'A call option is a financial contract that allows you to purchase 100 shares of the underlying stock at the specified strike price'},
                                { name: 'What is a put option?', value: 'A put option is a financial contract that allows you to sell 100 shares of the underlying stock at the specified strike price'},
                            )
                    message.channel.send({embeds:[stockHelpEmbed, stockTerminologyEmbed]});
                }
                if(message.content.toLowerCase() === '!portfolio'){
                    let portfolio: MessageEmbed = this.getStockPortfolioEmbed(message.author.id)
                    message.channel.send({embeds: [portfolio]});
                }
                let msg = message.content.toLowerCase().split(' ');
                if(msg.length === 2 && msg[0] === '!stock'){
                    msg[1] = msg[1].replace('$', '');
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    message.channel.send(`$${msg[1]} is currently trading for $${stockValue}`);
                    return;
                }
                if(msg[0] === '!buy'){
                    if(!this.currentBalances[message.author.id]){
                        this.currentBalances[message.author.id] = 0;
                    }
                    console.log('Bonkle bucks before transaction: ', this.currentBalances[message.author.id]);
                    msg[1] = msg[1].replace('$', '');
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    if(this.validateInput(msg)) message.channel.send("Try doing the command right next time");
                    let totalCost = stockValue * Number(msg[2]) + STOCK_TRANSACTION_FEE;
                    this.currentBalances[message.author.id] -= totalCost;
                    console.log('Bonkle bucks if transaction goes through: ', this.currentBalances[message.author.id]);
                    if(this.currentBalances[message.author.id] < 0){
                        message.channel.send('Buy order failed, not enough Bonkle Bucks');
                        this.currentBalances[message.author.id] += totalCost;
                        return;
                    }
                    this.buyStock(msg[1], Number(msg[2]), stockValue, message.author.id)
                    message.channel.send('Buy order successfully submitted to block');
                    return;

                }

                if(msg[0] === '!sell' && Number(msg[2]) && Number(msg[2]) > 0 ){
                    msg[1] = msg[1].replace('$', '');
                    if(!this.currentStocks[message.author.id]){
                        this.currentStocks[message.author.id] = {};
                    }
                    if(!this.currentStocks[message.author.id][msg[1]]){
                        this.currentStocks[message.author.id][msg[1]] = 0
                    }
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    if(this.validateInput(msg)) message.channel.send("Try doing the command right next time");
                    let transactionDelta: number = Number(msg[2])*stockValue-STOCK_TRANSACTION_FEE;
                    if(transactionDelta < 0){
                        console.log('Owned shares: ', this.currentStocks[message.author.id][msg[1]])
                        message.channel.send('Sell order failed, the cost of the stocks is lower than the commission');
                        return;
                    }
                    this.currentStocks[message.author.id][msg[1]] -= Number(msg[2])
                    if(this.currentStocks[message.author.id][msg[1]] <= 0){
                        this.sellStock(msg[1], Number(msg[2]), stockValue, message.author.id)
                        message.channel.send('Sell order successfully submitted to block');
                        return;
                    }else{
                        this.currentStocks[message.author.id][msg[1]] += Number(msg[2])
                        console.log('Owned shares: ', this.currentStocks[message.author.id][msg[1]])
                        message.channel.send('Sell order failed, not enough shares owned');
                        return
                    }

                        
                }

                if(msg[0] === '!quote'){
                    //console.log(Quo)
                    if(this.validateInput(msg)) message.channel.send("Try doing the command right next time");
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    message.channel.send(`$${msg[1]} is currently trading for $${stockValue}. To purchase ${msg[2]} shares, it will cost ${Number(msg[2])*stockValue+10} Bonkle Bucks`);
                    return;
                }

                if(msg[0] === '!quoteoption'){
                    let chain = await this.getOptions(msg[1]);
                    if(!chain.isEmpty()) {
                        message.channel.send({embeds: [chain.callsToStringEmbed(undefined), chain.putsToStringEmbed(undefined)]});
                        return;
                    }else{
                        message.channel.send(`No options found for $${msg[1]}`);
                        return;
                    }
                }
                //{ name: 'How do I buy options?', value: '\`!buyOption [Stock Ticker] [Option Type] [Strike Price] [Ammount]\` You can only buy whole numbers of options'},
                if(msg[0] === '!buyoption' && msg.length === 5){
                    if(!this.currentBalances[message.author.id]){
                        this.currentBalances[message.author.id] = 0;
                    }
                    console.log('Bonkle bucks before transaction: ', this.currentBalances[message.author.id]);
                    msg[1] = msg[1].replace('$', '');
                    let optionChain: OptionMap = await this.getOptions(msg[1]);
                    let totalCost: number = -1;
                    if(msg[2] === 'call' && optionChain.Calls[Number(msg[3])]) totalCost = optionChain.Calls[Number(msg[3])].ask * Number(msg[4]) * 100;
                    if(msg[2] === 'put' && optionChain.Puts[Number(msg[3])]) totalCost = optionChain.Puts[Number(msg[3])].ask * Number(msg[4]) * 100;
                    if(totalCost <= 0){
                        message.channel.send('Buy order failed, Fucko Boingo');
                        return;
                    }
                    this.currentBalances[message.author.id] -= totalCost;
                    console.log('Bonkle bucks if transaction goes through: ', this.currentBalances[message.author.id]);
                    if(this.currentBalances[message.author.id] < 0){
                        message.channel.send('Buy order failed, not enough Bonkle Bucks');
                        this.currentBalances[message.author.id] += totalCost;
                        return;
                    }
                    this.buyOption(msg, message.author.id, totalCost);
                    message.channel.send('Buy order successfully submitted to block');
                    return;
                }

                //{ name: 'How do I buy options?', value: '\`!buyOption [Stock Ticker] [Option Type] [Strike Price] [Ammount]\` You can only buy whole numbers of options'},
                if(msg[0] === '!selloption' && msg.length === 5){
                    if(!this.currentOptions[message.author.id]){
                        this.currentOptions[message.author.id] = {};
                    }
                    if(!this.currentOptions[message.author.id][msg[1]]){
                        if(!this.currentOptions[message.author.id][msg[1]][Number(msg[3])]){
                            this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Calls = 0;
                            this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Puts = 0;
                        }
                    }
                    let optionChain: OptionMap = await this.getOptions(msg[1]);
                    let transactionDelta: number = -1;
                    if(msg[2] === 'call' && optionChain.Calls[Number(msg[3])]) transactionDelta = optionChain.Calls[Number(msg[3])].bid * Number(msg[4]) * 100;
                    if(msg[2] === 'put' && optionChain.Puts[Number(msg[3])]) transactionDelta = optionChain.Puts[Number(msg[3])].bid * Number(msg[4]) * 100;
                    if(transactionDelta < 0){
                        console.log('Owned contracts: ', this.currentStocks[message.author.id][msg[1]])
                        message.channel.send('Sell order failed, the cost of the stocks is lower than the commission');
                        return;
                    }
                    if(msg[2] === 'call' && optionChain.Calls[Number(msg[3])]) this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Calls -= Number(msg[4])
                    if(msg[2] === 'put' && optionChain.Puts[Number(msg[3])]) this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Puts -= Number(msg[4])
                    let call = this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Calls;
                    let put = this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Puts;
                    if((put && call > 0) || (put > 0 && call) || (put > 0 && call > 0) ){
                        this.sellOption(msg, message.author.id, transactionDelta);
                        message.channel.send('Sell order successfully submitted to block');
                        return;
                    }else{
                        if(msg[2] === 'call' && optionChain.Calls[Number(msg[3])]) this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Calls += Number(msg[4])
                        if(msg[2] === 'put' && optionChain.Puts[Number(msg[3])]) this.currentOptions[message.author.id][msg[1]][Number(msg[3])].Puts += Number(msg[4])
                        console.log('Owned shares: ', this.currentStocks[message.author.id][msg[1]])
                        message.channel.send('Sell order failed, not enough shares owned');
                        return
                    }
                }
            }  
        })
    }

    sellOption(msg: string[], initiatorID: string, transactionDelta: number) {
        let optionMedium: Option = {
            ticker: `$${msg[1].replace('$', '')}`,
            type: 'Option',
            contracts: Number(msg[4]),
            strike: Number(msg[3]),
            expiration: Date.now(),
            option: 'Calls'
        }
        if(msg[2] == 'put') optionMedium.option = 'Puts';

        let stockTransaction: Transaction = {
            sender: initiatorID,
            reciever: 'BonkleBuckBanker',
            medium: optionMedium
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: transactionDelta-STOCK_TRANSACTION_FEE
        }
        let bonkleBuckTransaction: Transaction = {
            sender: 'BonkleBuckBanker',
            reciever: initiatorID,
            medium: bonkleBuckMedium
        }
        this.BlockController.addTransactionToBlock(stockTransaction);
        this.BlockController.addTransactionToBlock(bonkleBuckTransaction);
    }

    
    buyOption(msg: string[], initiatorID: string, totalCost: number) {
        
        let optionMedium: Option = {
            ticker: `$${msg[1].replace('$', '')}`,
            type: 'Option',
            contracts: Number(msg[4]),
            strike: Number(msg[3]),
            expiration: Date.now(),
            option: 'Calls'
        }
        if(msg[2] == 'put') optionMedium.option = 'Puts';

        let stockTransaction: Transaction = {
            sender: 'BonkleBuckBanker',
            reciever: initiatorID,
            medium: optionMedium
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: totalCost+STOCK_TRANSACTION_FEE
        }
        let bonkleBuckTransaction: Transaction = {
            sender: initiatorID,
            reciever: 'BonkleBuckBanker',
            medium: bonkleBuckMedium
        }
        this.BlockController.addTransactionToBlock(stockTransaction);
        this.BlockController.addTransactionToBlock(bonkleBuckTransaction);
    }

    getStockPortfolioEmbed(id: string): MessageEmbed {
        let embed = new MessageEmbed()
            .setTitle('Portfolio')
        if(!this.currentStocks[id]) this.currentStocks[id] = {};
        let keys = Object.keys(this.currentStocks[id]);
        for(let i = 0; i < keys.length; i++){
            embed.addField(keys[i], this.currentStocks[id][keys[i]] + '', true)
        }
        if(keys.length == 0) embed.setDescription('Litterally nothing');
        return embed
    }

    buyItem(itemPurchased: Transaction, BonklebucksSpent: Transaction){
        
    }

    buyStock(ticker: string, numberOfStock: number, stockPrice: number, initiatorID: string, ) {
        let stockMedium: Stock = {
            ticker: `$${ticker}`,
            type: 'Stock',
            ammount: numberOfStock
        }
        let stockTransaction: Transaction = {
            sender: 'BonkleBuckBanker',
            reciever: initiatorID,
            medium: stockMedium
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: numberOfStock*stockPrice+STOCK_TRANSACTION_FEE
        }
        let bonkleBuckTransaction: Transaction = {
            sender: initiatorID,
            reciever: 'BonkleBuckBanker',
            medium: bonkleBuckMedium
        }
        this.BlockController.addTransactionToBlock(stockTransaction);
        this.BlockController.addTransactionToBlock(bonkleBuckTransaction);
    }

    sellStock(ticker: string, numberOfStock: number, stockPrice: number, initiatorID: string) {
        let stockMedium: Stock = {
            ticker: `$${ticker}`,
            type: 'Stock',
            ammount: numberOfStock
        }
        let stockTransaction: Transaction = {
            sender: initiatorID,
            reciever: 'BonkleBuckBanker',
            medium: stockMedium
        }
        let bonkleBuckMedium: BonkleBuck = {
            type: 'BonkleBuck',
            ammount: numberOfStock*stockPrice-STOCK_TRANSACTION_FEE,
        }
        let bonkleBuckTransaction: Transaction = {
            sender: 'BonkleBuckBanker',
            reciever: initiatorID,
            medium: bonkleBuckMedium
        }
        this.BlockController.addTransactionToBlock(stockTransaction);
        this.BlockController.addTransactionToBlock(bonkleBuckTransaction);
    }

    validateInput(msg: string[]): Boolean {
        if(msg.length !== 3 || msg[2].includes('.') || Number(msg[2]) <= 0){
            return true;
        }
        return false;
    }

    async getStockPrice(ticker: string): Promise<number> {
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

    async getOptions(ticker: string): Promise<OptionMap> {
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
    

    startBlockChainBot() {
        this.BlockchainBot.on('messageCreate', (message) => {
            if(message.channelId === BLOCK_CHANNEL_ID){
                console.log('Syncronizing new block');
                this.syncNetwork([message], false);
            }

            if(message.author.bot) return;
            
            if(message.channelId === MINING_CHANNEL_ID){
                let guess: BlockGuess = {
                    id: message.author.id,
                    answer: message.content,
                }
                this.BlockController.trySolution(guess).then(t => {
                    if(t && t.medium.type === 'BonkleBuck') this.currentBalances['BLOCK_REWARD'] -= t.medium.ammount;
                    console.log('Exiting out of function in listener')
                    return;
                })
                console.log('Exiting out of listener')
                return;
            }

            if(message.channelId === BAAZAR_CHANNEL_ID){
                let msg = message.content.toLowerCase();
                if(msg === '!bal'){
                    message.channel.send(`Your balance is ${(this.currentBalances[message.author.id])?this.currentBalances[message.author.id]:0} Bonkle Bucks`)
                }

                if(msg === '!supply'){
                    message.channel.send(`There are ${-this.currentBalances['Blocco']} Bonkle Bucks in circulation`)
                }

                if(msg === '!help'){

                    if(this.currentBalances[message.author.id] || this.currentBalances[message.author.id] > 0){
                        message.channel.send('Thank you for helping out the community by donating everyone an equal share of your current sum of bonkle bucks.');
                        let sharedBucks = this.currentBalances[message.author.id];
                        this.currentBalances[message.author.id] = 0;
                        let users = Object.keys(this.currentBalances);
                        
                        let authorIndex = users.indexOf(message.author.id);
                        let BloccoIndex = users.indexOf('Blocco');
                        users.splice(authorIndex, 1);
                        users.splice(BloccoIndex, 1);
                        let medium: BonkleBuck = {
                            ammount: sharedBucks / users.length,
                            type: "BonkleBuck"
                        };
                        users.forEach(user => {
                            let t: Transaction = {
                                reciever: user,
                                medium,
                                sender: message.author.id,
                            }
                            this.BlockController.addTransactionToBlock(t);
                        })

                    }else{
                        let helpEmbed: MessageEmbed = new MessageEmbed()
                            .setTitle('Commands')
                            .addFields(
                                { name: 'How to get Bonkle Bucks?', value: `Head over to <#${MINING_CHANNEL_ID}> and solve some blocks to recieve bonkle bucks` },
                                { name: 'How do I send Bonkle Bucks?', value: 'To send Bonkle Bucks, use the command \`!send [discord ID] [Bonkle/NFT] [ammount/NFT ID]\`' },
                                { name: 'What can I use Bonkle Bucks for?', value: `You can buy, and sell stocks and options that are on the New York Stock Exchange. For Stock help use \`!cock\' in <${COCK_EXCHANGE_CHANNEL_ID}>` },
                                { name: 'What else can I use Bonkle Bucks for?', value: `You can gamble your life savings away in in <${COCKSINO_CHANNEL_ID}> use \`!gamble\' to see where you can burn your bonkle bucks.` },
                            )
                        message.channel.send({embeds:[helpEmbed]});
                    }
                    
                }

                if(msg.includes('!send')  ){
                    let msgArr = msg.split(' ');

                    // Command Validation
                    if(msgArr.length !== 4 || !(msgArr[2] == 'nft' || msgArr[2] == 'bonkle')) {
                        message.channel.send(`The correct usage is \`!send [discord ID] [Bonkle/NFT] [ammount/NFT ID]\``);
                        return;
                    }

                    // Transaction Medium Validation
                    if(msgArr[2] == 'bonkle' && Number(msgArr[3]) && Number(msgArr[3]) > 0){
                        //temp hold on funds to not double spend
                        this.currentBalances[message.author.id] -= Number(msgArr[3])
                        console.log('Holding Balance');
                        if(this.currentBalances[message.author.id] > 0) {
                            let medium: BonkleBuck = {
                                ammount: Number(msgArr[3]),
                                type: "BonkleBuck"
                            }
                            let t: Transaction = {
                                reciever: msgArr[1],
                                medium,
                                sender: message.author.id,
                            }
                            if(!Number(msgArr[1]) && msgArr[1].length != 18){
                                t.reciever = 'DEAD_WALLET'
                            }
                            this.BlockController.addTransactionToBlock(t);
                            message.channel.send(`The ammount ${msgArr[3]} has been placed onto the next block`);
                            return;
                        }else{
                            console.log('Balance returned');
                            this.currentBalances[message.author.id] += Number(msgArr[3])
                        }
                    }
                    message.channel.send(`Transaction failed, try being less poor and/or cringe`);
                }
            }
        })
    }

    async init(){
        await cockchain;
        console.log('Cockchain Logged in successfully');

        await banker;
        console.log('Banker Logged in successfully');

        await shop;
        console.log('Shopkeeper Logged in successfully');
        
        console.log('Getting Network Blocks');
        let blocks = await this.fetchBlocksFromChannel(BLOCK_CHANNEL_ID);
        console.log(blocks.length);
        this.syncNetwork(blocks, true);
        console.log('Syncronization complete');
        console.log(this.currentBalances);
        return;
    }

    syncNetwork(blocks: Message<boolean>[], fullSync: boolean) {
        blocks.forEach(block => {
            let blockTransactions = block.embeds[0].fields;
            for(let i = 2; i < blockTransactions.length; i++){
                let t = JSON.parse(blockTransactions[i].value.slice(1, blockTransactions[i].value.length-1)) as Transaction;
                this.syncTransaction(t, fullSync);
            }
        })
    }

    syncTransaction(t: Transaction, fullSync: boolean){
        if(t.medium.type === 'BonkleBuck'){
            this.currentBalances[t.reciever] = (this.currentBalances[t.reciever]) ? this.currentBalances[t.reciever] += t.medium.ammount : t.medium.ammount;
            if(fullSync) this.currentBalances[t.sender] = (this.currentBalances[t.sender])? this.currentBalances[t.sender]-=t.medium.ammount : -t.medium.ammount;
        }else if(t.medium.type === 'Stock'){
            if(!this.currentStocks[t.reciever]){
                this.currentStocks[t.reciever] = {};
                this.currentStocks[t.reciever][t.medium.ticker] = 0;
            }
            this.currentStocks[t.reciever][t.medium.ticker] += t.medium.ammount;

            if(fullSync) {
                if(!this.currentStocks[t.sender]){
                    this.currentStocks[t.sender] = {};
                    this.currentStocks[t.sender][t.medium.ticker] = 0;
                }
                this.currentStocks[t.sender][t.medium.ticker] -= t.medium.ammount;
            }
        }else if(t.medium.type === 'DiscordInvite'){
            if(fullSync) return;
            this.ShopkeeperBot.users.fetch(t.reciever).then(user => {
                let invite: string;
                this.BankerBot.guilds.fetch(SEXY_BONKLES_GUILD_ID).then((guild) => {
                    if(guild) 
                        guild.invites.create(COCK_SERVER_CHANNEL_ID, {maxUses: 1, maxAge: 604800}).then(guildInvite => {
                            user.send(`Your Invite to Sexy Bonkles: discord.gg/${guildInvite.code}`);
                        });
                });
            });
                

        }else if(t.medium.type === 'Option'){
            if(!this.currentOptions[t.reciever]){
                this.currentOptions[t.reciever] = {};
                this.currentOptions[t.reciever][t.medium.ticker] = [];
                this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike] = {Calls: 0, Puts: 0};
            }
            this.currentOptions[t.reciever][t.medium.ticker][t.medium.strike][t.medium.option] += t.medium.contracts;

            if(fullSync) {
                if(!this.currentStocks[t.sender]){
                    this.currentOptions[t.sender] = {};
                    this.currentOptions[t.sender][t.medium.ticker] = [];
                    this.currentOptions[t.sender][t.medium.ticker][t.medium.strike] = {Calls: 0, Puts: 0};
                }
                this.currentOptions[t.sender][t.medium.ticker][t.medium.strike][t.medium.option] -= t.medium.contracts;
            }
        }

    }

    // Gets all the blocks from a channel
    async fetchBlocksFromChannel(channelID: string): Promise<Message[]> {
        let getChannel: AnyChannel | null = await this.BlockchainBot.channels.fetch(channelID)
        if(getChannel === null || getChannel.type !== 'GUILD_TEXT'){
            if(getChannel)
                throw new Error(getChannel?.type);
            throw new Error('Channel is null')
        }
        let blockChannel: TextChannel = getChannel;

        let blocks: Message[] = [];
        let lastID;
        while(true){
            const fetchedBlocks: any = await blockChannel.messages.fetch({
                limit: 100,
                ...(lastID && { before: lastID }),
            });;

            if (fetchedBlocks.size === 0) {
                console.log(JSON.stringify(fetchedBlocks));
                return blocks.reverse();
            }
            console.log(`Adding ${fetchedBlocks.size} Blocks`);
            blocks = blocks.concat(Array.from(fetchedBlocks.values()));
            lastID = fetchedBlocks.lastKey();
        }
    }

}
function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }