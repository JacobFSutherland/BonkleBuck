import { Transaction } from "./transactions";
import { toWords } from 'number-to-words';
const ARITHMATIC_SYMBOLS = ['+', '-', '*', '/'];
const MAX_COMPUTATIONS = 4;
const LARGEST_NUMBER = 10000000;

interface Solution{
    question: string;
    answer: number;
}

export class Block {
    id: number | undefined;
    reward: number;
    targetTime: number;
    blockQuestion: string;
    private isSolved: Boolean;
    private baseReward: number;
    private rewardReciever: string | undefined;
    private transactions: Transaction[];
    private maxTransactions: number;
    private startTime: number;

    blockAnswer: number;

    constructor(transactions: number, reward: number, targetTimeSec: number){
        this.startTime = Date.now();
        this.isSolved = false;
        this.maxTransactions = transactions;
        this.baseReward = reward;
        this.reward = reward;
        this.targetTime = targetTimeSec;
        this.transactions = [];
        let question: Solution = createQuestion();
        if(question.answer.toString().includes('e')){
            while(question.answer.toString().includes('e')){
                question = createQuestion();
                console.log('Creating new question')
            }
        }
        this.blockQuestion = question.question;
        this.blockAnswer = question.answer;
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
        console.log("Actual: ", this.blockAnswer);
        if(Number(A) == this.blockAnswer){
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

function createQuestion(): Solution {
    let mathProblem = " ";
    let writtenProblem = " "; 
    let numVariables = randomIntFromInterval(LARGEST_NUMBER*-1, LARGEST_NUMBER) % MAX_COMPUTATIONS + 1;
    let numberToBeComputed: number;

    for(let i = 0; i <= numVariables; i++){
        numberToBeComputed = randomIntFromInterval(LARGEST_NUMBER*-1, LARGEST_NUMBER);
        let symbol = ARITHMATIC_SYMBOLS[randomIntFromInterval(0, LARGEST_NUMBER)%ARITHMATIC_SYMBOLS.length];
        mathProblem += `${numberToBeComputed} ${symbol} `
        if(Math.random() > 0.5){
            writtenProblem += `${toWords(numberToBeComputed)} ${symbol} `
        }else{
            writtenProblem += `${numberToBeComputed} ${symbol} `
        }
    }
    numberToBeComputed = randomIntFromInterval(LARGEST_NUMBER*-1, LARGEST_NUMBER)
    mathProblem += (numberToBeComputed + '');
    if(Math.random() > 0.5){
        writtenProblem += toWords(numberToBeComputed)
    }else{
        writtenProblem += (numberToBeComputed + '')
    }

    let solution: Solution = {
        question: `What is ${writtenProblem} rounded to 2 decimal places?`,
        answer: Number(eval(mathProblem).toFixed(2))
    }
    console.log('Written problem: ', writtenProblem);
    console.log('Actual problem: ', mathProblem);
    return solution;
}

function randomIntFromInterval(min: number, max: number): number { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }