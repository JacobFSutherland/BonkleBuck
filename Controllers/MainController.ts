import { AnyChannel, Channel, Client, Collection, FetchChannelOptions, Message, TextChannel, MessageEmbed, Invite, User, GuildMember } from "discord.js";
import { parse } from 'node-html-parser';
import got from "got/dist/source";
import { CockChain, Banker, Shopkeeper, Bandit, BanditEmbed, ShopInventoryEmbed, StockHelpEmbed, StockTerminologyEmbed, HelpEmbed } from "../Discord/Client";
import { BlockGuess, Transaction, BonkleBuck, NFT, Stock, Option, DiscordInvite, OptionTable, OptionMap, OptionStat, OptionValue, Trade } from "../models";
import { BlockController } from "./"; 
import { BLOCK_CHANNEL_ID, BANDIT_TOKEN, COCKSINO_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, COCK_SERVER_CHANNEL_ID, MINING_CHANNEL_ID, BAAZAR_CHANNEL_ID, COCK_EXCHANGE_CHANNEL_ID, STOCK_TRANSACTION_FEE, COCKCHAIN_TOKEN, BANKER_TOKEN, BLOCK_REWARD, BLOCK_TIME, SHOPKEEPER_TOKEN, TRADING_COMMISSION } from '../env'
import { AssetController } from "./AssetController";



console.log('Cockchain Logging in');
let cockchain = CockChain.login(COCKCHAIN_TOKEN);

console.log('Banker Logging in');
let banker = Banker.login(BANKER_TOKEN);

console.log('Shopkeeper Logging in');
let shop = Shopkeeper.login(SHOPKEEPER_TOKEN);

console.log('Bandit Logging in');
let bandit = Bandit.login(BANDIT_TOKEN);


