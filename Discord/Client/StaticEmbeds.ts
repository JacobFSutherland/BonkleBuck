import {MessageEmbed} from 'discord.js'
import { COCKSINO_CHANNEL_ID, COCK_EXCHANGE_CHANNEL_ID, MINING_CHANNEL_ID } from '../../env';

export const BanditEmbed: MessageEmbed = new MessageEmbed()
    .setTitle('Warning: All games give you the risk to get kicked')
    .addFields([
       {name: 'How do I do a coin flip?', value: 'You do a coinflip with \`!flip [Bonkle Buck Wager]\` if you win, you get your wager, but if you lose, you lose your wager and there is a 1% chance you will get kicked'},
       {name: 'How do I do a coin flip if I have no bonkle bucks?', value: 'You do a dangerous coinflip with \`!flip danger\` where you can win 50 bonkle bucks, or lose access to the server'}  
    ]);

export const HelpEmbed = new MessageEmbed()
    .setTitle('Commands')
    .addFields([
        { name: 'How to get Bonkle Bucks?', value: `Head over to <#${MINING_CHANNEL_ID}> and solve some blocks to recieve bonkle bucks` },
        { name: 'How do I send Bonkle Bucks?', value: 'To send Bonkle Bucks, use the command \`!send [discord ID] [Bonkle/NFT] [ammount/NFT ID]\`' },
        { name: 'What can I use Bonkle Bucks for?', value: `You can buy, and sell stocks and options that are on the New York Stock Exchange. For Stock help use \`!cock\' in <${COCK_EXCHANGE_CHANNEL_ID}>` },
        { name: 'What else can I use Bonkle Bucks for?', value: `You can gamble your life savings away in in <${COCKSINO_CHANNEL_ID}> use \`!gamble\' to see where you can burn your bonkle bucks.` },
    ]);

export const StockHelpEmbed: MessageEmbed = new MessageEmbed()
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
export const StockTerminologyEmbed: MessageEmbed = new MessageEmbed()
    .setTitle('Terminology')
    .addFields(
        { name: 'Stock Ticker', value: 'A stock ticker is a unique identifyer for a stock. To find the stock ticker for a company, google the company, and add stock ticker' },
        { name: 'Shares', value: 'A Share is a small fraction of an entire company' },
        { name: 'Quote', value: 'A Quote is an estimate as to how much a transaction would cost'},
        { name: 'Portfolio', value: 'The collection of the stocks you own'},
        { name: 'What is a call option?', value: 'A call option is a financial contract that allows you to purchase 100 shares of the underlying stock at the specified strike price'},
        { name: 'What is a put option?', value: 'A put option is a financial contract that allows you to sell 100 shares of the underlying stock at the specified strike price'},
    )
export const ShopInventoryEmbed: MessageEmbed = new MessageEmbed()
    .setTitle('Items for Sale')
    .setDescription('These are the items for sale today')
    .addFields(
        {name: 'discordInvite', value: '50 Bonkle Bucks'},
        {name: 'mute', value: '10 Bonkle Bucks'}
    )