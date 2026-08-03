# Liquid Glass — Implementation Examples

Worked examples for the [Liquid Glass skill](../SKILL.md). Each one composes the `.liquid-glass-*` utilities from `src/styles/utilities/_liquid-glass.scss` with `--fv-*` tokens.

---

### Example 1: Festival Card with Glass Effect

**HTML Template:**

```html
<article class="liquid-glass-card festival-card">
  <div class="festival-card__header">
    <h3 class="festival-card__title">Bigsound Festival 2026</h3>
    <span class="festival-card__date">12 – 16 jul</span>
  </div>
  <p class="festival-card__description">
    The main electronic music festival in Valencia
  </p>
  <footer class="festival-card__footer">
    <span class="festival-card__price">Desde €45</span>
    <a href="/festivales/bigsound" class="festival-card__link">
      View Details
    </a>
  </footer>
</article>
```

**Component Styles:**

```scss
.festival-card {
  display: flex;
  flex-direction: column;
  gap: var(--fv-space-3);
  max-width: 300px;
  color: var(--fv-text-primary);
  transition: transform var(--fv-duration-standard) var(--fv-ease-standard);

  &:hover {
    transform: translateY(-4px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--fv-space-3);
  }

  &__title {
    font-size: var(--fv-font-lg);
    font-weight: 600;
    margin: 0;
  }

  &__date {
    font-size: var(--fv-font-sm);
    color: var(--fv-text-secondary);
  }

  &__description {
    margin: 0;
    color: var(--fv-text-secondary);
    line-height: var(--fv-line-height-relaxed);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  &__price {
    font-weight: 600;
    color: var(--fv-accent-blue);
  }

  &__link {
    padding: var(--fv-space-2) var(--fv-space-3);
    color: var(--fv-accent-blue);
    text-decoration: none;
    font-size: var(--fv-font-sm);
    border-radius: var(--fv-radius-1);
    transition: background-color var(--fv-duration-fast) var(--fv-ease-standard);

    &:hover {
      background: rgba(78, 140, 255, 0.1);
    }

    &:focus-visible {
      outline: 2px solid var(--fv-accent-blue);
      outline-offset: 2px;
    }
  }
}
```

---

### Example 2: Map Overlay Panel

**HTML Template:**

```html
<div class="map-container">
  <div id="festival-map"></div>
  <div class="liquid-glass-map-overlay map-info">
    <h4 class="map-info__title">Cullera, Valencia</h4>
    <p class="map-info__description">
      Medusa Festival & Zevra Festival take place here
    </p>
    <button class="liquid-glass-button map-info__action">
      Explore Venue
    </button>
  </div>
</div>
```

**Component Styles:**

```scss
.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: var(--fv-radius-2);
  overflow: hidden;

  #festival-map {
    width: 100%;
    height: 100%;
  }
}

.map-info {
  bottom: var(--fv-space-5);
  right: var(--fv-space-5);
  max-width: 320px;
  z-index: 10;

  &__title {
    margin: 0 0 var(--fv-space-2) 0;
    font-size: var(--fv-font-md);
    font-weight: 600;
    color: var(--fv-text-primary);
  }

  &__description {
    margin: 0 0 var(--fv-space-3) 0;
    font-size: var(--fv-font-sm);
    color: var(--fv-text-secondary);
    line-height: var(--fv-line-height-relaxed);
  }

  &__action {
    width: 100%;
    justify-content: center;
  }
}
```

---

### Example 3: Filter Panel with Glass Background

**HTML Template:**

```html
<aside class="liquid-glass-panel filter-panel">
  <h2 class="filter-panel__title">Filters</h2>
  
  <fieldset class="filter-panel__group">
    <legend class="filter-panel__legend">Province</legend>
    <label class="filter-panel__option">
      <input type="checkbox" name="province" value="valencia" />
      Valencia
    </label>
    <label class="filter-panel__option">
      <input type="checkbox" name="province" value="alicante" />
      Alicante
    </label>
  </fieldset>

  <fieldset class="filter-panel__group">
    <legend class="filter-panel__legend">Genre</legend>
    <label class="filter-panel__option">
      <input type="checkbox" name="genre" value="electronic" />
      Electronic
    </label>
    <label class="filter-panel__option">
      <input type="checkbox" name="genre" value="indie" />
      Indie
    </label>
  </fieldset>
</aside>
```

**Component Styles:**

