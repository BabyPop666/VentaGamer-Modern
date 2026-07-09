#!/usr/bin/env bash
# Levanta VentaGamer completo en Docker (BD + Ollama + backend + frontend).
# Uso: ./levantar.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEFAULT_OLLAMA_MODEL="qwen2.5:3b"
OLLAMA_MODEL="${DEFAULT_OLLAMA_MODEL}"

info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
error() { echo -e "${RED}==>${NC} $*" >&2; }

docker_ok() {
  docker info &>/dev/null
}

compose() {
  if docker_ok; then
    docker compose "$@"
  else
    warn "Sin permisos de Docker. Se usará sudo (te pedirá contraseña)..."
    sudo docker compose "$@"
  fi
}

docker_exec() {
  if docker_ok; then
    docker exec "$@"
  else
    sudo docker exec "$@"
  fi
}

load_env() {
  if [[ -f .env ]]; then
    # shellcheck disable=SC1091
    set -a
    source .env
    set +a
  fi
  OLLAMA_MODEL="${OLLAMA_MODEL:-${DEFAULT_OLLAMA_MODEL}}"
}

setup_ollama_model() {
  info "Configurando Ollama (modelo: ${OLLAMA_MODEL})..."

  local retries=30
  until docker_exec ventagamer-ollama ollama list &>/dev/null; do
    retries=$((retries - 1))
    if (( retries <= 0 )); then
      error "Ollama no respondió a tiempo."
      exit 1
    fi
    sleep 2
  done

  if docker_exec ventagamer-ollama ollama show "${OLLAMA_MODEL}" &>/dev/null; then
    info "Modelo ${OLLAMA_MODEL} ya está instalado."
    return
  fi

  warn "Descargando ${OLLAMA_MODEL} (~2 GB, puede tardar varios minutos)..."
  docker_exec ventagamer-ollama ollama pull "${OLLAMA_MODEL}"
  info "Modelo ${OLLAMA_MODEL} listo."
}

if ! command -v docker &>/dev/null; then
  error "Docker no está instalado. Ejecutá primero: ./setup-docker.sh"
  exit 1
fi

if ! docker_ok; then
  if ! groups | grep -qw docker; then
    warn "Tu usuario no está en el grupo 'docker'."
    warn "Recomendado (una sola vez): ./setup-docker.sh"
    echo ""
  fi
fi

load_env

if [[ ! -f .env ]]; then
  info "Creando .env con valores de desarrollo..."
  cat > .env <<EOF
MSSQL_SA_PASSWORD=VentaGamer2024!
JWT_SIGNING_KEY=CHANGE_ME_dev-only-32-character-key-please
OLLAMA_MODEL=${DEFAULT_OLLAMA_MODEL}
EOF
  load_env
fi

info "Construyendo e iniciando contenedores (puede tardar varios minutos la primera vez)..."
compose up -d --build --wait

setup_ollama_model

echo ""
info "VentaGamer está online:"
echo "  Frontend:   http://localhost:8080"
echo "  Swagger:    http://localhost:5050/swagger"
echo "  API health: http://localhost:5050/api/health"
echo "  Ollama:     http://localhost:11434  (modelo: ${OLLAMA_MODEL})"
echo ""
echo "Usuarios demo:"
echo "  admin     / Admin123!      (Admin — config IA + productos)"
echo "  cliente   / Cliente123!    (User — comprar + chat GG)"
echo "  webmaster / WebMaster123!  (WebMaster)"
echo ""
info "El asistente GG debería aparecer como 'online' tras iniciar sesión."
info "Para ver logs: docker compose logs -f"
info "Para detener:  docker compose down"
