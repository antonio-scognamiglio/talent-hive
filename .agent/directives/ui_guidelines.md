# 🎨 UI & Design Guidelines

> **Obiettivo**: Mantenere l'interfaccia di TalentHive coerente, professionale ("Trustworthy") e perfettamente funzionante sia in Light che in Dark mode.

---

## 1. Brand Identity & Colors

TalentHive usa una palette professionale ma moderna.

- **Primary**: `hsl(200 90% 40%)` (Deep Blue) -> Fiducia, Professionalità.
- **Accent**: `hsl(25 95% 55%)` (Orange) -> Opportunità, Crescita.
- **Secondary**: `hsl(215 15% 93%)` (Warm Gray) -> Neutro, pulito.

### ✅ Regola d'Oro: Semantic Colors

Non usare MAI colori esadecimali o classi tailwind grezze come `bg-blue-500` se non strettamente necessario. Usa sempre i token semantici definiti in `index.css`:

| Token                                    | Uso                                        |
| ---------------------------------------- | ------------------------------------------ |
| `bg-primary` / `text-primary-foreground` | Bottoni principali, azioni chiave.         |
| `bg-card` / `text-card-foreground`       | Pannelli, card, modali.                    |
| `bg-muted` / `text-muted-foreground`     | Testo secondario, sfondi di supporto.      |
| `bg-accent` / `text-accent-foreground`   | Evidenziazioni, call-to-action secondarie. |
| `border-border`                          | Bordi standard (si adatta al tema).        |

---

## 2. Dark Mode First 🌙

Ogni componente **DEVE** essere testato e funzionante in Dark Mode.

### Pattern per Colori di Stato (Success/Warning/Danger)

Per garantire leggibilità su entrambi i temi, usa il pattern "Background trasparente + Testo colorato" invece di sfondi solidi o testi su sfondi scuri che richiedono override manuali.

**❌ Sbagliato (Rischio basso contrasto in dark mode):**

```tsx
<div className="bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100">
  Errore
</div>
```

**✅ Corretto (Pattern `InlineConfirmation`):**
Usa le variabili o classi `bg-{state}/10` e `text-{state}` che si adattano meglio, oppure usa classi specifiche per gestire il contrasto del testo.

```tsx
// Esempio per Warning
<div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
  Attenzione...
</div>

// Esempio per Success
<div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
  Operazione completata
</div>

// Esempio per Danger
<div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
  Azione distruttiva
</div>
```

---

## 3. Typography & Spacing

- **Font**: Inter / Sans-system.
- **Gerarchia**: Usa `text-foreground` per titoli e `text-muted-foreground` per descrizioni.
- **Card**: Usa sempre `bg-card border border-border rounded-lg` per contenitori. Evita ombre eccessive in dark mode.

---

## 4. Componenti Shadcn/UI

TalentHive usa Shadcn/UI. Non reinventare la ruota.

- **Bottoni**: Usa `<Button variant="...">`.
- **Input**: Usa `<Input />` e `<Label />`.
- **Dropdown**: Usa `<DropdownMenu />`.

Se devi creare un componente custom, assicurati che erediti le classi base (`text-sm`, `rounded-md`, `transition-colors`) per integrarsi visivamente.
