#!/bin/bash

# Pulse Documentation Setup Script
# This script sets up the documentation environment using uv and starts the development server

set -e

echo "🚀 Setting up Pulse Documentation with uv..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 uv not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true

    # Check again
    if ! command -v uv &> /dev/null; then
        echo "❌ Failed to install uv. Please install manually:"
        echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
        echo "   or visit: https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi
fi

# Navigate to docs directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies with uv..."

# Initialize uv project and install dependencies
uv sync

echo "✅ Dependencies installed successfully!"

# Check if we should start the dev server
if [ "$1" = "--serve" ] || [ "$1" = "-s" ]; then
    echo "🌟 Starting development server..."
    echo "📖 Documentation will be available at: http://localhost:8000"
    echo "🔄 Changes will be automatically reloaded"
    echo ""
    echo "Press Ctrl+C to stop the server"
    uv run mkdocs serve
elif [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    echo "🏗️ Building documentation..."
    uv run mkdocs build
    echo "✅ Documentation built successfully in site/ directory"
else
    echo ""
    echo "🎉 Setup complete! Available commands:"
    echo ""
    echo "  🌟 Start development server:"
    echo "     ./setup.sh --serve"
    echo "     or: uv run mkdocs serve"
    echo ""
    echo "  🏗️ Build for production:"
    echo "     ./setup.sh --build"
    echo "     or: uv run mkdocs build"
    echo ""
    echo "  📖 Documentation will be available at: http://localhost:8000"
    echo ""
    echo "  ⚡ uv benefits:"
    echo "     • 10-100x faster than pip"
    echo "     • Better dependency resolution"
    echo "     • Automatic virtual environment management"
    echo ""
    echo "Happy documenting! 📚✨"
fi
