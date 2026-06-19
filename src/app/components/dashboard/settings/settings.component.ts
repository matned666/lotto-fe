import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertiesService } from '../../../services/properties.service';
import { Properties, PropertyType } from '../../../model/properties';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-info',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
})
export class SettingsComponent implements OnInit {
  private propertiesService = inject(PropertiesService);
  private readonly authService = inject(AuthService);
  private translate = inject(TranslateService);

  protected readonly displayedColumns = ['id', 'type', 'name', 'value', 'enabled'];
  protected readonly propertyTypes = Object.values(PropertyType);
  protected readonly properties = signal<Properties[]>([]);
  protected readonly resultMessage = signal('');
  protected readonly isEditPopupOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly editedPropertyId = signal<number | null>(null);

  protected readonly user = this.authService.user;
  protected readonly userRoles = computed(() => this.user()?.authorities ?? []);
  protected readonly editForm = new FormGroup({
    id: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
    type: new FormControl({ value: PropertyType.BOOLEAN, disabled: true }, { nonNullable: true }),
    name: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    label: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    value: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.propertiesService.getProperties().subscribe({
      next: (properties) => {
        this.properties.set(properties);
      },
      error: () => {
        this.resultMessage.set('Could not load properties.');
      },
    });
  }

  protected openEditPopup(property: Properties): void {
    this.editedPropertyId.set(property.id);
    this.editForm.reset({
      id: property.id,
      type: property.type,
      name: property.name,
      label: property.label,
      value: property.value,
      enabled: property.enabled,
    });
    this.resultMessage.set('');
    this.isEditPopupOpen.set(true);
  }

  protected closeEditPopup(): void {
    this.isEditPopupOpen.set(false);
    this.editedPropertyId.set(null);
    this.editForm.reset({
      id: 0,
      type: PropertyType.BOOLEAN,
      name: '',
      label: '',
      value: '',
      enabled: false,
    });
  }

  protected saveProperty(): void {
    if (this.editForm.invalid || this.editedPropertyId() === null) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const property = this.toPropertyPayload();

    this.propertiesService.postChanges(property).subscribe({
      next: (properties) => {
        if (Array.isArray(properties)) {
          this.properties.set(properties);
        } else {
          this.properties.update((currentProperties) =>
            currentProperties.map((currentProperty) =>
              currentProperty.id === property.id ? property : currentProperty
            )
          );
        }

        this.resultMessage.set('Property saved successfully.');
        this.closeEditPopup();
        this.isSaving.set(false);
      },
      error: () => {
        this.resultMessage.set('Could not save property.');
        this.isSaving.set(false);
      },
    });
  }

  private toPropertyPayload(): Properties {
    const rawValue = this.editForm.getRawValue();

    return {
      id: this.editedPropertyId()!,
      type: rawValue.type,
      name: rawValue.name.trim(),
      label: rawValue.label.trim(),
      value: rawValue.type === PropertyType.BOOLEAN ? String(rawValue.value === 'true') : rawValue.value,
      enabled: rawValue.enabled,
    };
  }

  protected isBooleanType(value: PropertyType) {
    return value === PropertyType.BOOLEAN;
  }
}
