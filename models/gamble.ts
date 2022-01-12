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
                this.isDangerous = dangerous;
                this.PotentialWinnings = Number(m[1]);
                this.Wager = Number(m[1]);
                if(dangerous) this.PotentialWinnings = 50;
                break;
            case '!odds':
                let odds = m[2].split(':');
                this.ChanceToWin = Number(odds[1])/(Number(odds[0])+Number(odds[1]));
                this.Wager = Number(m[1]);
                this.PotentialWinnings = 1/(this.ChanceToWin)*this.Wager - this.Wager
                this.isDangerous = dangerous;
                console.log('Chance to win: ', this.ChanceToWin);
                console.log('Wager: ', this.Wager);
                console.log('Potential Winnings: ', this.PotentialWinnings);
                break;
            default:
                this.ChanceToWin = 0;
                this.PotentialWinnings = 0;
                this.Wager = 0;
                this.isDangerous = dangerous;
                break;
        }

    }

    play(reciever: string, sender: string): CasinoResponse {
        if(this.Wager === 0 || this.Wager === NaN) throw new Error('No Wager Error');
        console.log(this.ChanceToWin);
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
                kick: false,
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
                    ammount: this.Wager,
                }, 
            },
            kick: this.isDangerous,
            playersFavor: false,

        }
    }
}