import { AnyChannel, Channel, Client, Collection, FetchChannelOptions, Message, TextChannel, MessageEmbed, Invite, User, GuildMember } from "discord.js";
import { parse } from 'node-html-parser';
import got from "got/dist/source";
import { CockChain, Banker, Shopkeeper, Bandit, BanditEmbed, ShopInventoryEmbed, StockHelpEmbed, StockTerminologyEmbed, HelpEmbed } from "../Discord/Client";
import { BlockGuess, Transaction, BonkleBuck, NFT, Stock, Option, DiscordInvite, OptionTable, OptionMap, OptionStat, OptionValue, Trade, createShopTransaction, createTransaction } from "../models";
import { BlockController } from "./"; 
import { BLOCK_CHANNEL_ID, BANDIT_TOKEN, COCKSINO_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, COCK_SERVER_CHANNEL_ID, MINING_CHANNEL_ID, BAAZAR_CHANNEL_ID, COCK_EXCHANGE_CHANNEL_ID, STOCK_TRANSACTION_FEE, COCKCHAIN_TOKEN, BANKER_TOKEN, BLOCK_REWARD, BLOCK_TIME, SHOPKEEPER_TOKEN, TRADING_COMMISSION } from '../env'
import { AssetController } from "./AssetController";



console.log('Cockchain Logging in');
let cockchain = CockChain.login(COCKCHAIN_TOKEN);

console.log('Banker Logging in');
let banker = Banker.login(BANKER_TOKEN);
//
console.log('Shopkeeper Logging in');
let shop = Shopkeeper.login(SHOPKEEPER_TOKEN);
//
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
        this.Bandit.on('interactionCreate', (interaction) => {
            console.log('Bandit got gambler');
            if(!interaction.isCommand()) return;
            const { commandName, options, user } = interaction;
            switch(commandName){
                case 'flip':
                    console.log('In flip');
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('wager') || -1)){
                        console.log('Addict has buck');
                        if(Math.random() < 0.5){
                            // win
                            console.log('Addict has won');
                            let t = createTransaction('COCKSINO', interaction.user.id, options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Unfortunate Outcome! You won ${options.getNumber('wager')!} Bonkle Bucks!`)
                            return;
                        }else{
                            // lose
                            console.log('Addict has lost');
                            let t = createTransaction(interaction.user.id, 'COCKSINO', options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Congradulations! You lost ${options.getNumber('wager')!} Bonkle Bucks!`)
                            return;
                        }
                    }
                    interaction.reply(`Go mine some blocks you poor`)
                    return;
                case 'flipodds':
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('wager') || -1)){
                        let odds = options.getString('odds')?.split(':');
                        if(!odds || odds.length !== 2 || !Number(odds[0]) || !Number(odds[1])) return; // odds error
                        if(Math.random() < Number(odds[0])/(Number(odds[0])+Number(odds[1]))){
                            let t = createTransaction('COCKSINO', interaction.user.id, (Number(odds[0])+Number(odds[1])));
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Unfortunate Outcome! You gained ${(Number(odds[0])+Number(odds[1]))} Bonkle Bucks!`)
                            return;
                            // win
                        }else{
                            // lose
                            let t = createTransaction(interaction.user.id, 'COCKSINO', options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Congradulations! You lost ${options.getNumber('wager')!} Bonkle Bucks!`)
                            return;
                        }
                    }
                    interaction.reply(`Go mine some blocks you poor`)
                    return;
                case 'dangerflip':
                    if(Math.random() < 0.5){
                        interaction.reply('Congradulations! you got kicked!');
                        sleep(3000).then(()=>{
                            Bandit.guilds.cache.get(SEXY_BONKLES_GUILD_ID)?.members.kick(interaction.user);
                        })
                        return;
                    }else{
                        let t = createTransaction( 'COCKSINO', interaction.user.id, 50);
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply(`Unfortunate Outcome! You gained 50 Bonkle Bucks!`)
                        return;
                    }
                default: 
                    interaction.reply('cum cum cum cum cum');
                    return;
                }
        })
    }

    startShopkeeperBot() {
        this.ShopkeeperBot.on('interactionCreate', interaction => {
            if(!interaction.isCommand()) return;
            const { commandName, options, user } = interaction;
            console.log('Shop Request made');
            switch(commandName){
                case 'bal': 
                    interaction.reply(`You have ${this.AssetController.getBonkleBalance(user.id)} Bonkle Bucks`);
                    return;
                case 'buy':
                    switch(options.getString('item')!.toLowerCase()){
                        case 'discordinvite':
                            if(this.AssetController.verifyEnoughBonkle(user.id, 50)){
                                let t1: Transaction = createTransaction(user.id, 'Bonkle Buck Broker', 50);
                                let t2: Transaction = createShopTransaction(user.id, {type: 'DiscordInvite', ammount: 1});
                                this.BlockController.addTransactionToBlock(t1);
                                this.BlockController.addTransactionToBlock(t2);
                                interaction.reply('Invite Purchased, You will recieve your invite on the next block');
                            }
                            interaction.reply('Invite Purchased, You will recieve your invite on the next block');
                            return;
                    }
                }      
        })
    }

    startBankerBot() {
        this.BankerBot.on('interactionCreate', (interaction) => {
            if(!interaction.isCommand()) return;
            const { commandName, options, user } = interaction;
            options
            switch(commandName){
                case 'sendbonkle': 
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('Amount') || -1)){
                        let t = this.AssetController.sendBonkle(options.getUser('Reciever')?.id || 'DEAD_WALLET', user.id, options.getNumber('Amount') || 0);
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply('Bonkle Sent Successfully')
                        return;
                    }
                    break;
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
//
        await shop;
        console.log('Shopkeeper Logged in successfully');

        await bandit;
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