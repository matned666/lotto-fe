import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DrawType, LottoCard } from '../model/lotto-card';

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
  private readonly apiUrl = 'http://localhost:8080';

  check(card: LottoCard): Observable<CheckResult[]> {
    return this.http.post<CheckResult[]>(`${this.apiUrl}/check`, card);
  }

  saveCard(card: LottoCard): Observable<LottoCard> {
    return this.http.post<LottoCard>(`${this.apiUrl}/cards`, card);
  }

  getCards(): Observable<LottoCard[]> {
    return this.http.get<LottoCard[]>(`${this.apiUrl}/cards`);
  }
}
