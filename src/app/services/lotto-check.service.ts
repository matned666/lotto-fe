import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from '../core/config/app-config.service';
import { DrawType, LottoCard } from '../model/lotto-card';

export interface LottoCheckPayload {
  firstDrawDate: string;
  numberOfDraws: number;
  numbers: {
    numbers: number[];
  }[];
  drawType: DrawType;
}

export interface CheckResult {
  lottoCardNumbersDto: {
    numbers: number[];
  };
  lottoDrawDto: {
    date: string;
    numbers: number[];
    drawType: DrawType;
  };
  matchingNumbers: number[];
  color: string;
}

@Injectable({ providedIn: 'root' })
export class LottoCheckService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);

  check(card: LottoCheckPayload): Observable<CheckResult[]> {
    return this.http.post<CheckResult[]>(`${this.appConfig.backendUrl}/check`, card);
  }

  saveCard(card: LottoCard): Observable<LottoCard> {
    return this.http.post<LottoCard>(`${this.appConfig.backendUrl}/cards`, card);
  }

  getCards(): Observable<LottoCard[]> {
    return this.http.get<LottoCard[]>(`${this.appConfig.backendUrl}/cards`);
  }

  getMostFrequentNumbers(): Observable<number[]> {
    return this.http.get<number[]>(`${this.appConfig.backendUrl}/stats/most-frequent-numbers`);
  }

  deleteCard(number: number): Observable<Boolean> {
    return this.http.delete<Boolean>(`${this.appConfig.backendUrl}/cards/${number}`)
  }

}