export class MainController{
    private AssetController: AssetController;
    private BlockchainBot: Client;
    private BankerBot: Client;
    private ShopkeeperBot: Client;
    private Bandit: Client;
    private BlockController: BlockController;
    constructor(){
        this.BlockchainBot = CockChain;
        this.BankerBot = Banker;
        this.Bandit = Bandit;
        this.ShopkeeperBot = Shopkeeper;
        this.BlockController = new BlockController(BLOCK_REWARD, BLOCK_TIME);
        this.AssetController = new AssetController();
    }
    async start(){
        console.log('Starting Bots');
        this.startClient();
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
                    message.channel.send({embeds: [BanditEmbed]});
                }
                if(msg[0] === '!flip'){
                    if(msg[1]){
                        if(this.AssetController.verifyEnoughBonkle(message.author.id, msg[1]) || msg[1] === 'bal' || msg[1] === 'all'){
                            if(msg[1] === 'bal' || msg[1] === 'all') msg[1] = this.AssetController.getBonkleBalance(message.author.id) + '';
                            console.log('Flipping');
                            let medium: BonkleBuck = {type: 'BonkleBuck', ammount: Number(msg[1])}; // Wagered Ammount
                            if(Math.random() >= 0.5){
                                message.channel.send(`Unfortunate outcome! you gained ${msg[1]} Bonkle Bucks in the next block`);
                                this.AssetController.returnFrozenAssets(message.author.id, msg[1])
                                let t: Transaction = {
                                    reciever: message.author.id,
                                    medium,
                                    sender: 'COCKSINO'
                                }
                                this.BlockController.addTransactionToBlock(t);
                                if(Math.random() < 0.01){
                                    message.channel.send(`Super unfortunate! You also got 51 Bonle Bucks`);
                                    let jackpot: Transaction = {
                                        reciever: message.author.id,
                                        medium: {
                                            type: 'BonkleBuck',
                                            ammount: 51,
                                        },
                                        sender: 'COCKSINO'
                                    }
                                    this.BlockController.addTransactionToBlock(jackpot);
                                }
                                return;
                            }else{
                                let t: Transaction = {
                                    reciever: 'COCKSINO',
                                    medium,
                                    sender: message.author.id
                                }
                                message.channel.send(`Congradulations! you lost ${msg[1]} Bonkle Bucks in the next block`);
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
                                return;
                            }
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
                    message.channel.send({embeds: [ShopInventoryEmbed]})
                }
                if(msg[0] === '!buy'){
                    if(msg[1] === 'discordinvite'){
                        if(!this.AssetController.verifyEnoughBonkle(message.author.id, '50')){
                            message.channel.send(`Transaction failed, try being less poor and/or cringe`);
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

                    message.channel.send({embeds:[StockHelpEmbed, StockTerminologyEmbed]});
                }
                if(message.content.toLowerCase() === '!portfolio'){
                    let portfolio: MessageEmbed = this.AssetController.getStockPortfolioEmbed(message.author.id)
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
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    if(!this.AssetController.verifyBuyStock(message.author.id, msg[1], stockValue, msg[2])){
                        message.channel.send('Buy order failed, not enough Bonkle Bucks');
                        return;
                    }
                    let t: Trade = this.AssetController.tradeStock(message.author.id, 'BonkleBuckBanker', msg[1], stockValue, msg[2]);
                    this.BlockController.addTransactionToBlock(t.sender);
                    this.BlockController.addTransactionToBlock(t.reciever);
                    message.channel.send('Buy order successfully submitted to block');
                    return;
                }

                if(msg[0] === '!sell' && Number(msg[2]) && Number(msg[2]) > 0 ){
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    if(!this.AssetController.verifySellStock(message.author.id, msg[1], stockValue, msg[2])){
                        message.channel.send('Sell order failed, not enough Bonkle Bucks');
                        return;
                    }
                    let t: Trade = this.AssetController.tradeStock('BonkleBuckBanker', message.author.id, msg[1], stockValue, msg[2]);
                    this.BlockController.addTransactionToBlock(t.sender);
                    this.BlockController.addTransactionToBlock(t.reciever);
                    message.channel.send('Buy order successfully submitted to block');
                    return;
                }

                if(msg[0] === '!quote'){
                    //console.log(Quo)
                    if(!msg[1]) message.channel.send("Try doing the command right next time");
                    let stockValue: number = await this.getStockPrice(msg[1]);
                    message.channel.send(`$${msg[1]} is currently trading for $${stockValue}. To purchase ${msg[2]} shares, it will cost ${Number(msg[2])*stockValue+TRADING_COMMISSION} Bonkle Bucks`);
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
                if(msg[0] === '!buyoption' && msg.length === 5 && (msg[2] === 'calls' || msg[2] === 'puts')){
                    let optionChain: OptionMap = await this.getOptions(msg[1]);
                    let validTransaction = this.AssetController.verifyBuyOption(message.author.id, optionChain, msg);
                    if(validTransaction){
                        let t: Trade = this.AssetController.tradeOption(message.author.id, 'BonkleBuckBanker' , optionChain, msg);
                        this.BlockController.addTransactionToBlock(t.sender);
                        this.BlockController.addTransactionToBlock(t.reciever);
                        message.channel.send('Buy order successfully submitted to block');
                        return;
                    }
                    message.channel.send('Buy order failed, Fucko Boingo');
                    return;
                }

                //{ name: 'How do I buy options?', value: '\`!buyOption [Stock Ticker] [Option Type] [Strike Price] [Ammount]\` You can only buy whole numbers of options'},
                if(msg[0] === '!selloption' && msg.length === 5){
                    let optionChain: OptionMap = await this.getOptions(msg[1]);
                    let validTransaction = this.AssetController.verifySellOption(message.author.id, optionChain, msg);
                    if(validTransaction){
                        let t: Trade = this.AssetController.tradeOption('BonkleBuckBanker', message.author.id, optionChain, msg);
                        this.BlockController.addTransactionToBlock(t.sender);
                        this.BlockController.addTransactionToBlock(t.reciever);
                        message.channel.send('Sell order successfully submitted to block');
                    }
                    message.channel.send('Sell order failed, Fucko Boingo');
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
                let deliverables = this.AssetController.syncNetwork([message], false);
                this.sendDeliverables(deliverables);
            }

            if(message.author.bot) return;
            
            if(message.channelId === MINING_CHANNEL_ID){
                let guess: BlockGuess = {
                    id: message.author.id,
                    answer: message.content,
                }
                this.BlockController.trySolution(guess).then(t => {
                    if(t && t.medium.type === 'BonkleBuck') this.AssetController.withdrawReward(t.medium.ammount);
                    console.log('Exiting out of function in listener')
                    return;
                })
                console.log('Exiting out of listener')
                return;
            }

            if(message.channelId === BAAZAR_CHANNEL_ID){
                let msg = message.content.toLowerCase();
                if(msg === '!bal'){
                    message.channel.send(`Your balance is ${this.AssetController.getBonkleBalance(message.author.id)} Bonkle Bucks`)
                }

                if(msg === '!supply'){
                    message.channel.send(`There are ${-this.AssetController.getBonkleBalance('BLOCK_REWARD')} Bonkle Bucks distributed in rewards\n\nThere are ${-this.AssetController.getBonkleBalance('COCKSINO')} Bonkle Bucks generated from the Cock-sino\n\nThere are ${-this.AssetController.getBonkleBalance('BonkleBuckBanker')} Bonkle Bucks generated from the markets and item sales\n\nThe circulating supply of Bonkle Bucks is ${-this.AssetController.getBonkleBalance('BLOCK_REWARD')-this.AssetController.getBonkleBalance('COCKSINO')-this.AssetController.getBonkleBalance('BonkleBuckBanker')}`);
                }

                if(msg === '!help'){
                    let invokeBalance = this.AssetController.getBonkleBalance(message.author.id);
                    if(invokeBalance > 0){
                        message.channel.send('Thank you for helping out the community by donating everyone an equal share of your current sum of bonkle bucks.');
                        this.AssetController.verifyEnoughBonkle(message.author.id, invokeBalance + '');

                        let users = this.AssetController.getEconParticipants();
                        let sharedAmmount = invokeBalance / users.length;
                        let authorIndex = users.indexOf(message.author.id);
                        let BloccoIndex = users.indexOf('Blocco');
                        users.splice(authorIndex, 1);
                        users.splice(BloccoIndex, 1);
                        let medium: BonkleBuck = {
                            ammount: sharedAmmount,
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
                        message.channel.send({embeds:[HelpEmbed]});
                    }
                    
                }

                if(msg.includes('!send')){
                    let msgArr = msg.split(' ');
                    message.channel.send(`Transaction failed, try being less poor and/or cringe`);
                }
            }
        })
    }

    sendDeliverables(transactions: Transaction[]) {
        console.log('Sending Invites');
        transactions.forEach(t => {
            console.log('Sending Invite');
            this.ShopkeeperBot.users.fetch(t.reciever).then(user => {
                let invite: string;
                this.BankerBot.guilds.fetch(SEXY_BONKLES_GUILD_ID).then((guild) => {
                    if(guild) 
                        guild.invites.create(COCK_SERVER_CHANNEL_ID, {maxUses: 1, maxAge: 604800}).then(guildInvite => {
                            user.send(`Your Invite to Sexy Bonkles: discord.gg/${guildInvite.code}`);
                        });
                });
            });
        });
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
        this.AssetController.syncNetwork(blocks, true);
        console.log('Syncronization complete');
        return;
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