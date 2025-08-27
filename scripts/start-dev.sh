#!/bin/bash
set -euo pipefail

# Configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly DEFAULT_PORT=3000
readonly KILL_TIMEOUT=3

# Function to log messages
log() {
    echo "[$SCRIPT_NAME] $*" >&2
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    local port="$1"
    
    if command_exists ss; then
        # Use word boundaries to prevent matching longer ports (e.g., :30000 when looking for :3000)
        ss -tulpn 2>/dev/null | grep -q ":${port}[[:space:]]"
    elif command_exists lsof; then
        lsof -i ":${port}" > /dev/null 2>&1
    elif command_exists netstat; then
        netstat -tuln 2>/dev/null | grep -q ":${port}[[:space:]]"
    else
        log "Warning: No port checking tools available (ss, lsof, netstat)"
        return 0  # Assume port is in use to be safe
    fi
}

# Function to validate PID
is_valid_pid() {
    local pid="$1"
    [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null
}

# Function to gracefully terminate a process
terminate_process() {
    local pid="$1"
    
    if ! is_valid_pid "$pid"; then
        log "Invalid or non-existent PID: $pid"
        return 1
    fi
    
    log "Attempting graceful termination of PID $pid..."
    if kill -TERM "$pid" 2>/dev/null; then
        # Wait for graceful shutdown
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt "$KILL_TIMEOUT" ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # If process still exists, force kill
        if kill -0 "$pid" 2>/dev/null; then
            log "Process $pid didn't respond to SIGTERM, force killing..."
            kill -KILL "$pid" 2>/dev/null || {
                log "Failed to kill PID $pid"
                return 1
            }
        else
            log "Process $pid terminated gracefully"
        fi
    else
        log "Failed to send SIGTERM to PID $pid"
        return 1
    fi
}

# Function to try to free a port
free_port() {
    local port="$1"
    local pids=()
    
    # Get PIDs using the port
    if command_exists ss; then
        mapfile -t pids < <(ss -tulpn | grep ":${port}[[:space:]]" | grep -o 'pid=[0-9]*' | cut -d'=' -f2)
    elif command_exists lsof; then
        mapfile -t pids < <(lsof -ti ":${port}" 2>/dev/null || true)
    else
        log "Error: No tools available to find processes using port $port"
        return 1
    fi
    
    if [ ${#pids[@]} -eq 0 ]; then
        log "No processes found using port $port"
        return 0
    fi
    
    log "Found ${#pids[@]} process(es) using port $port: ${pids[*]}"
    
    local failed_kills=0
    for pid in "${pids[@]}"; do
        if [[ -n "$pid" ]]; then
            if ! terminate_process "$pid"; then
                failed_kills=$((failed_kills + 1))
            fi
        fi
    done
    
    # Verify port is now free
    if port_in_use "$port"; then
        log "Error: Port $port is still in use after killing processes"
        return 1
    else
        log "Successfully freed port $port"
        if [ $failed_kills -gt 0 ]; then
            log "Warning: $failed_kills process(es) failed to terminate cleanly"
        fi
        return 0
    fi
}

# Function to display usage
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Start Next.js development server, automatically killing any processes using port $DEFAULT_PORT

Options:
  -p, --port PORT    Use specific port (default: $DEFAULT_PORT)
  -h, --help         Show this help message
  -v, --verbose      Enable verbose logging

Examples:
  $SCRIPT_NAME                 # Start on port $DEFAULT_PORT
  $SCRIPT_NAME -p 3001         # Start on port 3001
  $SCRIPT_NAME --verbose       # Start with verbose logging

EOF
}

# Parse command line arguments
main() {
    local port="$DEFAULT_PORT"
    local verbose=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]]; then
                    port="$2"
                    shift 2
                else
                    log "Error: --port requires a valid numeric argument"
                    usage
                    exit 1
                fi
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            *)
                log "Error: Unknown option '$1'"
                usage
                exit 1
                ;;
        esac
    done
    
    if [[ "$verbose" == true ]]; then
        set -x
    fi
    
    # Validate port range
    if [[ "$port" -lt 1024 || "$port" -gt 65535 ]]; then
        log "Error: Port must be between 1024 and 65535"
        exit 1
    fi
    
    log "Starting Next.js development server on port $port"
    
    # Check if the port is in use and free it if necessary
    if port_in_use "$port"; then
        log "Port $port is in use. Attempting to free it..."
        if ! free_port "$port"; then
            log "Error: Failed to free port $port"
            exit 1
        fi
    else
        log "Port $port is available"
    fi
    
    # Start the Next.js development server
    log "Starting development server..."
    if ! PORT="$port" npm run dev; then
        log "Error: Failed to start development server"
        exit 1
    fi
}

# Trap to handle cleanup on script exit
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log "Script exited with error code $exit_code"
    fi
    exit $exit_code
}

trap cleanup EXIT

# Run main function with all arguments
main "$@"
