import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable, finalize, of, switchMap } from 'rxjs';
import { DrawType, LottoCard } from '../../../model/lotto-card';
import { CheckResult, LottoCheckService } from '../../../services/lotto-check.service';

type LottoNumbersForm = FormGroup<{
  numbers: FormArray<FormControl<number | null>>;
}>;

@Component({
  selector: 'app-lotto-card-form',
  imports: [ReactiveFormsModule],
  templateUrl: './lotto-card-form.component.html',
  styleUrl: './lotto-card-form.component.css'
})
export class LottoCardFormComponent implements OnInit {
  private readonly lottoCheckService = inject(LottoCheckService);

  protected readonly drawTypes = [
    { value: DrawType.LOTTO, label: 'Lotto' },
    { value: DrawType.LOTTO_PLUS, label: 'Lotto Plus' }
  ];

  protected readonly form = new FormGroup({
    firstDrawDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    numberOfDrawings: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)]
    }),
    drawType: new FormControl<DrawType>(DrawType.LOTTO, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    numbers: new FormArray<LottoNumbersForm>([this.createNumbersGroup()], {
      validators: [Validators.required, Validators.minLength(1)]
    })
  });

  protected readonly isSubmitting = signal(false);
  protected readonly savedCards = signal<LottoCard[]>([]);
  protected readonly selectedCardId = signal<number | null>(null);
  protected readonly resultMessage = signal('');
  protected readonly formattedResults = signal<string[]>([]);

  ngOnInit(): void {
    this.loadSavedCards(true);
  }

  protected get numbers(): FormArray<LottoNumbersForm> {
    return this.form.controls.numbers;
  }

  protected addNumbers(): void {
    this.numbers.push(this.createNumbersGroup());
  }

  protected removeNumbers(index: number): void {
    if (this.numbers.length === 1) {
      return;
    }

    this.numbers.removeAt(index);
  }

  protected canRemoveNumbers(): boolean {
    return this.numbers.length > 1;
  }

  protected selectSavedCard(cardId: string): void {
    const id = Number(cardId);
    const card = this.savedCards().find((savedCard) => savedCard.id === id);

    if (!card) {
      this.selectedCardId.set(null);
      return;
    }

    this.fillForm(card);
  }

  protected clearCard(): void {
    this.form.reset({
      firstDrawDate: '',
      numberOfDrawings: 1,
      drawType: DrawType.LOTTO
    });
    this.replaceNumbers([this.createNumbersGroup()]);
    this.selectedCardId.set(null);
    this.resultMessage.set('');
    this.formattedResults.set([]);
  }

  protected savedCardLabel(card: LottoCard): string {
    const drawType = card.drawType === DrawType.LOTTO_PLUS ? 'Lotto Plus' : 'Lotto';
    const firstNumbers = card.numbers[0]?.numbers?.join(', ') ?? 'brak liczb';

    return `${card.firstDrawDate}, ${drawType}, ${card.numberOfDrawings} los., ${firstNumbers}`;
  }

  protected numberControls(group: LottoNumbersForm): FormArray<FormControl<number | null>> {
    return group.controls.numbers;
  }

  protected submit(): void {
    this.resultMessage.set('');
    this.formattedResults.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.resultMessage.set('Uzupełnij wszystkie wymagane pola.');
      return;
    }

    this.isSubmitting.set(true);
    const card = this.toLottoCard();

    this.saveCardIfNeeded(card).pipe(
      switchMap((savedCard) => {
        this.selectedCardId.set(savedCard.id ?? null);
        this.upsertSavedCard(savedCard);
        return this.lottoCheckService.check(this.toCheckPayload(savedCard));
      }),
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (results) => {
        this.formattedResults.set(results.map((result) => this.formatResult(result)));
        this.resultMessage.set(`Zapisano kartę. Liczba wyników: ${results.length}.`);
      },
      error: () => {
        this.resultMessage.set('Nie udało się zapisać albo sprawdzić kuponu.');
      }
    });
  }

  private loadSavedCards(fillLatest: boolean): void {
    this.lottoCheckService.getCards().subscribe({
      next: (cards) => {
        this.savedCards.set(cards);

        if (fillLatest && cards.length > 0) {
          this.fillForm(cards[0]);
        }
      },
      error: () => {
        this.resultMessage.set('Nie udało się pobrać zapisanych kart.');
      }
    });
  }

  private saveCardIfNeeded(card: LottoCard): Observable<LottoCard> {
    if (card.id) {
      return of(card);
    }

    return this.lottoCheckService.saveCard(card);
  }

  private upsertSavedCard(card: LottoCard): void {
    if (!card.id) {
      return;
    }

    this.savedCards.update((cards) => {
      const existingIndex = cards.findIndex((savedCard) => savedCard.id === card.id);

      if (existingIndex === -1) {
        return [card, ...cards];
      }

      return cards;
    });
  }

  private toCheckPayload(card: LottoCard): LottoCard {
    const { id, ...payload } = card;
    return payload;
  }

  private createNumbersGroup(numbers: number[] = []): LottoNumbersForm {
    return new FormGroup({
      numbers: new FormArray<FormControl<number | null>>(
        Array.from({ length: 6 }, (_, index) => new FormControl<number | null>(numbers[index] ?? null, [
          Validators.required,
          Validators.min(1),
          Validators.max(49)
        ])),
        { validators: this.uniqueNumbersValidator }
      )
    });
  }

  private uniqueNumbersValidator(control: AbstractControl): ValidationErrors | null {
    const numbersControl = control as FormArray<FormControl<number | null>>;
    const filledNumbers = numbersControl.controls
      .map((numberControl) => numberControl.value)
      .filter((value): value is number => value !== null);

    return new Set(filledNumbers).size === filledNumbers.length ? null : { duplicatedNumbers: true };
  }

  private toLottoCard(): LottoCard {
    const rawValue = this.form.getRawValue();

    return {
      id: this.selectedCardId() ?? undefined,
      firstDrawDate: rawValue.firstDrawDate,
      numberOfDrawings: rawValue.numberOfDrawings,
      drawType: rawValue.drawType,
      numbers: rawValue.numbers.map((group) => ({
        numbers: group.numbers.map((value) => Number(value))
      }))
    };
  }

  private fillForm(card: LottoCard): void {
    this.form.patchValue({
      firstDrawDate: card.firstDrawDate,
      numberOfDrawings: card.numberOfDrawings,
      drawType: card.drawType
    });
    this.replaceNumbers(card.numbers.map((group) => this.createNumbersGroup(group.numbers)));
    this.selectedCardId.set(card.id ?? null);
    this.resultMessage.set('');
    this.formattedResults.set([]);
  }

  private replaceNumbers(groups: LottoNumbersForm[]): void {
    this.form.setControl('numbers', new FormArray<LottoNumbersForm>(groups, {
      validators: [Validators.required, Validators.minLength(1)]
    }));
  }

  private formatResult(result: CheckResult): string {
    const matchingCount = result.matchingNumbers.length;
    const drawName = result.lottoDrawDto.drawType === DrawType.LOTTO_PLUS ? 'PLUS' : 'GŁÓWNE LOSOWANIE';

    return [
      `wynik:${matchingCount}`,
      `pasujące liczby:=${this.formatNumbers(result.matchingNumbers)}`,
      `zakład:${this.formatNumbers(result.lottoCardNumbersDto.numbers)}`,
      `numery z losowania:${this.formatNumbers(result.lottoDrawDto.numbers)}`,
      drawName,
      `data losowania:${result.lottoDrawDto.date} -> ${this.resultInfo(matchingCount)}`
    ].join(', ');
  }

  private formatNumbers(numbers: number[]): string {
    return `[${numbers.join(', ')}]`;
  }

  private resultInfo(matchingCount: number): string {
    switch (matchingCount) {
      case 1:
        return 'Jedna trafiona';
      case 2:
        return 'Dwie trafione';
      case 3:
        return 'Zawsze coś';
      case 4:
        return 'Cztery trafione';
      case 5:
        return 'WOW, dużo kasy!';
      case 6:
        return 'WYGRANA!';
      default:
        return 'Brak trafień';
    }
  }

  protected getResultClass(result: string) : string{
    if (result.includes('wynik:6')) return "wygrana6";
    if (result.includes('wynik:5')) return "wygrana5";
    if (result.includes('wynik:4')) return "wygrana4";
    if (result.includes('wynik:3')) return "wygrana3";
    if (result.includes('wynik:2')) return "brak-wygranej2";
    if (result.includes('wynik:1')) return "brak-wygranej1";
    return "brak-wygranej0"
  }
}

