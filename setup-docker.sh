#!/usr/bin/env bash
# Ejecutar UNA VEZ: permisos Docker + preparación LLM (Ollama).
# Uso: ./setup-docker.sh   (te pedirá la contraseña de sudo)

set -euo pipefail

DEFAULT_OLLAMA_MODEL="qwen2.5:3b"

if [[ "${EUID}" -eq 0 ]]; then
  TARGET_USER="${SUDO_USER:-u606098}"
else
  TARGET_USER="$(whoami)"
fi

echo "==> Habilitando servicio Docker..."
systemctl enable --now docker

echo "==> Agregando '${TARGET_USER}' al grupo docker..."
usermod -aG docker "${TARGET_USER}"

echo ""
echo "==> Preparando soporte LLM (Ollama en Docker)..."
echo "    Modelo por defecto: ${DEFAULT_OLLAMA_MODEL}"
echo "    (~2 GB, con tool-calling para el asistente GG)"
echo "    Se descarga automáticamente la primera vez que corras ./levantar.sh"

FREE_GB="$(df -BG --output=avail . 2>/dev/null | tail -1 | tr -d 'G ' || echo "?")"
if [[ "${FREE_GB}" != "?" ]] && (( FREE_GB < 5 )); then
  echo ""
  echo "AVISO: poco espacio en disco (${FREE_GB}G libres)."
  echo "       Recomendado: al menos 5 GB para imágenes Docker + modelo Ollama."
fi

if [[ ! -f .env ]]; then
  echo ""
  echo "==> Creando .env con valores de desarrollo..."
  cat > .env <<EOF
MSSQL_SA_PASSWORD=VentaGamer2024!
JWT_SIGNING_KEY=CHANGE_ME_dev-only-32-character-key-please
OLLAMA_MODEL=${DEFAULT_OLLAMA_MODEL}
EOF
elif ! grep -q '^OLLAMA_MODEL=' .env 2>/dev/null; then
  echo "OLLAMA_MODEL=${DEFAULT_OLLAMA_MODEL}" >> .env
  echo "==> Agregado OLLAMA_MODEL=${DEFAULT_OLLAMA_MODEL} a .env"
fi

echo ""
echo "Listo. Para aplicar el grupo docker sin cerrar sesión:"
echo "  newgrp docker"
echo ""
echo "Luego levantá todo (web + BD + API + Ollama) con:"
echo "  ./levantar.sh"
