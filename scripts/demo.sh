#!/bin/bash

echo "🎯 Demonstração LookAtni - A Revolução dos Marcadores!"
echo "======================================================"
echo ""

# Criar exemplo simples
cat > demo-code.txt << 'EOF'
# LookAtni Demo Code

/// hello.js ///
console.log('Hello, LookAtni!');
console.log('Sistema de marcadores únicos funcionando!');

/// style.css ///
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
    text-align: center;
}

/// README.md ///
# LookAtni Demo

Este é um exemplo do sistema LookAtni em ação!

## Arquivos incluídos:
- hello.js - Script JavaScript
- style.css - Folha de estilos
- README.md - Este arquivo

## Como usar:
```bash
./extract-files.sh demo-code.txt ./demo-extracted
```

Incrível, não é? 🚀
EOF

echo "📄 Arquivo demo criado: demo-code.txt"
echo ""

echo "🔍 Marcadores encontrados:"
grep '^///' demo-code.txt
echo ""

echo "📤 Extraindo arquivos..."
./extract-files.sh demo-code.txt ./demo-extracted --stats
echo ""

echo "🗂️ Estrutura criada:"
tree ./demo-extracted 2>/dev/null || find ./demo-extracted -type f | sort
echo ""

echo "📖 Conteúdo dos arquivos:"
echo ""
echo "=== hello.js ==="
cat ./demo-extracted/hello.js
echo ""
echo "=== style.css ==="
cat ./demo-extracted/style.css
echo ""
echo "=== README.md ==="
cat ./demo-extracted/README.md
echo ""

echo "🎉 DEMO CONCLUÍDA - LookAtni funcionando perfeitamente!"
echo ""
echo "💡 Agora você pode usar o sistema em seus próprios projetos:"
echo "   ./generate-markers.sh ./meu-projeto meu-codigo.txt"
echo "   ./extract-files.sh meu-codigo.txt ./destino"
