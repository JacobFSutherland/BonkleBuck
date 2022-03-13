import { AnyChannel, Channel, Client, Collection, FetchChannelOptions, Message, TextChannel, MessageEmbed, Invite, User, GuildMember, VoiceChannel, VoiceBasedChannel, CacheType, CommandInteraction } from "discord.js";
import { parse } from 'node-html-parser';
import got from "got/dist/source";
import { CockChain, Banker, Shopkeeper, Bandit, BanditEmbed, ShopInventoryEmbed, StockHelpEmbed, StockTerminologyEmbed, HelpEmbed } from "../Discord/Client";
import { BlockGuess, Transaction, BonkleBuck, NFT, Stock, Option, DiscordInvite, OptionTable, OptionMap, OptionStat, OptionValue, Trade, createShopTransaction, createTransaction, getOptions, getStockPrice, TokenContract } from "../models";
import { BlockController } from "./"; 
import { BLOCK_CHANNEL_ID, BANDIT_TOKEN, COCKSINO_CHANNEL_ID, SEXY_BONKLES_GUILD_ID, COCK_SERVER_CHANNEL_ID, MINING_CHANNEL_ID, BAAZAR_CHANNEL_ID, COCK_EXCHANGE_CHANNEL_ID, STOCK_TRANSACTION_FEE, COCKCHAIN_TOKEN, BANKER_TOKEN, BLOCK_REWARD, BLOCK_TIME, SHOPKEEPER_TOKEN, TRADING_COMMISSION } from '../env'
import { AssetController } from "./AssetController";
import { connectToChannel, getCurrentSounds } from "../Discord/Sounds";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, StreamType, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, generateDependencyReport, AudioPlayer } from '@discordjs/voice';
import { join } from 'path';
import { kill } from "process";


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

let gambleOdds = Math.random();

export class MainController{
    private AssetController: AssetController;
    private BlockchainBot: Client;
    private BankerBot: Client;
    private ShopkeeperBot: Client;
    private Bandit: Client;
    private BlockController: BlockController;
    private Player: AudioPlayer;
    constructor(){
        this.BlockchainBot = CockChain;
        this.BankerBot = Banker;
        this.Bandit = Bandit;
        this.ShopkeeperBot = Shopkeeper;
        this.BlockController = new BlockController(BLOCK_REWARD, BLOCK_TIME, CockChain);
        this.AssetController = new AssetController();
        this.Player = createAudioPlayer();
    }
    async start(){
        console.log('Starting Bots');
        this.startClient();
        console.log('Creatting Block')
        this.BlockController.init();
        this.BlockController.createNewBlock();
    }

