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
        description: 'Get your current balance',
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