```scss
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: var(--fv-space-4);

  &__title {
    margin: 0;
    font-size: var(--fv-font-lg);
    font-weight: 600;
    color: var(--fv-text-primary);
  }

  &__group {
    border: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--fv-space-2);
  }

  &__legend {
    font-size: var(--fv-font-sm);
    font-weight: 600;
    color: var(--fv-text-secondary);
    margin-bottom: var(--fv-space-2);
  }

  &__option {
    display: flex;
    align-items: center;
    gap: var(--fv-space-2);
    cursor: pointer;
    color: var(--fv-text-primary);
    font-size: var(--fv-font-sm);

    input[type="checkbox"] {
      cursor: pointer;
      accent-color: var(--fv-accent-blue);

      &:focus-visible {
        outline: 2px solid var(--fv-accent-blue);
        outline-offset: 2px;
      }
    }
  }
}
```

---

### Example 4: Hero Section with Glass Overlay

**HTML Template:**

```html
<section class="hero-section">
  <div class="hero-section__background" style="background-image: url('/path/to/festival-poster.jpg')"></div>
  
  <div class="liquid-glass-panel hero-section__overlay hero-section__overlay--glow-blue">
    <h1 class="hero-section__title">Bigsound Festival 2026</h1>
    <p class="hero-section__subtitle">Europe's Most Electric Summer Festival</p>
    <button class="liquid-glass-button hero-section__cta">
      Discover Lineup
    </button>
  </div>
</section>
```

**Component Styles:**

```scss
.hero-section {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: var(--fv-radius-3);

  &__background {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: brightness(0.6);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    z-index: 1;

    &--glow-blue {
      box-shadow: var(--fv-glass-glow-blue);
    }
  }

  &__title {
    margin: 0 0 var(--fv-space-2) 0;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--fv-text-primary);
    max-width: 600px;
  }

  &__subtitle {
    margin: 0 0 var(--fv-space-4) 0;
    font-size: var(--fv-font-lg);
    color: var(--fv-text-secondary);
    max-width: 500px;
  }

  &__cta {
    align-self: flex-start;
  }

  @media (max-width: 768px) {
    height: 350px;

    &__title {
      font-size: clamp(1.5rem, 4vw, 2rem);
    }

    &__subtitle {
      font-size: var(--fv-font-md);
    }
  }
}
```

---

### Example 5: Component Using Liquid Glass in Astro

**`.astro` Component:**

```astro
---
// src/components/FestivalSpotlight.astro
// Accepts a plain data object as a prop — no store, no service injection.
// Date formatting happens in frontmatter (plain TS), never as inline template logic.
interface Props {
  festival: {
    nombre: string;
    slug: string;
    generos: string[];
    fechaInicio: string;
    fechaFin: string;
  };
}

const { festival } = Astro.props;

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });
const dateRange = `${dateFormatter.format(new Date(festival.fechaInicio))} – ${dateFormatter.format(new Date(festival.fechaFin))}`;
---

<article class="liquid-glass-card spotlight-card">
  <img
    src={`/assets/images/festivals/${festival.slug}/${festival.slug}-poster.webp`}
    alt={`Cartel de ${festival.nombre}`}
    width="300" height="300"
    loading="lazy"
    class="spotlight-card__image"
  />
  <div class="spotlight-card__content">
    <h3 class="spotlight-card__title">{festival.nombre}</h3>
    <p class="spotlight-card__genre">{festival.generos.join(', ')}</p>
    <p class="spotlight-card__dates">{dateRange}</p>
    <a href={`/festivales/${festival.slug}`} class="liquid-glass-button spotlight-card__link">
      Explore Festival
    </a>
  </div>
</article>

<style lang="scss" is:global>
  @use '../styles/mixins' as *;

  .spotlight-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--fv-space-4);
    max-width: 600px;

    &__image {
      border-radius: var(--fv-radius-lg);
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    &__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--fv-space-2);
    }

    &__title {
      margin: 0;
      font-size: var(--fv-text-lg);
      font-weight: 600;
      color: var(--fv-text-primary);
    }

    &__genre {
      margin: 0;
      font-size: var(--fv-text-sm);
      color: var(--fv-accent-blue);
      font-weight: 500;
    }

    &__dates {
      margin: 0;
      font-size: var(--fv-text-sm);
      color: var(--fv-text-secondary);
    }

    &__link {
      margin-top: var(--fv-space-2);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
</style>
```

