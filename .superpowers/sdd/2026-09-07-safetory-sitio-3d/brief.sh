#!/bin/bash
# Extrae el brief de la tarea N: cabecera del plan (objetivo, stack, restricciones
# globales, spec) + el texto integro de la tarea. El script de la skill espera
# cabeceras "Task N" en ingles; este plan usa "Tarea N".
set -e
N="$1"
P="docs/superpowers/plans/2026-09-07-safetory-sitio-3d.md"
W=".superpowers/sdd/2026-09-07-safetory-sitio-3d"
OUT="$W/task-$N-brief.md"
{
  awk '/^# FASE 0/{exit} {print}' "$P"
  echo
  echo "---"
  echo
  awk -v n="$N" '
    $0 ~ ("^## Tarea " n ":") {p=1; print; next}
    p && /^## / {exit}
    p {print}
  ' "$P"
} > "$OUT"
echo "$OUT"
