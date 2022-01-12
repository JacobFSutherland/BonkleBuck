import { Transaction } from ".";

export interface CasinoResponse{
    message: string
    transaction: Transaction | undefined
    kick: boolean
    playersFavor: boolean
}

export class CasinoGame {
    private Wager: number;
    private ChanceToWin: number;
    private PotentialWinnings: number;
    private isDangerous: boolean;

    constructor(m: string[], dangerous: boolean){
        switch(m[0]){
            case '!flip':
                this.ChanceToWin = 0.5;
                this.PotentialWinnings = Number(m[1]);
                this.Wager = Number(m[1]);
                this.isDangerous = dangerous;
                break;
            case '!odds':
                let odds = m[1].split(':');
                this.ChanceToWin = Number(odds[0])/Number(odds[1]);
                this.PotentialWinnings = this.ChanceToWin*Number(m[2]);
                this.Wager = Number(m[2]);
                this.isDangerous = dangerous;
            default:
                this.ChanceToWin = 0;
                this.PotentialWinnings = 0;
                this.Wager = 0;
                this.isDangerous = dangerous;
        }

    }

    play(reciever: string, sender: string): CasinoResponse {
        if(this.Wager === 0 || this.Wager === NaN) throw new Error('No Wager Error');
        if(Math.random() < this.ChanceToWin){
            return {
                message: `Unfortunate outcome! you gained ${this.PotentialWinnings} Bonkle Bucks in the next block`,
                transaction: {
                    reciever,
                    sender,
                    medium: {
                        type: 'BonkleBuck',
                        ammount: this.PotentialWinnings,
                    } 
                },
                kick: this.isDangerous,
                playersFavor: true
            }
        }
        return {
            message: `Congradulations! you lost ${this.Wager} Bonkle Bucks in the next block`,
            transaction: {
                reciever: sender,
                sender: reciever,
                medium: {
                    type: 'BonkleBuck',
                    ammount: this.PotentialWinnings,
                }, 
            },
            kick: this.isDangerous,
            playersFavor: false,

        }
    }
}