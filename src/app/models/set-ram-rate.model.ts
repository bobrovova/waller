export enum Unit {
  bytes = 'Bytes',
  eos = 'JUN'
}

export class SetRamRate {
  constructor (
    public ramSize: number,
    public ramSizeUnit: string
  ){}
}
