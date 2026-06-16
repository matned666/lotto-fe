import { Component, inject, OnInit, signal } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import { TranslatePipe } from '@ngx-translate/core';
import { LottoCheckService } from '../../../services/lotto-check.service';

@Component({
  selector: 'app-info',
  templateUrl: './stats.component.html',
  styleUrl: '../dashboard.component.css',
  imports: [NgOptimizedImage, TranslatePipe],
})
export class StatsComponent implements OnInit {
  private readonly lottoCheckService = inject(LottoCheckService);

  readonly NUMBER_OF_NUMBERS: Number = 6;

  topNumbers = signal<Number[]>([]);
  topNumbersByWeight = signal<Number[]>([]);

  ngOnInit(): void {
    this.lottoCheckService.getMostFrequentNumbers(this.NUMBER_OF_NUMBERS).subscribe((numbers) => {
      this.topNumbers.set(numbers);
    });
    this.lottoCheckService
      .getMostFrequentNumbersByWeight(this.NUMBER_OF_NUMBERS)
      .subscribe((numbers) => {
        this.topNumbersByWeight.set(numbers);
      });
  }
}
