# Feature folders

Every checkpoint owns a folder here. The folder name carries the build order
and the priority:

```
c<NN>-p<0|1>-<slug>
 |     |      |
 |     |      +-- what it is
 |     +--------- priority
 +--------------- build order
```

## Priority labels

| Label | Meaning |
| --- | --- |
| `p0` | Ships or the submission fails. Never cut |
| `p1` | Cuttable when behind schedule. Cut order is C10, then C9, then C8 |

## The rule

Code for checkpoint `CNN` goes **inside that checkpoint's folder**. A feature
folder holds its own components, hooks, logic and types.

- `src/components/ui/` is for primitives used by three or more features
- `src/lib/` is for cross-feature helpers only
- `app/` holds thin routes that import from a feature folder. No business
  logic in `app/`
- Do not create a new top-level folder, and do not rename, move or merge a
  feature folder
- If something genuinely belongs to two features, put it in `src/lib/` and
  note why under `## Notes` in `STATE.md`

Each folder's `README.md` is the authoritative spec for that step. Read it
before writing any code for that checkpoint.

## The folders

| Folder | Priority | Hours | Hands back |
| --- | --- | --- | --- |
| [`c00-p0-foundation`](./c00-p0-foundation/) | `p0` | 2 |  |
| [`c01-p0-auth-schema`](./c01-p0-auth-schema/) | `p0` | 2.5 | Yes |
| [`c02-p0-logger`](./c02-p0-logger/) | `p0` | 5 |  |
| [`c03-p0-status-engine`](./c03-p0-status-engine/) | `p0` | 4 | Yes |
| [`c04-p0-swap-engine`](./c04-p0-swap-engine/) | `p0` | 5 |  |
| [`c05-p0-reroute`](./c05-p0-reroute/) | `p0` | 3.5 |  |
| [`c06-p0-floor-map`](./c06-p0-floor-map/) | `p0` | 3 |  |
| [`c07-p0-simulator`](./c07-p0-simulator/) | `p0` | 2.5 |  |
| [`c08-p1-best-time`](./c08-p1-best-time/) | `p1` | 2.5 |  |
| [`c09-p1-equipment-reports`](./c09-p1-equipment-reports/) | `p1` | 1.5 |  |
| [`c10-p1-load-translation`](./c10-p1-load-translation/) | `p1` | 1.5 |  |
| [`c11-p0-polish`](./c11-p0-polish/) | `p0` | 3 | Yes |
