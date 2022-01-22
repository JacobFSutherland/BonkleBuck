export interface TokenContract {
    type: 'TokenContract'
    name: string,
    quantity: number,
    minter: string,
    description: string,
    holderCount: number,
    distribution: {[id: string] : number}
}