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

  top10Numbers = signal<Number[]>([]);

  ngOnInit(): void {
    this.lottoCheckService.getMostFrequentNumbers().subscribe(numbers => {
      this.top10Numbers.set(numbers);
    });
  }
}
