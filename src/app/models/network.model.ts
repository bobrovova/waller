export class Network {
  constructor (
        public host: string,
        public viewValue: string,
        public currentChainId: string,
        public port: number,
        public protocol: string,
        public isCustome: boolean = false
    ) {}
}

export enum NetworkProtocol {
    Http = 'http://',
    Https = 'https://'
}

export enum NetworkChaindId {
    MainNet = '60fb0eb4742886af8a0e147f4af6fd363e8e8d8f18bdf73a10ee0134fec1c551',
    Jungle = '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
}
