# Target Patterns

A pattern picks targets on the target's party grid, relative to the primary target `T`. Grids are `rows × cols` per party: 3×4 by default, larger for some NPCs and raids. Empty or unhittable cells are skipped. The source of truth is `getPatternTargetIndices` in `src/utils/battleUtils.js`.

| Pattern           | Cells hit                                    |
| ----------------- | -------------------------------------------- |
| `SINGLE`          | `T` only                                     |
| `ROW`             | every cell in `T`'s row                      |
| `COLUMN`          | every cell in `T`'s column                   |
| `CROSS`           | `T` and its orthogonal neighbours            |
| `X`               | `T` and its diagonal neighbours              |
| `SQUARE`          | the 3×3 block centred on `T`                 |
| `ALL`             | every cell in the party                      |
| `ALL_EXCEPT_SELF` | every cell except `T`                        |
| `RANDOM`          | one random hittable Pokémon in the party     |

On a 3×4 grid with `T` at row 2, column 2:

```
CROSS          X              SQUARE
. x . .        x . x .        x x x .
x T x .        . T . .        x T x .
. x . .        x . x .        x x x .
```

The Spatial Blessing effect widens patterns one step (`SINGLE` becomes `CROSS`; `CROSS`, `X`, `ROW`, and `COLUMN` become `SQUARE`; `SQUARE` and `ALL_EXCEPT_SELF` become `ALL`), so a pattern can't be assumed fixed when testing target counts.
