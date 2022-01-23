import { Block, BlockGuess, BonkleBuck, Transaction } from "../models";
import got, { Got, Options } from 'got';
import { MINING_CHANNEL_ID, WEBHOOKS } from "../env";
import { Client, MessageAttachment, MessageEmbed, TextChannel } from "discord.js";

const {BLOCK_WEBHOOK, QUESTION_WEBHOOK} = WEBHOOKS;
const MAX_TRANSACTIONS: number = 32;

export class BlockController {
  currentBlock: Block;
  targetBlockTime: number;
  blockReward: number;
  isBeingRead: boolean;
  CockChain: Client;
  MINOR_CHANNEL: TextChannel | undefined;

  constructor(blockReward: number, targetBlockTime: number, client: Client){
      this.currentBlock = new Block(0, blockReward, targetBlockTime);
      this.blockReward = blockReward;
      this.targetBlockTime = targetBlockTime;
      this.isBeingRead = false;
      this.CockChain = client;
  }

  addTransactionToBlock(t: Transaction){
    this.currentBlock.addTransaction(t);
  }

  init(){
    if(this.CockChain.isReady()){
      let channel = this.CockChain.channels.cache.get(MINING_CHANNEL_ID) as TextChannel;
      console.log(`channel.id: ${channel.id}`);
      this.MINOR_CHANNEL = channel;
      return;
    }else{
      console.log('Not Ready yet');
    }
  }

  async trySolution(solution: BlockGuess): Promise<Transaction | void> {
    console.log('Trying Solution');
    if(this.currentBlock.checkAnswer(solution.answer) && !this.isBeingRead){
      this.isBeingRead = true;
      // Attempt was the answer
      console.log('Solution was right')

      // Add block reward to transactions
      let medium: BonkleBuck = {
        ammount: this.currentBlock.reward,
        type: "BonkleBuck"
      };
      let solvedTransaction: Transaction = {
        reciever: solution.id,
        medium,
        sender: "BLOCK_REWARD",
      }

      console.log('Adding solved block transaction')
      this.currentBlock.addTransaction(solvedTransaction);

      // Get all transactions from the block
      console.log('Getting all block transactions')
      let transactions = this.currentBlock.getBlockTransactions();
      
      console.log('Got into try solution')

      // Send Webhook with Block Data
      await this.splitAndSubmitBlocks(solution, transactions);

      console.log('Submitted Block')

      // Create New Block

      let captcha = this.createNewBlock();


      console.log('Created new block');
      this.isBeingRead = false;
      return solvedTransaction;

    }else{
      //Block not solved
      return;
    }
  }
  

  private async splitAndSubmitBlocks(s: BlockGuess, t: Transaction[]){
    if(t.length < 20){
      await this.sumbitBlock(s, t);
      return;
    }else{
      let transactions: [Transaction[]] = [[]];
      console.log(`ceil of ${t.length}/10 = ${Math.ceil(t.length/10)}`);
      let blocksToSubmit = Math.ceil(t.length/20);
      for(let i = 0; i < blocksToSubmit; i++){
        transactions.push([]);
        for(let j = 0; j < 20; j++){  
          let tr = t.pop();
          if(tr) transactions[i].push(tr);
        }
        console.log('Submitting Block chunk ', i+1);
        await this.sumbitBlock(s, transactions[i]);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  }

  private async sumbitBlock(s: BlockGuess, t: Transaction[]){
    let payload = {
      embeds: [{
        fields:[{
          name: "Solver",
          value: s.id,
          inline: true, 
        },
        {
          name: "Answer",
          value: s.answer.toString(),
          inline: true
        }]
      }],
    };
    console.log(JSON.stringify(payload));
    console.log(t[0]);

    let transaction;
    for(let i = 0; i < t.length; i++){
    
      transaction = {
        name: `Transaction ${(i+1).toString()}`,
        value: `\`${JSON.stringify(t[i])}\``,
        inline: false,
      };
      payload.embeds[0].fields.push(transaction);
    }
    while(true){
      try{
        await got(
          {
            url: BLOCK_WEBHOOK,
            method: 'post',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'},
          }
        )
        return;
      }catch(e){
        await sleep(2000);
      }
    }
  }

  async createNewBlock(){
    this.currentBlock = new Block(MAX_TRANSACTIONS, this.blockReward, this.targetBlockTime);
    let image = new MessageAttachment(this.currentBlock.captcha.PNGStream, 'captcha.png');;
    let embeds = new MessageEmbed().addField('Question', 'Enter the text shown in the image below:');
    console.log('Returning Question')
    console.log('Answer: ', this.currentBlock.captcha.value);
    this.MINOR_CHANNEL!.send({files: [image]});
    return;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}