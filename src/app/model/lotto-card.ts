export interface LottoCard {
  id?: number;
  firstDrawDate: string;
  numberOfDraws: number;
  numbers: LottoCardNumbers[];
  drawType: DrawType;
}

export interface LottoCardNumbers {
  numbers: number[];
}

export enum DrawType {
  LOTTO = 'LOTTO',
  LOTTO_PLUS = 'LOTTO_PLUS'
}
