import { Component } from '@angular/core';
import { LottoCardFormComponent } from './components/dashboard/lotto-card-form/lotto-card-form.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