    startClient() {
        console.log(generateDependencyReport())
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
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('wager')!)){
                        console.log('Addict has buck');
                        if(gambleOdds < 0.5){
                            // win
                            console.log('Addict has won');
                            this.AssetController.addBonkleDelta(user.id, options.getNumber('wager')!);
                            let t = createTransaction('COCKSINO', interaction.user.id, options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Unfortunate Outcome! You won ${options.getNumber('wager')!} Bonkle Bucks!`)
                        }else{
                            // lose
                            console.log('Addict has lost');
                            let t = createTransaction(interaction.user.id, 'COCKSINO', options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Congradulations! You lost ${options.getNumber('wager')!} Bonkle Bucks!`)  
                        }
                        console.log('Odds: ', gambleOdds);
                        gambleOdds = Math.random()
                        return;
                    }
                    interaction.reply(`Go mine some blocks you poor`)
                    return;
                case 'flipodds':
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('wager') || -1)){
                        let odds = options.getString('odds')?.split(':');
                        if(!odds || odds.length !== 2 || !Number(odds[0]) || !Number(odds[1])) return; // odds error
                        if(gambleOdds > Number(odds[0])/(Number(odds[0])+Number(odds[1]))){
                            this.AssetController.addBonkleDelta(user.id, options.getNumber('wager')!);
                            let t = createTransaction('COCKSINO', interaction.user.id, options.getNumber('wager')!*(Number(odds[0])/Number(odds[1])));
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Unfortunate Outcome! You gained ${options.getNumber('wager')!*(Number(odds[0])/Number(odds[1]))} Bonkle Bucks!`)
                            // win
                        }else{
                            // lose
                            let t = createTransaction(interaction.user.id, 'COCKSINO', options.getNumber('wager')!);
                            this.BlockController.addTransactionToBlock(t);
                            interaction.reply(`Congradulations! You lost ${options.getNumber('wager')!} Bonkle Bucks!`)
                        }
                        gambleOdds = Math.random()
                        console.log('Odds: ', gambleOdds);
                        return;
                    }
                    interaction.reply(`Go mine some blocks you poor`)
                    return;
                case 'dangerflip':
                    if(gambleOdds < 0.5){
                        interaction.reply('Congradulations! you got kicked!');
                        sleep(3000).then(()=>{
                            Bandit.guilds.cache.get(SEXY_BONKLES_GUILD_ID)?.members.kick(interaction.user);
                        })
                    }else{
                        let t = createTransaction( 'COCKSINO', interaction.user.id, 50);
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply(`Unfortunate Outcome! You gained 50 Bonkle Bucks!`)
                    }
                    gambleOdds = Math.random()
                    console.log('Odds: ', gambleOdds);
                    return;
                default: 
                    interaction.reply('cum cum cum cum cum');
                    return;
                }
        })
    }

    startShopkeeperBot() {
        this.ShopkeeperBot.on('interactionCreate', async interaction => {
            if(!interaction.isCommand()) return;
            const { commandName, options, user } = interaction;
            console.log('Shop Request made');
            await interaction.reply('Working on it');
            switch(commandName){
                case 'bal': 
                    interaction.editReply(`You have ${this.AssetController.getBonkleBalance(user.id)} Bonkle Bucks`);
                    return;
                case 'tokenbal':
                    let token = options.getString('token')!;
                    interaction.editReply(`You have ${this.AssetController.getTokenBalance(token, user.id)} ${token}/s`);
                    return;
                case 'buy':
                    switch(options.getString('item')!.toLowerCase()){
                        case 'discordinvite':
                            if(this.AssetController.verifyEnoughBonkle(user.id, 50)){
                                let t1: Transaction = createTransaction(user.id, 'Bonkle Buck Broker', 50);
                                let t2: Transaction = createShopTransaction(user.id, {type: 'DiscordInvite', ammount: 1});
                                this.BlockController.addTransactionToBlock(t1);
                                this.BlockController.addTransactionToBlock(t2);
                                interaction.editReply('Invite Purchased, You will recieve your invite on the next block');
                            }else{
                                interaction.editReply('Invite Not Purchased, Poor!');
                            }
                            return;
                        default:
                            interaction.editReply('No workey');
                            return;
                    }
                case 'noise':
                    console.log('Play noise')
                    console.log('Getting voice channel')
                    let voiceChannel: VoiceChannel | undefined = this.getVoiceChannel(interaction)
                    console.log('Voice channel gotten, checking if undefined:')
                    if(voiceChannel == undefined){ 
                        await interaction.editReply('Join a channel, headass')
                        return;
                    }
                    console.log('Voice channel not undefined')
                    let sounds = getCurrentSounds()
                    let sound = options.getString('sound')!.toLowerCase();
                    console.log('Sounds: ');
                    console.log(sounds);
                    console.log(`Sound: ${sound}`)
                    console.log('Sound dir: ',  sounds[`${sound}.mp3`])
                    if(Object.keys(sounds).indexOf(`${sound}.mp3`) != -1){
                        if(this.AssetController.verifyEnoughBonkle(user.id, 10)){
                            let t1: Transaction = createTransaction(user.id, 'Bonkle Buck Broker', 10);
                            let t2: Transaction = createShopTransaction(user.id, {type: 'Sound', ammount: 1});
                            this.BlockController.addTransactionToBlock(t1);
                            this.BlockController.addTransactionToBlock(t2);
                            console.log('Voice Channel established')
                            let connection = await connectToChannel(voiceChannel);
                            if(!connection){
                                await interaction.editReply('Error playing sound')
                                return;
                            } 
                            connection.subscribe(this.Player);
                            let resource = createAudioResource(sounds[`${sound}.mp3`])
                            this.Player.play(resource);
                            console.log('Playing resource');
                            await entersState(this.Player, AudioPlayerStatus.Playing, 10e3);
                            console.log('Should be playing')
                            connection.setSpeaking(true);
                            await entersState(this.Player, AudioPlayerStatus.Idle, 60e3);
                            connection.setSpeaking(false);
                            await interaction.editReply('Sound played')
                            try{
                                connection.disconnect()
                                connection.destroy()
                                console.log('connection destroyed successfully')
                            }catch(e){
                                console.log('connection overwritten')
                            }
                            return;
                        }else{
                            await interaction.editReply('Sound Not Purchased, Poor!');
                            return;
                        }
                    }else{
                        await interaction.editReply('Sound Not Found, Bad!');
                        return;
                    }
                case 'mute':
                    let target = options.getUser('user');

                    if(this.AssetController.verifyEnoughBonkle(user.id, 50)){
                        let t1: Transaction = createTransaction(user.id, 'Bonkle Buck Broker', 50);
                        let t2: Transaction = createShopTransaction(user.id, {type: 'Mute', target: user.id});
                        this.BlockController.addTransactionToBlock(t1);
                        this.BlockController.addTransactionToBlock(t2);
                        await interaction.editReply('Muted user');
                        let targetUser = interaction.guild?.members.cache.get(target?.id || "");
                        let mutedRole = interaction.guild?.roles.cache.find(role => role.name.toLowerCase() == "muted");
                        if(targetUser){
                            await targetUser.roles.add(mutedRole!);
                            console.log(`Muted ${target?.id}`);
                            let time = 2500;
                            while(Math.random() > 0.5){
                                console.log(`Doubling, ${time}`);
                                time *= 2
                            }
                            await sleep(time);
                            await targetUser.roles.remove(mutedRole!);
                            console.log(`Unmuted ${target?.id}`);

                        }
                        return;
                    }
                    await interaction.editReply('User not muted, no buck');

                case 'changenick':
                    let changeNickname = options.getUser('user');
                    let nickname = options.getString('nickname');
                    if(changeNickname?.bot){
                        await interaction.editReply('You cannot change bot name, fucco');
                        return;
                    } 
                    if(this.AssetController.verifyEnoughBonkle(user.id, 10)){
                        await interaction.editReply('username changed');
                        let t1: Transaction = createTransaction(user.id, 'Bonkle Buck Broker', 10);
                        let t2: Transaction = createShopTransaction(user.id, {type: 'ChangeNickname', target: user.id});
                        this.BlockController.addTransactionToBlock(t1);
                        this.BlockController.addTransactionToBlock(t2);
                        let userRef = interaction.guild?.members.cache.get(changeNickname?.id || "");
                        if(userRef){
                            await userRef.setNickname(nickname);
                        }
                        return;
                    }
                    await interaction.editReply('Nickname not changed, no buck');

                  
                
                } 

        })
    }
    getVoiceChannel(interaction: CommandInteraction<CacheType>): VoiceChannel | undefined {
        let guild = Shopkeeper.guilds.cache.get(interaction.guildId || '')
        let member = guild?.members.cache.get(interaction.member?.user.id || '');
        if(member)
            if(member.voice)
                if(member.voice.channel) return member.voice.channel as VoiceChannel;
        return undefined;
        
    }

    startBankerBot() {
        this.BankerBot.on('interactionCreate', async (interaction) => {
            if(!interaction.isCommand()) return;
            const { commandName, options, user } = interaction;
            let ticker: string;
            let optionType: 'Puts' | 'Calls' ;
            let optionChain: OptionMap;
            let strike: number;
            let optionCost: number;
            let optionPrice: number;
            let stockPrice: number;
            let quantity: number;
            let cost: number;
            let name: string;
            let stake: number;
            let description: string;
            let reciever: User;
            let strikes: number;
            let embeds: MessageEmbed[]
            
            switch(commandName){
                case 'sendbonkle': 
                    console.log(`user id: ${user.id}`)
                    if(this.AssetController.verifyEnoughBonkle(user.id, options.getNumber('amount') || -1)){
                        let t = this.AssetController.sendBonkle(options.getUser('reciever')?.id || 'DEAD_WALLET', user.id, options.getNumber('amount') || 0);
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply('Bonkle Sent Successfully')
                        return;
                    }
                    interaction.reply('Bonkle not sent Successfully')
                    return;
            
                case 'buyoption': 
                    ticker = options.getString('ticker')!.replace('$', '');
                    optionChain = await getOptions(options.getString('ticker')!.replace('$', ''));
                    optionType = options.getString('option_type') as 'Calls' | 'Puts';
                    strike = options.getNumber('option_strike')!;
                    optionPrice = optionChain[optionType][strike].ask;
                    quantity = options.getNumber('option_quantity')!;
                    optionCost = quantity * optionPrice * 100 + TRADING_COMMISSION;
                    if(this.AssetController.verifyEnoughBonkle(user.id, optionCost) && quantity > 0 && Number.isInteger(quantity) ){
                        let T: Trade = this.AssetController.tradeOption(user.id, 'Bonkle Buck Broker', ticker, optionType, strike, options.getNumber('option_quantity')!, optionCost);
                        this.BlockController.addTransactionToBlock(T.reciever);
                        this.BlockController.addTransactionToBlock(T.sender);
                        interaction.reply('Options not bought successfully')
                        return;
                    }
                    return;

                case 'selloption': 
                    ticker = options.getString('ticker')!.replace('$', '');
                    optionChain = await getOptions(options.getString('ticker')!.replace('$', ''));
                    optionType = options.getString('option_type') as 'Calls' | 'Puts';
                    strike = options.getNumber('option_strike')!;
                    quantity = options.getNumber('option_quantity')!;
                    console.log(optionChain);
                    console.log('Option type: ', optionType);
                    console.log('Strike: ', strike);
                    optionPrice = optionChain[optionType][strike].ask;
                    optionCost = quantity * optionPrice * 100 - TRADING_COMMISSION;
                    let totalOptions = this.AssetController.getOptions(user.id, ticker, optionType, strike )
                    if(totalOptions <= quantity && optionCost > 0 && quantity > 0 && Number.isInteger(quantity)){
                        let T: Trade = this.AssetController.tradeOption('Bonkle Buck Broker', user.id, ticker, optionType, strike, options.getNumber('option_quantity')!, optionCost);
                        this.BlockController.addTransactionToBlock(T.reciever);
                        this.BlockController.addTransactionToBlock(T.sender);
                        interaction.reply('Options sold successfully')
                        return;
                    }
                    interaction.reply('Options not sold successfully')
                    return;
                
                case 'buystock':
                    ticker = options.getString('ticker')!.replace('$', '')!;
                    stockPrice = await getStockPrice(ticker);
                    quantity = options.getNumber('quantity')!;
                    cost = stockPrice * quantity + TRADING_COMMISSION;
                    console.log(`$${ticker} cost: ${stockPrice}`);
                    if(this.AssetController.verifyEnoughBonkle(user.id, cost) && quantity > 0 && stockPrice > 0 && Number.isInteger(quantity)){
                        let T: Trade = this.AssetController.tradeStock(user.id, 'Bonkle Buck Broker', ticker, stockPrice, quantity);
                        this.BlockController.addTransactionToBlock(T.reciever);
                        this.BlockController.addTransactionToBlock(T.sender);
                        interaction.reply('Stocks bought successfully')
                        return;
                    }
                    interaction.reply('Stocks not bought successfully')
                    return;

                case 'sellstock':
                    ticker = options.getString('ticker')!.replace('$', '')!;
                    stockPrice = await getStockPrice(ticker);
                    quantity = options.getNumber('quantity')!;
                    cost = stockPrice * quantity - TRADING_COMMISSION;
                    if( this.AssetController.initStocks(user.id, ticker) >= quantity && quantity > 0 && stockPrice > 0 && Number.isInteger(quantity) && cost > 0){
                        let T: Trade = this.AssetController.tradeStock('Bonkle Buck Broker', user.id, ticker, stockPrice, quantity);
                        this.BlockController.addTransactionToBlock(T.reciever);
                        this.BlockController.addTransactionToBlock(T.sender);
                        interaction.reply('Stocks sold successfully')
                        return;
                    }
                    interaction.reply('Stocks not sold successfully')
                    return;
                case 'createtoken': 
                    name = options.getString('name')!;
                    quantity = options.getNumber('quantity')!;
                    stake = options.getNumber('stake')!;
                    description = options.getString('description')!;
                    if(this.AssetController.verifyEnoughBonkle(user.id, stake) && this.AssetController.verifyUniqueToken(name) && stake*10 >= quantity && Number.isInteger(quantity)){
                        let token = new TokenContract(name, quantity, user.id, description, stake);
                        let t: Transaction = {
                            reciever: user.id,
                            medium: token,
                            sender: 'DEAD_WALLET',
                        }
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply('Token created successfully and will appear on the next block')
                        return;
                        //Create token
                    }
                    interaction.reply('Token not created successfully')
                    return
                    // dont create token
                case 'sendtoken':
                    name = options.getString('token')!;
                    quantity = options.getNumber('quantity')!;
                    if(this.AssetController.verifyEnoughToken(name, user.id, quantity) && quantity > 0){
                        let t = this.AssetController.sendToken(name, options.getUser('reciever')?.id || 'DEAD_WALLET', user.id, options.getNumber('quantity')!);
                        this.BlockController.addTransactionToBlock(t);
                        interaction.reply(`${name} Sent Successfully`)
                        return;
                    }
                    interaction.reply(`${name} not sent Successfully`)
                    return;
                case 'tokenstats':
                    name = options.getString('token')!;
                    embeds = this.AssetController.getTokenEmbed(name);
                    interaction.reply({embeds});
                    return;
                case 'stockstats':
                    name = options.getString('ticker')!.replace('$', '')
                    let price = await getStockPrice(name)
                    interaction.reply(`$${name} is currently trading for ${price}`)
                    return;
                case 'optionstats':
                    name = options.getString('ticker')!.replace('$', '')
                    strikes = options.getInteger('strikes') || 6;
                    optionChain = await getOptions(name);
                    let calls = optionChain.callsToStringEmbed(strikes)
                    let puts = optionChain.putsToStringEmbed(strikes)
                    interaction.reply({embeds: [calls, puts]})
                    return;
                case 'portfolio':
                    let stockPortfolio = this.AssetController.getStockPortfolioEmbed(user.id)
                    stockPortfolio.push(this.AssetController.getTokenPortfolioEmbed(user.id))
                    interaction.reply({embeds: stockPortfolio});
                    return;
                case 'supply':
                    embeds = this.AssetController.getCirculatingSupply()
                    interaction.reply({embeds})

            } 
        
        })  
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
            if(t.medium.type == 'DiscordInvite'){
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
            }
        });
    }

    async init(){
        await cockchain 
        console.log('Cockchain Logged in successfully');

        await banker;
        console.log('Banker Logged in successfully');
//
        await shop;
        console.log('Shopkeeper Logged in successfully');

        await bandit;
        console.log('Shopkeeper Logged in successfully');
        
        let player = createAudioPlayer(	{
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            }   
        });

        console.log('Getting Network Blocks');
        let blocks = await this.fetchBlocksFromChannel(BLOCK_CHANNEL_ID);
        console.log(blocks.length);
        this.AssetController.syncNetwork(blocks, true);
        console.log('Syncronization complete');
        console.log(`Tokens: ${this.AssetController.getAllTokens()}`);
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