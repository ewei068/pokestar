# Target Patterns

Target patterns determine which Pokemon are affected by a move based on the selected target's position.

## Pattern Reference

| Pattern  | Targets | Description                  |
| -------- | ------- | ---------------------------- |
| `SINGLE` | 1       | One target only              |
| `ROW`    | 3       | A horizontal row             |
| `COLUMN` | 2       | A vertical column            |
| `SQUARE` | 4       | 3x3 area around target       |
| `CROSS`  | 5       | + shape (target + adjacent)  |
| `X`      | 5       | X shape (target + diagonals) |
| `ALL`    | 6       | All positions                |
| `RANDOM` | 1       | Random single target         |

## Visual Reference

```
Battlefield Layout (each team):
  [0] [1] [2]  <- Front row
  [3] [4] [5]  <- Back row

ROW:
  [X] [O] [X]
  [ ] [ ] [ ]

COLUMN:
  [ ] [O] [ ]
  [ ] [X] [ ]

SQUARE:
  [X] [O] [X]
  [X] [X] [X]

CROSS:
  [X] [O] [X]
  [ ] [X] [ ]

X:
  [X] [ ] [X]
  [ ] [O] [ ]
```

## Usage

```javascript
targetPattern: targetPatterns.SQUARE,
```
