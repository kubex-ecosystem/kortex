#!/bin/bash

# Pulse Documentation Scripts
# Usage: ./docs-dev.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${2}${1}${NC}\n"
}

# Check if we're in the docs directory
if [ ! -f "mkdocs.yml" ]; then
    print_color "❌ Error: mkdocs.yml not found. Please run this script from the docs directory." "$RED"
    exit 1
fi

# Function to show usage
show_usage() {
    print_color "📚 Pulse Documentation Development Scripts" "$BLUE"
    echo ""
    print_color "Available commands:" "$YELLOW"
    echo "  serve    - Start development server (default: localhost:8000)"
    echo "  build    - Build static documentation"
    echo "  deploy   - Deploy to GitHub Pages"
    echo "  lint     - Check markdown files (if available)"
    echo "  clean    - Clean build artifacts"
    echo "  install  - Install/update dependencies"
    echo "  status   - Show project status"
    echo ""
    print_color "Examples:" "$YELLOW"
    echo "  ./docs-dev.sh serve"
    echo "  ./docs-dev.sh build"
    echo "  ./docs-dev.sh deploy"
}

# Function to check if virtual environment is activated
check_venv() {
    if [ -z "$VIRTUAL_ENV" ]; then
        print_color "🔄 Activating virtual environment..." "$YELLOW"
        source .venv/bin/activate
    fi
}

# Function to serve documentation
serve_docs() {
    check_venv
    print_color "🚀 Starting MkDocs development server..." "$GREEN"
    print_color "📍 Server will be available at: http://localhost:8000" "$BLUE"
    print_color "🔥 Live reload enabled - edit files and see changes instantly!" "$YELLOW"
    echo ""
    mkdocs serve
}

# Function to build documentation
build_docs() {
    check_venv
    print_color "🔨 Building documentation..." "$GREEN"
    mkdocs build
    print_color "✅ Documentation built successfully in 'site/' directory" "$GREEN"
}

# Function to deploy to GitHub Pages
deploy_docs() {
    check_venv
    print_color "🚀 Deploying to GitHub Pages..." "$GREEN"
    mkdocs gh-deploy
    print_color "✅ Documentation deployed to GitHub Pages" "$GREEN"
}

# Function to clean build artifacts
clean_docs() {
    print_color "🧹 Cleaning build artifacts..." "$YELLOW"
    rm -rf site/
    print_color "✅ Cleaned build artifacts" "$GREEN"
}

# Function to install dependencies
install_deps() {
    print_color "📦 Installing/updating dependencies..." "$GREEN"
    uv sync
    print_color "✅ Dependencies updated" "$GREEN"
}

# Function to show status
show_status() {
    print_color "📊 Pulse Documentation Status" "$BLUE"
    echo ""

    # Check if virtual environment exists
    if [ -d ".venv" ]; then
        print_color "✅ Virtual environment: .venv (exists)" "$GREEN"
    else
        print_color "❌ Virtual environment: Not found" "$RED"
    fi

    # Check if dependencies are installed
    check_venv
    if mkdocs --version > /dev/null 2>&1; then
        MKDOCS_VERSION=$(mkdocs --version | cut -d' ' -f3)
        print_color "✅ MkDocs: $MKDOCS_VERSION" "$GREEN"
    else
        print_color "❌ MkDocs: Not installed" "$RED"
    fi

    # Check configuration
    if [ -f "mkdocs.yml" ]; then
        print_color "✅ Configuration: mkdocs.yml (exists)" "$GREEN"
    else
        print_color "❌ Configuration: mkdocs.yml (missing)" "$RED"
    fi

    # Count documentation files
    MD_FILES=$(find . -name "*.md" -not -path "./.venv/*" | wc -l)
    print_color "📄 Markdown files: $MD_FILES" "$BLUE"

    # Check if site is built
    if [ -d "site" ]; then
        SITE_SIZE=$(du -sh site | cut -f1)
        print_color "🏗️  Built site: $SITE_SIZE" "$BLUE"
    else
        print_color "🏗️  Built site: Not built" "$YELLOW"
    fi
}

# Main script logic
case "${1:-serve}" in
    "serve"|"s")
        serve_docs
        ;;
    "build"|"b")
        build_docs
        ;;
    "deploy"|"d")
        deploy_docs
        ;;
    "clean"|"c")
        clean_docs
        ;;
    "install"|"i")
        install_deps
        ;;
    "status"|"st")
        show_status
        ;;
    "help"|"h"|"--help")
        show_usage
        ;;
    *)
        print_color "❌ Unknown command: $1" "$RED"
        echo ""
        show_usage
        exit 1
        ;;
esac
