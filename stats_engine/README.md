# stats_engine

The **deterministic statistical engine** for which.stat. Plain Python built on
`scipy`. Same input → same output, every time. **No AI is ever involved in this
code** (see [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)).

This is the code you can read and validate yourself. The app runs these exact
files in the browser via Pyodide, but you don't need the browser to check them —
just run the tests below.

## Validate it

```bash
cd stats_engine
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
python -m pytest -v
```

The tests use tiny datasets whose expected values are **worked out by hand** in
the test file, so a pass means scipy agrees with the maths — not just with itself.

## What's here

- `two_group.py` — two-group tests. Currently: `independent_t_test`.
- `tests/test_two_group.py` — golden tests with hand-calculated expected values.

Method choice traces to Field, *Discovering Statistics* (SAGE); the computations
are scipy's, cross-checked against known values.
