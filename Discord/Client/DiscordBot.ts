import { Client, Intents, Constants } from 'discord.js';
import { SEXY_BONKLES_GUILD_ID } from '../../env';
import { ItemsForSale } from '../../models'

export const CockChain = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS]})
export const Banker = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS]})
export const Shopkeeper = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_INTEGRATIONS]})
export const Bandit = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS]})

CockChain.once('ready', ()=>{
    console.log('Chain Bot Online, Syncing up with network');
})

Banker.once('ready', ()=>{
    console.log('Banker Bot Online, Syncing up with network');
    const guild = Banker.guilds.cache.get(SEXY_BONKLES_GUILD_ID)
    let commands;

    if(guild){
        commands = guild.commands;        
    }else{
        commands = Banker.application?.commands;
    }

    commands?.create({
        name: 'sendbonkle',
        description: 'Send Bonkle Bucks to your buddies!',
        options: [
            {
                name: 'reciever',
                description: 'The user you wish to send stuff to (i\'m stuff)',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.USER
            },
            {
                name: 'amount',
                description: 'The user you wish to send stuff to (i\'m stuff)',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
            }
        ]
    })

    commands?.create({
        name: 'sendtoken',
        description: 'Send your smart contracts to someone else',
        options: [
            {
                name: 'token',
                description: 'The name of the token/contract',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'reciever',
                description: 'The user you wish to send stuff to (i\'m stuff)',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.USER
            },
            {
                name: 'quantity',
                description: 'The ammount of tokens/contracts you wish to mint',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
            },
        ]
    })

    commands?.create({
        name: 'createtoken',
        description: 'Create your own tokens',
        options: [
            {
                name: 'name',
                description: 'The name of the token',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'quantity',
                description: 'The ammount of tokens you wish to mint',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
            },
            {
                name: 'stake',
                description: 'Minimum of 10 Bonkle Bucks per Token Created',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
            },
            {
                name: 'description',
                description: 'A brief description of what the contract, or token represents',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'buystock',
        description: 'Buy Stocks with Bonkle Bucks',
        options: [
            {
                name: 'ticker',
                description: 'The ticker of the stock you intend to purchase',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'quantity',
                description: 'The quantity of the stock you intend to purchase',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER 
            }
        ]
    })

    commands?.create({
        name: 'sellstock',
        description: 'Buy Bonkle Bucks with Stocks',
        options: [
            {
                name: 'ticker',
                description: 'The ticker of the stock you intend to sell',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'quantity',
                description: 'The quantity of the stock you intend to sell',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER 
            }
        ]
    })

    commands?.create({
        name: 'buyoption',
        description: 'Buy option contracts with bonkle bucks',
        options: [
            {   
                name: 'ticker',
                description: 'The ticker of the stock you wish to buy options for',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: 'option_type',
                description: 'The type of option you wish to buy',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices:[
                    {name: 'Calls', value: 'Calls'},
                    {name: 'Puts', value: 'Puts'},
                ]
            },
            {
                name: 'option_strike',
                description: 'The strike price of the option you wish to buy',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true,
            },
            {
                name: 'option_quantity',
                description: 'The quantity of options you wish to buy',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true,
            },
        ]
    })

    commands?.create({
        name: 'tokenstats',
        description: 'Get the stats of a token',
        options: [
            {
                name: 'token',
                description: 'the token you want the stats for',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'selloption',
        description: 'Sell option contracts with bonkle bucks',
        options: [
            {   
                name: 'ticker',
                description: 'The ticker of the stock you wish to sell options for',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: 'option_type',
                description: 'The type of option you wish to sell',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices:[
                    {name: 'Calls', value: 'Calls'},
                    {name: 'Puts', value: 'Puts'},
                ]
            },
            {
                name: 'option_strike',
                description: 'The strike price of the option you wish to sell',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true,
            },
            {
                name: 'option_quantity',
                description: 'The quantity of options you wish to sell',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true,
            },
        ]
    })
})

Shopkeeper.once('ready', () => {
    console.log('Broker Bot Online, Syncing up with network');
    const guild = Shopkeeper.guilds.cache.get(SEXY_BONKLES_GUILD_ID)
    let commands;

    if(guild){
        commands = guild.commands;        
    }else{
        commands = Shopkeeper.application?.commands;
    }

    commands?.create({
        name: 'bal',
        description: 'Get your current balance'
    })

    commands?.create({
        name: 'tokenbal',
        description: 'Get your current balance for a specific token',
        options: [
            {
                name: 'token',
                description: 'the token you want your bal to',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'buy',
        description: 'Buy some shid',
        options: [
            {
                name: 'item',
                description: 'The item you wish to purchase',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            },
        ]
    })




})

Bandit.once('ready', () => {
    console.log('Bandit Bot Online, Syncing up with network');
    const guild = Bandit.guilds.cache.get(SEXY_BONKLES_GUILD_ID)
    let commands;

    if(guild){
        commands = guild.commands;        
    }else{
        commands = Bandit.application?.commands;
    }

    commands?.create({
        name: 'flip',
        description: 'Perform a 50:50 coinflip to either double or lose your bonkle bucks',
        options: [
            {
                name: 'wager',
                description: 'The amount of bonkle bucks you wish to wager',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
                
            },
        ]
    })

    commands?.create({
        name: 'dangerflip',
        description: 'Perform a 50:50 coinflip to get 50 bonkle bucks or get kicked'
    })

    commands?.create({
        name: 'flipodds',
        description: 'Perform a coinflip with your own odds',
        options: [
            {
                name: 'odds',
                description: 'The odds you want, IE: 4:1 gives you a probability of 0.2 to win, but your payout is 4x',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: 'wager',
                description: 'The amount of bonkle bucks you wish to wager',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
            }
        ]
    })
})