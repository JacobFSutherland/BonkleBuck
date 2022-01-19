import { Transaction } from "./transactions";
import { toWords } from 'number-to-words';
import Captcha from "@haileybot/captcha-generator";
const ARITHMATIC_SYMBOLS = ['+', '-', '*', '/'];
const MAX_COMPUTATIONS = 4;
const LARGEST_NUMBER = 10000000;
const L33TLIB: Record<string, string> = {
    'a': '4',
    'b': 'l3',
    'c': '(',
    'd': '|)',
    'e': '3',
    'f': 'ƒ',
    'g': '9',
    'h': '|-|',
    'i': '1',
    'j': ',_',
    'k': '|<',
    'l': '|',
    'm': 'm',
    'n': '|\\|',
    'o': '[]',
    'p': '|>',
    'q': '<|,',
    'r': "|'",
    's': '5',
    't': '+',
    'u': '|_|',
    'v': 'v',
    'w': 'w',
    'x': '><',
    'y': '\'/',
    'z': '7\_',
    ' ': '   ',
    '-':'-',
    ',': ','

}

export class Block {
    id: number | undefined;
    reward: number;
    targetTime: number;
    private isSolved: Boolean;
    private baseReward: number;
    private rewardReciever: string | undefined;
    private transactions: Transaction[];
    private maxTransactions: number;
    private startTime: number;
    captcha: Captcha;

    constructor(transactions: number, reward: number, targetTimeSec: number){
        this.startTime = Date.now();
        this.isSolved = false;
        this.maxTransactions = transactions;
        this.baseReward = reward;
        this.reward = reward;
        this.targetTime = targetTimeSec;
        this.transactions = [];
        this.captcha = new Captcha();
    }

    calculateReward(){
        let timeToSolveBlock = (Date.now()-this.startTime)/1000;
        if(timeToSolveBlock >= 400*60){
            this.reward = 100;
        }else if(timeToSolveBlock >= 180*60){
            console.log('Top Block Reward Segment');
            let previousStep = 80;
            timeToSolveBlock -=180*60;
            this.reward = previousStep + timeToSolveBlock*0.1/60
        }else if(timeToSolveBlock >= 30*60){
            console.log('Mid Block Reward Segment');
            let previousStep = 3;
            timeToSolveBlock -=30*60;
            this.reward = previousStep + timeToSolveBlock*0.5/60
        }else {
            console.log('Bot Block Reward Segment');
            let previousStep = 0;
            this.reward = previousStep + timeToSolveBlock*0.1/60;
        }

        //this.reward = (Date.now()-this.startTime)/1000 * this.baseReward/this.targetTime
        //console.log("Time Delta: ", (Date.now()-this.startTime)/1000);
        //console.log('Multiplier: ', this.baseReward/this.targetTime)
    }

    addTransaction(T: Transaction): boolean{
        return !(0 == this.transactions.push(T));
    }

    checkAnswer(A: string): boolean{
        console.log('Checking in block')
        console.log("Guess: ", A);
        console.log("Actual: ", this.captcha.value);
        if(A == this.captcha.value){
            // Block Solved
            console.log('Block Solved, calculating reward');
            this.calculateReward();
            console.log('reward calculated');
            this.isSolved = true;
            return true;
        }else{
            // Block Not Solved
            return false;
        }
    }

    getBlockTransactions(): Transaction[] {
        if(this.isSolved){
            return this.transactions;
        }
        return [];
    } 

}

export interface BlockGuess {
    id: string,
    answer:string,
}