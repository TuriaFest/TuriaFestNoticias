---
name: forms-validation
description: >-
  ROADMAP SPEC — no forms exist in the app yet. Typed Reactive Forms for search, filtering and
  future auth flows: custom validators (DNI, date and price ranges) with error messages routed
  through i18n. Use when building or validating any form or input control; treat this as the
  design contract for that future work.
---

# 📝 Forms & Validation

Patterns for reactive forms used in search, filtering, and (future) authentication flows.

## Purpose

Centralize form construction, validation, and error messaging for **TuriaFestNoticias**.

## Use Cases

- Festival search bar (text, debounce 300 ms).
- Multi-criteria filter form (`provincia`, `mes`, `genero`, price range).
- Future: registration, login, profile, newsletter subscription, festival reviews.

## Conventions

- **Reactive Forms** only — no template-driven forms.
- Form groups typed with `FormGroup<...>` and explicit `FormControl<T>` generics.
- Validators composed from a shared library in `@shared/util/validators/`.
- Async validators return `Observable<ValidationErrors | null>` and use `debounceTime`.

## Custom Validators (planned)

- `dniValidator` — Spanish DNI/NIE format.
- `dateRangeValidator` — `desde <= hasta`.
- `priceRangeValidator` — non-negative, `min <= max`.

## Error Display

- Single `fv-form-error` component (in `@shared/ui/form-error/`) reads control state and outputs i18n messages.
- Errors shown only after `touched || dirty`.

---

## Examples

### Typed FormGroup — filter form

```ts
// src/app/features/festival-list/feature/festival-list.page.ts
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Provincia } from '@shared/domain/festival.model';

interface FilterForm {
  provincia: FormControl<Provincia | null>;
  mes:       FormControl<number | null>;    // 1–12
  genero:    FormControl<string | null>;
  precioMax: FormControl<number | null>;
}

@Component({
  imports: [ReactiveFormsModule, /* ... */],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FestivalListPageComponent {
  readonly filterForm = new FormGroup<FilterForm>({
    provincia: new FormControl(null),
    mes:       new FormControl(null),
    genero:    new FormControl(null),
    precioMax: new FormControl(null, [Validators.min(0), Validators.max(500)]),
  });

  applyFilters(): void {
    if (this.filterForm.invalid) return;
    const { provincia, mes, genero, precioMax } = this.filterForm.getRawValue();
    this.filtersStore.setProvincia(provincia);
    this.filtersStore.setMes(mes);
    this.filtersStore.setGenero(genero);
    this.filtersStore.setPrecioMax(precioMax);
  }
}
```

### Custom validator — price range

```ts
// src/app/shared/util/validators/price-range.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function priceRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value as number | null;
    if (val === null) return null;
    if (val < min) return { precioMin: { min, actual: val } };
    if (val > max) return { precioMax: { max, actual: val } };
    return null;
  };
}

// Usage
precioMax: new FormControl(null, [priceRangeValidator(0, 500)]),
```

### fv-form-error — template usage

```html
<!-- Template: show error only after the user has touched the field -->
<div class="field">
  <label for="precioMax">{{ 'filters.precioMax.label' | t }}</label>
  <input id="precioMax" type="number" formControlName="precioMax" />
  <fv-form-error [control]="filterForm.controls.precioMax" />
</div>
```

```ts
// src/app/shared/ui/form-error/form-error.ts
@Component({
  selector: 'fv-form-error',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showError()) {
      <span class="form-error" role="alert">{{ errorKey() | t }}</span>
    }
  `,
})
export class FormErrorComponent {
  readonly control = input.required<AbstractControl>();

  readonly showError = computed(() =>
    this.control().invalid && (this.control().touched || this.control().dirty),
  );

  readonly errorKey = computed((): string => {
    const errors = this.control().errors;
    if (!errors) return '';
    if (errors['required'])  return 'validation.required';
    if (errors['precioMin']) return 'validation.precio.min';
    if (errors['precioMax']) return 'validation.precio.max';
    return 'validation.invalid';
  });
}
```

## Related skills

- [[internationalization]]
- [[accessibility]]
- [[state-management]]
