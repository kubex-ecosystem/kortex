#!/bin/bash

# Script para extrair arquivos usando marcadores únicos v2.0
# Formato: /// caminho/arquivo ///
# Criado pelo sistema LookAtni
# Uso: ./extract-files.sh codigo.txt [diretorio_destino]

if [ $# -eq 0 ]; then
    echo "🚀 LookAtni File Extractor v2.0"
    echo "Uso: $0 <arquivo_codigo> [diretorio_destino]"
    echo "Exemplo: $0 codigo.txt ./extracted"
    echo ""
    echo "Formato de marcadores: /// caminho/arquivo ///"
    echo ""
    echo "Exemplos:"
    echo "  $0 lookatni-code.txt ./meu-projeto"
    echo "  $0 codigo.txt ./src"
    exit 1
fi

CODIGO_FILE="$1"
DEST_DIR="${2:-./extracted}"

echo "🚀 LookAtni File Extractor v2.0"
echo "Usando marcadores únicos: /// arquivo ///"
echo "================================"

# Verificar se o arquivo fonte existe
if [ ! -f "$CODIGO_FILE" ]; then
    echo "❌ Erro: Arquivo '$CODIGO_FILE' não encontrado!"
    echo "💡 Verifique se o caminho está correto"
    exit 1
fi

# Verificar se contém marcadores novos
marcadores_count=$(grep -c "^///" "$CODIGO_FILE")
if [ "$marcadores_count" -eq 0 ]; then
    echo "❌ Erro: Nenhum marcador /// encontrado no arquivo!"
    echo "💡 Verifique se o arquivo está no formato: /// caminho/arquivo ///"
    
    # Verificar se ainda tem marcadores antigos
    old_markers=$(grep -c "^//===" "$CODIGO_FILE" 2>/dev/null || echo "0")
    if [ "$old_markers" -gt 0 ]; then
        echo "⚠️  Encontrados $old_markers marcadores antigos (//===)"
        echo "💡 Este script usa o novo formato: /// arquivo ///"
        echo "💡 Você precisa do código com os novos marcadores!"
    fi
    exit 1
fi

echo "📖 Arquivo fonte: $CODIGO_FILE"
echo "📁 Destino: $DEST_DIR"
echo "🔍 Marcadores encontrados: $marcadores_count"

# Limpar diretório de destino se existir
if [ -d "$DEST_DIR" ]; then
    echo "🧹 Limpando diretório existente: $DEST_DIR"
    rm -rf "$DEST_DIR"
fi

echo ""

# Extrair lista de arquivos com novo padrão
echo "📁 Arquivos a serem extraídos:"
arquivos=($(grep "^///" "$CODIGO_FILE" | sed 's/^\/\/m\/ \(.*\) \/m\/\/$/\1/'))

for i in "${!arquivos[@]}"; do
    printf "  %2d. %s\n" $((i+1)) "${arquivos[$i]}"
done

echo ""
echo "🚀 Iniciando extração de ${#arquivos[@]} arquivo(s)..."
echo ""

sucesso=0
erro=0

# Extrair cada arquivo
for i in "${!arquivos[@]}"; do
    arquivo="${arquivos[$i]}"
    proximo_arquivo="${arquivos[$((i+1))]}"
    
    printf "[%2d/%2d] 📄 %s\n" $((i+1)) ${#arquivos[@]} "$arquivo"
    
    # Criar apenas o DIRETÓRIO do arquivo, não o arquivo como diretório
    arquivo_dir="$(dirname "$arquivo")"
    if [ "$arquivo_dir" != "." ]; then
        mkdir -p "$DEST_DIR/$arquivo_dir"
        echo "        📂 Criando diretório: $DEST_DIR/$arquivo_dir"
    fi
    
    # Escapar caracteres especiais para sed
    arquivo_escaped=$(printf '%s\n' "$arquivo" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    # Definir arquivo de saída completo
    arquivo_saida="$DEST_DIR/$arquivo"
    
    if [ -n "$proximo_arquivo" ]; then
        # Não é o último arquivo - extrair até o próximo marcador
        proximo_escaped=$(printf '%s\n' "$proximo_arquivo" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -n "/^\/\/m\/ ${arquivo_escaped} \/m\/\/$/,/^\/\/m\/ ${proximo_escaped} \/m\/\/$/p" "$CODIGO_FILE" | \
        sed '1d;$d' > "$arquivo_saida"
    else
        # É o último arquivo - extrair até o final
        sed -n "/^\/\/m\/ ${arquivo_escaped} \/m\/\/$/,\$p" "$CODIGO_FILE" | \
        sed '1d' > "$arquivo_saida"
    fi
    
    # Verificar se o arquivo foi criado com sucesso
    if [ -f "$arquivo_saida" ] && [ -s "$arquivo_saida" ]; then
        linhas=$(wc -l < "$arquivo_saida")
        bytes=$(wc -c < "$arquivo_saida")
        printf "        ✅ Sucesso (%d linhas, %d bytes)\n" "$linhas" "$bytes"
        ((sucesso++))
    else
        printf "        ❌ Erro: Arquivo vazio ou não criado\n"
        ((erro++))
    fi
done

echo ""
echo "🎉 Extração concluída!"
echo "================================"
echo "📊 Resumo:"
echo "  • Arquivo fonte: $CODIGO_FILE"
echo "  • Destino: $DEST_DIR"
echo "  • ✅ Sucessos: $sucesso"
echo "  • ❌ Erros: $erro"
echo "  • 📁 Total: ${#arquivos[@]} arquivos"
echo ""

if [ "$sucesso" -gt 0 ]; then
    echo "🔍 Arquivos extraídos:"
    find "$DEST_DIR" -type f | sort | head -50
    total_files=$(find "$DEST_DIR" -type f | wc -l)
    if [ "$total_files" -gt 10 ]; then
        echo "  ... e mais $(( total_files - 10 )) arquivo(s)"
    fi
    echo ""
    echo "🚀 Para usar o projeto:"
    echo "  cd $DEST_DIR"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "🔧 Para extrair novamente:"
    echo "  ./extract-files.sh codigo.txt ./novo-destino"
fi

if [ "$erro" -gt 0 ]; then
    echo ""
    echo "⚠️  Alguns arquivos não foram extraídos corretamente."
    echo "💡 Verifique se os marcadores estão no formato: /// caminho/arquivo ///"
fi

echo ""
echo "💡 Comandos úteis:"
echo "  # Listar marcadores:"
echo "  grep '^///' codigo.txt"
echo "  # Buscar arquivo específico:"
echo "  grep '^/// src/App.tsx ///' codigo.txt -A 20"
echo "  # Contar marcadores:"
echo "  grep '^///' codigo.txt | wc -l"
echo "  # Verificar formato:"
echo "  grep '^///' codigo.txt | head -3"