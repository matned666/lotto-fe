import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable, finalize, switchMap } from 'rxjs';
import { DrawType, LottoCard } from '../../../model/lotto-card';
import { CheckResult, LottoCheckPayload, LottoCheckService } from '../../../services/lotto-check.service';

type LottoNumbersForm = FormGroup<{
  numbers: FormArray<FormControl<number | null>>;
}>;

interface FormattedCheckResult {
  className: string;
  drawDate: string;
  drawName: string;
  matchingCount: number;
  cardNumbers: LottoNumberDisplay[];
  drawNumbers: LottoNumberDisplay[];
}

interface LottoNumberDisplay {
  value: number;
  isMatching: boolean;
}

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
    numberOfDraws: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(20)]
    }),
    drawType: new FormControl<DrawType>(DrawType.LOTTO, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    numbers: new FormArray<LottoNumbersForm>([this.createNumbersGroup()], {
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(10)]
    })
  });

  protected readonly isSubmitting = signal(false);
  protected readonly savedCards = signal<LottoCard[]>([]);
  protected readonly selectedCardId = signal<number | null>(null);
  protected readonly resultMessage = signal('');
  protected readonly formattedResults = signal<FormattedCheckResult[]>([]);
  protected readonly isResultsPopupOpen = signal(false);
  protected readonly winningResultsCount = signal(0);

  ngOnInit(): void {
    this.loadSavedCards(true);
  }

  protected get numbers(): FormArray<LottoNumbersForm> {
    return this.form.controls.numbers;
  }

  protected addNumbers(): void {
    if (this.numbers.length >= 10) {
      return;
    }

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
      numberOfDraws: 1,
      drawType: DrawType.LOTTO
    });
    this.replaceNumbers([this.createNumbersGroup()]);
    this.selectedCardId.set(null);
    this.resultMessage.set('');
    this.formattedResults.set([]);
    this.isResultsPopupOpen.set(false);
    this.winningResultsCount.set(0);
  }

  protected savedCardLabel(card: LottoCard): string {
    const drawType = card.drawType === DrawType.LOTTO_PLUS ? 'Lotto Plus' : 'Lotto';
    const firstNumbers = card.numbers[0]?.numbers?.join(', ') ?? 'brak liczb';

    return `${card.firstDrawDate}, ${drawType}, ${card.numberOfDraws} los., ${firstNumbers}`;
  }

  protected numberControls(group: LottoNumbersForm): FormArray<FormControl<number | null>> {
    return group.controls.numbers;
  }

  protected submit(): void {
    this.resultMessage.set('');
    this.formattedResults.set([]);
    this.isResultsPopupOpen.set(false);
    this.winningResultsCount.set(0);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.resultMessage.set('Uzupelnij wszystkie wymagane pola.');
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
        const formattedResults = this.sortResultsByDate(results).map((result) => this.toFormattedResult(result));
        this.formattedResults.set(formattedResults);
        this.winningResultsCount.set(formattedResults.filter((result) => result.matchingCount >= 3).length);
        this.isResultsPopupOpen.set(results.length > 0);
        this.resultMessage.set(`Zapisano karte. Liczba wynikow: ${results.length}.`);
      },
      error: () => {
        this.resultMessage.set('Nie udalo sie zapisac albo sprawdzic kuponu.');
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
        this.resultMessage.set('Nie udalo sie pobrac zapisanych kart.');
      }
    });
  }

  private saveCardIfNeeded(card: LottoCard): Observable<LottoCard> {
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

      const updatedCards = [...cards];
      updatedCards[existingIndex] = card;
      return updatedCards;
    });
  }

  private toCheckPayload(card: LottoCard): LottoCheckPayload {
    return {
      firstDrawDate: card.firstDrawDate,
      numberOfDraws: card.numberOfDraws,
      numbers: card.numbers,
      drawType: card.drawType
    };
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
      numberOfDraws: rawValue.numberOfDraws,
      drawType: rawValue.drawType,
      numbers: rawValue.numbers.map((group) => ({
        numbers: group.numbers.map((value) => Number(value)),
      })),
    };
  }

  private fillForm(card: LottoCard): void {
    this.form.patchValue({
      firstDrawDate: card.firstDrawDate,
      numberOfDraws: card.numberOfDraws,
      drawType: card.drawType
    });
    this.replaceNumbers(card.numbers.map((group) => this.createNumbersGroup(group.numbers)));
    this.selectedCardId.set(card.id ?? null);
    this.resultMessage.set('');
    this.formattedResults.set([]);
    this.isResultsPopupOpen.set(false);
    this.winningResultsCount.set(0);
  }

  private replaceNumbers(groups: LottoNumbersForm[]): void {
    this.form.setControl('numbers', new FormArray<LottoNumbersForm>(groups, {
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(10)]
    }));
  }

  private sortResultsByDate(results: CheckResult[]): CheckResult[] {
    return [...results].sort((first, second) => this.dateTime(second.lottoDrawDto.date) - this.dateTime(first.lottoDrawDto.date));
  }

  private dateTime(date: string): number {
    const time = new Date(date).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  private toFormattedResult(result: CheckResult): FormattedCheckResult {
    const matchingCount = result.matchingNumbers.length;
    const drawName = result.lottoDrawDto.drawType === DrawType.LOTTO_PLUS ? 'PLUS' : 'GLOWNE LOSOWANIE';

    return {
      className: this.resultClassByMatchingCount(matchingCount),
      drawDate: result.lottoDrawDto.date,
      drawName,
      matchingCount,
      cardNumbers: this.toNumberDisplay(result.lottoCardNumbersDto.numbers, result.matchingNumbers),
      drawNumbers: this.toNumberDisplay(result.lottoDrawDto.numbers, result.matchingNumbers)
    };
  }

  private toNumberDisplay(numbers: number[], matchingNumbers: number[]): LottoNumberDisplay[] {
    const matchingSet = new Set(matchingNumbers);

    return numbers.map((value) => ({
      value,
      isMatching: matchingSet.has(value)
    }));
  }

  private resultInfo(matchingCount: number): string {
    switch (matchingCount) {
      case 1:
        return 'Jedna trafiona';
      case 2:
        return 'Dwie trafione';
      case 3:
        return 'Zawsze cos';
      case 4:
        return 'Cztery trafione';
      case 5:
        return 'WOW, duzo kasy!';
      case 6:
        return 'WYGRANA!';
      default:
        return 'Brak trafien';
    }
  }

  protected closeResultsPopup(): void {
    this.isResultsPopupOpen.set(false);
  }

  protected openResultsPopup(): void {
    if (this.formattedResults().length === 0) {
      return;
    }

    this.isResultsPopupOpen.set(true);
  }

  private resultClassByMatchingCount(matchingCount: number): string {
    if (matchingCount === 6) return 'wygrana6';
    if (matchingCount === 5) return 'wygrana5';
    if (matchingCount === 4) return 'wygrana4';
    if (matchingCount === 3) return 'wygrana3';
    if (matchingCount === 2) return 'brak-wygranej2';
    if (matchingCount === 1) return 'brak-wygranej1';
    return 'brak-wygranej0';
  }
}
