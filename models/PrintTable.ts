import { Console } from 'node:console'
import { Transform } from 'node:stream'


export class Table {
    private ts: Transform;
    private table: TableRow[]
    private logger: Console;
    constructor(){
        this.ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
        this.table = []
        this.logger = new Console({ stdout: this.ts })
    }
    push(t: TableRow){
        this.table.push(t);
    }
    printTable(): string{
        this.logger.table(this.table)
        return (this.ts.read() || '').toString()
    }
}

export interface TableRow {
    Strike: string,
    Bid: string,
    Ask: string
}