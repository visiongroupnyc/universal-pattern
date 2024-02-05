# Testing.

Antes de iniciar el proceso de testing, es necesario lanzar el ejemplo incluido en el respositorio de Universal Pattern.

## Running

```bash
$ FLOW_NAME=login node test/
```

Output
```bash
flowname :  login
stepName :  undefined
▶ Testing flow login
  ▶ Login flow
    ▶ Login
      ✔ Login: invalid login (39.133241ms)
      ✔ Login: valid login (53.953458ms)
    ▶ Login (94.468905ms)

  ▶ Login flow (94.81223ms)

▶ Testing flow login (95.428758ms)

ℹ tests 3
ℹ suites 2
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 99.037487

```