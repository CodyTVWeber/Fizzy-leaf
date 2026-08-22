# Clean Code (portable)

Copied from `~/code/AI/rules/clean-code.md` @ `3ec3b6d` (2026-08-22). Re-copy when the AI floor moves.

**Scope:** all **new** code + **every line you touch or move**. Split without cleaning = **not done**.

Project repos may extend this (React patterns, domain models). This file is the **global floor**.

---

## Agent self-check (every commit on touched files)

1. **No** new narrating / banner / `// ignore` comments
2. Moved code: **fewer** comments than source (ideally zero)
3. File prefer **≤ ~200** lines
4. Params prefer **0–1** (2 ok, 3 painful, **4+ redesign**)
5. Nesting prefer **≤ 2–3**; function body prefer **≤ ~40** lines logic
6. Public API **top**, helpers **bottom** (newspaper)
7. Non-trivial **try/catch** only inside **named** functions
8. Magic numbers → **named** constants/helpers
9. Prefer **no param mutation** — return values; apply at call site (if mutates arg, name says so)
10. Fail-fast branches (log+throw / log+fallback) live in **named** functions, not inline `?: run {}`
11. Prefer **named enum** over boolean when the outcome has business meaning
12. Field/var name **must match** its own doc/schema description
13. Business-rule predicates/allow-lists: **one** definition, reused — never duplicated
14. Folders group by **business capability**, not by layer (`controller/`/`service/`/`model/`)

---

## Comments

| | |
|--|--|
| **Default** | **Zero** `//` `/*` `{/* */}` in authored/moved production code |
| **Confusing** | **Extract** named helper — call site is the doc |
| **Unclear name** | **Rename** until comment is pointless |
| **Banned** | Banners, narration, `// ignore`, restating JSDoc, polishing comments instead of extract |
| **Empty catch** | Named ignore helper (`ignoreProbeFailure`) — never empty `catch {}` |
| **Allowed (rare, 1 line)** | External quirk, security, measured tradeoff, ticketed temp, eslint-disable + reason |

---

## Size · params · extract

| | Bar |
|--|-----|
| File | Ideal **≤ ~200** lines; one responsibility; extract before growing |
| Function | Prefer **≤ ~40** lines logic; many small helpers > one nested blob |
| Params | **0–1** ideal · **2** ok · **3** painful · **4+** options object / split |
| Extract | Multi-step logic, deep conditionals, self-contained UI → **named** intent |

Exceptions: generated, type barrels, pure data tables, migration SQL, large fixtures. No mass-refactor of untouched files unless tasked.

Splitting a large class: prefer a plain **internal collaborator** constructed in-place over a new DI param — keeps the public constructor/tests stable.

---

## Newspaper order (stepdown)

**Top → bottom:** imports/types → **exported/public** → mid helpers → **private leaves**.  
**Callers above callees.** High-level first; detail downward. Order replaces section comments.

---

## Never-nester

| Prefer | Avoid |
|--------|--------|
| Early return / continue / throw | `if (ok) { huge block }` |
| Guard clauses | Deep if/else pyramids |
| Flat `await a(); await b();` | `try { if { try { if` |

---

## try/catch → named functions

Non-trivial `try`/`catch` lives in a **named** function that states the attempt. Orchestrators **call** helpers; they do not host long try blocks.

| Do | Don’t |
|----|--------|
| `readLocalStorageFields()` owns try/catch | Inline try in effects/orchestrators |
| Ignore → `ignoreProbeFailure(err)` | Empty `catch {}` / `// ignore` |
| One concern per helper | Mega-try wrapping half a function |

Soft exceptions: true one-liner already inside a tiny named fn; generated code.  
Probes/optional APIs: same rule; return `undefined` or merge only defined fields. **Do not log** on ignore hot paths.

---

## Fail-fast branches → named functions

Same rule as try/catch: any non-trivial "log + throw" or "log + return fallback" belongs in a **named** function, not inlined via `?: run { ... }` or a nested `if`.

| Do | Don't |
|----|--------|
| `zeroFeeOrThrow(pro, type)` | `?: run { logger.error(...); throw ... }` inline |
| `failToLoad(templateFile)` | `?: run { logger.error(...); error(...) }` inline |

---

## Enum over boolean

A boolean that really encodes **one of two named business outcomes** should be a domain enum instead — self-documenting, and doesn't silently go wrong when a third case shows up.

| Prefer | Avoid |
|--------|--------|
| `enum class DisclosureType { A, B }` | `isSelectMarketType: Boolean` |
| `when (disclosureTypeFor(fees))` | `if (isSelect) ... else ...` scattered at call sites |

---

## Single source of truth for business rules

A classification predicate, allow-list, or eligibility/fee rule lives in **exactly one** place. If two services need it, extract a shared object — never duplicate the list/logic per call site.

---

## Name must match its own doc

If a field/var's name contradicts its own doc comment or schema description (e.g. `rawText` holding "fully rendered" text), that's a bug — **rename it**, don't just fix the doc.

---

## Business case over mechanism

Structure by business case, not by technical layer — don't split a module into
`controller/`/`service/`/`model/` across the whole thing. Exact shape depends on the module's
size/complexity: small modules may need no subfolders at all; larger ones split by capability.
Code shared across business cases: one shared grouping, not duplicated per case.

---

## Magic numbers · “what is this?”

| Bad | Good |
|-----|------|
| `(a+b)*2` | `utf16ByteLength(a)+utf16ByteLength(b)` |
| bare `.slice(0,20)` | `MAX_NAMES_IN_SNAPSHOT` |

If a reader would ask “what is this doing?”, **rename or extract** — do not add a paragraph comment.

---

## Prefer not to mutate parameters

**Default:** do **not** edit arguments. Compute and **return**; the caller assigns.

| Prefer | Avoid |
|--------|--------|
| `const next = withHeap(snap);` | `function f(snap) { snap.memory = … }` |
| Pure transforms: input in → new value out | Hidden side effects on caller-owned objects |
| Explicit name when mutation is intentional | Mutation with a “read-only sounding” name |

**When mutation is OK** (setters, builders, rare perf): the **function name must say so** — e.g. `attachJsHeapToSnapshot(snap)`. If the name does not read as “writes into this argument,” **return instead**.

---

## Boy Scout

Touch leaves the file **smaller and quieter** (net-negative comment noise). Extract/move incomplete until narrating comments are gone from the moved chunk.

---

## TDD

Fast unit tests first. Clean Code self-check before commit — not optional after green tests.
