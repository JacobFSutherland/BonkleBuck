import { Client, Intents } from 'discord.js';

export const CockChain = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]})
export const Banker = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]})
export const Shopkeeper = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_INVITES]})
export const Bandit = new Client({intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_BANS]})

CockChain.once('ready', ()=>{
    console.log('Chain Bot Online, Syncing up with network');
})

Banker.once('ready', ()=>{
    console.log('Banker Bot Online, Syncing up with network');
})

Shopkeeper.once('ready', () => {
    console.log('Broker Bot Online, Syncing up with network');
})

Bandit.once('ready', () => {
    console.log('Bandit Bot Online, Syncing up with network');
})