#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2034,SC1091

_workspace_root_path='/srv/apps/LIFE/KUBEX'

start_kosmos_sse() {
  local _kosmos_root_path="${_workspace_root_path}/kbx_kosmos"
  cd "${_kosmos_root_path}" || return 1
  source "${_kosmos_root_path}/.venv/bin/activate"
  uv run --env-file ${_kosmos_root_path}/kbx_kosmos/.env ${_kosmos_root_path}/kbx_kosmos/server.py | tee "${_workspace_root_path}/playground/kosmos_sse.log"
}

start_kosmos_api() {
  local _kosmos_root_path="${_workspace_root_path}/kbx_kosmos"
  cd "${_kosmos_root_path}" || return 1
  source "${_kosmos_root_path}/.venv/bin/activate"
  uv run --env-file ${_kosmos_root_path}/kbx_kosmos/.env ${_kosmos_root_path}/kbx_kosmos/api_server.py | tee "${_workspace_root_path}/playground/kosmos_api.log"
}

start_synex() {
  local _synex_root_path="${_workspace_root_path}/kbx_synex"
  cd "${_synex_root_path}" || return 1
  source "${_synex_root_path}/.venv/bin/activate"
  uv run ${_synex_root_path}/kbx_synex/main.py | tee "${_workspace_root_path}/playground/synex.log"
}

start_kortex() {
  local _kortex_root_path="${_workspace_root_path}/kortex"
  cd "${_kortex_root_path}" || return 1
  npm run dev | tee "${_workspace_root_path}/playground/kortex.log"
}

main() {
  case "$1" in
    kosmos-sse)
      start_kosmos_sse
      ;;
    kosmos-api)
      start_kosmos_api
      ;;
    kosmos)
      echo "Starting only Kosmos servers..."
      start_kosmos_sse & _kosmos_sse_pid=$!
      sleep 1  # Ensure kosmos-sse starts before kosmos-api
      start_kosmos_api & _kosmos_api_pid=$!

      echo "Kosmos servers started with: "
      echo "Kosmos SSE PID: $_kosmos_sse_pid"
      echo "Kosmos API PID: $_kosmos_api_pid"

      wait "$_kosmos_sse_pid" "$_kosmos_api_pid" || {
        echo "One or more Kosmos components failed to start."
        exit 1
      }
      ;;
    synex)
      start_synex
      ;;
    kortex)
      start_kortex
      ;;
    mcp)
      echo "Starting only MCP servers..."
      start_kosmos_sse & _kosmos_sse_pid=$!
      sleep 1  # Ensure kosmos-sse starts before kosmos-api
      start_kosmos_api & _kosmos_api_pid=$!
      sleep 1  # Ensure kosmos-api starts before synex
      start_synex & _synex_pid=$!
      sleep 1  # Ensure synex starts before kortex

      echo "MCP servers started with: "
      echo "Kosmos SSE PID: $_kosmos_sse_pid"
      echo "Kosmos API PID: $_kosmos_api_pid"
      echo "Synex PID: $_synex_pid"

      wait "$_kosmos_sse_pid" "$_kosmos_api_pid" "$_synex_pid" || {
        echo "One or more MCP components failed to start."
        exit 1
      }
      ;;
    kubex|a|all|-a|--all)
      echo "Starting KUBEX..."
      start_kosmos_sse & _kosmos_sse_pid=$!
      sleep 1  # Ensure kosmos-sse starts before kosmos-api
      start_kosmos_api & _kosmos_api_pid=$!
      sleep 1  # Ensure kosmos-api starts before synex
      start_synex & _synex_pid=$!
      sleep 1  # Ensure synex starts before kortex
      start_kortex & _kortex_pid=$!
      sleep 1  # Ensure kortex starts before all

      echo "All components started successfully."
      echo "KUBEX started with: "
      echo "Kosmos SSE PID: $_kosmos_sse_pid"
      echo "Kosmos API PID: $_kosmos_api_pid"
      echo "Synex PID: $_synex_pid"
      echo "Kortex PID: $_kortex_pid"

      wait "$_kosmos_sse_pid" "$_kosmos_api_pid" "$_synex_pid" "$_kortex_pid" || {
        echo "One or more components failed to start."
        exit 1
      }

      echo "KUBEX has stopped."
      exit 0
      
      ;;
    *)
      echo "Usage: $0 {kosmos-sse|kosmos-api|synex|kortex|kubex}"
      exit 1
      ;;
  esac
}

main "$@"