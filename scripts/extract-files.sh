#!/bin/bash

# Script para extrair arquivos usando marcadores únicos v3.0
# Formato: /// caminho/arquivo ///
# Criado pelo sistema LookAtni
# Uso: ./extract-files.sh codigo.txt [diretorio_destino] [opcoes]

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções auxiliares
print_help() {
    echo "🚀 LookAtni File Extractor v3.0 - The Magic Code Decomposer"
    echo "============================================================"
    echo "Uso: $0 <arquivo_codigo> [diretorio_destino] [opcoes]"
    echo ""
    echo "Parâmetros:"
    echo "  arquivo_codigo    : Arquivo com código marcado (obrigatório)"
    echo "  diretorio_destino : Onde extrair os arquivos (padrão: ./extracted)"
    echo ""
    echo "Opções:"
    echo "  -i, --interactive : Modo interativo (confirma cada arquivo)"
    echo "  -v, --verbose     : Saída detalhada"
    echo "  -d, --dry-run     : Simula extração sem criar arquivos"
    echo "  -s, --stats       : Mostra estatísticas detalhadas"
    echo "  -f, --format      : Valida formato dos marcadores"
    echo "  -h, --help        : Esta ajuda"
    echo ""
    echo "Formato de marcadores: /// caminho/arquivo ///"
    echo ""
    echo "Exemplos:"
    echo "  $0 lookatni-code.txt ./meu-projeto"
    echo "  $0 codigo.txt ./src --interactive"
    echo "  $0 projeto.txt ./destino --dry-run --stats"
    echo ""
    echo "💡 Dicas:"
    echo "  • Use --dry-run para testar antes de extrair"
    echo "  • Use --interactive para controle total"
    echo "  • Use --stats para análise detalhada"
}

validate_markers() {
    local arquivo="$1"
    local errors=0
    
    echo "🔍 Validando formato dos marcadores..."
    
    # Verificar marcadores mal formados
    malformed=$(grep "^///" "$arquivo" | grep -v "^/// .* ///$" | wc -l)
    if [ "$malformed" -gt 0 ]; then
        echo -e "${RED}❌ $malformed marcador(es) mal formado(s) encontrado(s)${NC}"
        echo "Marcadores problemáticos:"
        grep "^///" "$arquivo" | grep -v "^/// .* ///$" | head -5
        ((errors++))
    fi
    
    # Verificar duplicatas
    duplicates=$(grep "^///" "$arquivo" | sort | uniq -d | wc -l)
    if [ "$duplicates" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $duplicates arquivo(s) duplicado(s) encontrado(s)${NC}"
        echo "Arquivos duplicados:"
        grep "^///" "$arquivo" | sed 's/^\/\/m\/ \(.*\) \/m\/\/$/\1/' | sort | uniq -d
        ((errors++))
    fi
    
    # Verificar caminhos suspeitos
    suspicious=$(grep "^///" "$arquivo" | grep -E "(\.\.\/|\/\.\.\/|^\/)" | wc -l)
    if [ "$suspicious" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $suspicious caminho(s) suspeito(s) encontrado(s)${NC}"
        echo "Caminhos suspeitos:"
        grep "^///" "$arquivo" | grep -E "(\.\.\/|\/\.\.\/|^\/)" | head -3
    fi
    
    return $errors
}

# Variáveis de controle
INTERACTIVE=false
VERBOSE=false
DRY_RUN=false
SHOW_STATS=false
VALIDATE_FORMAT=false

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -s|--stats)
            SHOW_STATS=true
            shift
            ;;
        -f|--format)
            VALIDATE_FORMAT=true
            shift
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        -*)
            echo "❌ Opção desconhecida: $1"
            echo "Use --help para ajuda"
            exit 1
            ;;
        *)
            if [ -z "$CODIGO_FILE" ]; then
                CODIGO_FILE="$1"
            elif [ -z "$DEST_DIR" ]; then
                DEST_DIR="$1"
            else
                echo "❌ Muitos argumentos!"
                exit 1
            fi
            shift
            ;;
    esac
done

# Verificar se arquivo foi especificado
if [ -z "$CODIGO_FILE" ]; then
    print_help
    exit 1
fi

# Definir destino padrão
DEST_DIR="${DEST_DIR:-./extracted}"

echo -e "${CYAN}🚀 LookAtni File Extractor v3.0${NC}"
echo -e "${CYAN}Usando marcadores únicos: /// arquivo ///${NC}"
echo "================================"

# Verificar se o arquivo fonte existe
if [ ! -f "$CODIGO_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo '$CODIGO_FILE' não encontrado!${NC}"
    echo -e "${YELLOW}💡 Verifique se o caminho está correto${NC}"
    exit 1
fi

# Validar formato se solicitado
if [ "$VALIDATE_FORMAT" = true ]; then
    if validate_markers "$CODIGO_FILE"; then
        echo -e "${GREEN}✅ Formato dos marcadores válido!${NC}"
    else
        echo -e "${RED}❌ Problemas encontrados no formato dos marcadores${NC}"
        exit 1
    fi
fi

# Verificar se contém marcadores novos
marcadores_count=$(grep -c "^///" "$CODIGO_FILE")
if [ "$marcadores_count" -eq 0 ]; then
    echo -e "${RED}❌ Erro: Nenhum marcador /// encontrado no arquivo!${NC}"
    echo -e "${YELLOW}💡 Verifique se o arquivo está no formato: /// caminho/arquivo ///${NC}"
    
    # Verificar se ainda tem marcadores antigos
    old_markers=$(grep -c "^//===" "$CODIGO_FILE" 2>/dev/null || echo "0")
    if [ "$old_markers" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Encontrados $old_markers marcadores antigos (//===)${NC}"
        echo -e "${YELLOW}💡 Este script usa o novo formato: /// arquivo ///${NC}"
        echo -e "${YELLOW}💡 Você precisa do código com os novos marcadores!${NC}"
    fi
    exit 1
fi

echo -e "${BLUE}📖 Arquivo fonte: $CODIGO_FILE${NC}"
echo -e "${BLUE}📁 Destino: $DEST_DIR${NC}"
echo -e "${BLUE}🔍 Marcadores encontrados: $marcadores_count${NC}"

# Modo dry-run
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 MODO SIMULAÇÃO - Nenhum arquivo será criado${NC}"
fi

# Limpar diretório de destino se existir (apenas se não for dry-run)
if [ "$DRY_RUN" = false ] && [ -d "$DEST_DIR" ]; then
    echo -e "${YELLOW}🧹 Limpando diretório existente: $DEST_DIR${NC}"
    rm -rf "$DEST_DIR"
fi

echo ""

# Extrair lista de arquivos com novo padrão (usando mapfile para evitar warning)
echo -e "${PURPLE}📁 Arquivos a serem extraídos:${NC}"
mapfile -t arquivos < <(grep "^///" "$CODIGO_FILE" | sed 's/^\/\/m\/ \(.*\) \/m\/\/$/\1/')

# Estatísticas iniciais
total_arquivos=${#arquivos[@]}
total_size=$(wc -c < "$CODIGO_FILE")

for i in "${!arquivos[@]}"; do
    arquivo="${arquivos[$i]}"
    if [ "$VERBOSE" = true ]; then
        printf "  %2d. %s\n" $((i+1)) "$arquivo"
    else
        printf "  %2d. %s\n" $((i+1)) "$arquivo"
    fi
done

echo ""

# Confirmação interativa
if [ "$INTERACTIVE" = true ]; then
    echo -e "${CYAN}🤔 Modo interativo ativado${NC}"
    read -p "Deseja continuar com a extração? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada pelo usuário."
        exit 0
    fi
fi

echo -e "${GREEN}🚀 Iniciando extração de $total_arquivos arquivo(s)...${NC}"
echo ""

sucesso=0
erro=0
bytes_extraidos=0
start_time=$(date +%s)

# Extrair cada arquivo
for i in "${!arquivos[@]}"; do
    arquivo="${arquivos[$i]}"
    proximo_arquivo="${arquivos[$((i+1))]}"
    
    printf "[%2d/%2d] 📄 %s\n" $((i+1)) "$total_arquivos" "$arquivo"
    
    # Confirmação interativa por arquivo
    if [ "$INTERACTIVE" = true ]; then
        read -p "  Extrair este arquivo? (s/N/a=todos): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Aa]$ ]]; then
            INTERACTIVE=false # Desabilita modo interativo
        elif [[ ! $REPLY =~ ^[Ss]$ ]]; then
            echo -e "        ${YELLOW}⏭️  Pulando arquivo${NC}"
            continue
        fi
    fi
    
    # Criar diretório do arquivo (incluindo para arquivos na raiz)
    arquivo_dir="$(dirname "$arquivo")"
    if [ "$arquivo_dir" != "." ]; then
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$DEST_DIR/$arquivo_dir"
        fi
        if [ "$VERBOSE" = true ]; then
            echo -e "        ${BLUE}📂 Criando diretório: $DEST_DIR/$arquivo_dir${NC}"
        fi
    else
        # Arquivo na raiz - garantir que o diretório destino existe
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$DEST_DIR"
        fi
    fi
    
    # Definir arquivo de saída completo
    arquivo_saida="$DEST_DIR/$arquivo"
    
    # Usar awk para extração mais robusta
    if [ -n "$proximo_arquivo" ]; then
        # Não é o último arquivo - extrair até o próximo marcador
        if [ "$DRY_RUN" = false ]; then
            awk -v start="/// $arquivo ///" -v end="/// $proximo_arquivo ///" '
                $0 == start { found=1; next }
                found && $0 == end { found=0; exit }
                found { print }
            ' "$CODIGO_FILE" > "$arquivo_saida"
        else
            # Simular extração
            conteudo=$(awk -v start="/// $arquivo ///" -v end="/// $proximo_arquivo ///" '
                $0 == start { found=1; next }
                found && $0 == end { found=0; exit }
                found { print }
            ' "$CODIGO_FILE")
        fi
    else
        # É o último arquivo - extrair até o final
        if [ "$DRY_RUN" = false ]; then
            awk -v start="/// $arquivo ///" '
                $0 == start { found=1; next }
                found { print }
            ' "$CODIGO_FILE" > "$arquivo_saida"
        else
            # Simular extração
            conteudo=$(awk -v start="/// $arquivo ///" '
                $0 == start { found=1; next }
                found { print }
            ' "$CODIGO_FILE")
        fi
    fi
    
    # Verificar se o arquivo foi criado com sucesso
    if [ "$DRY_RUN" = true ]; then
        # Modo simulação - calcular estatísticas do conteúdo
        if [ -n "$conteudo" ]; then
            linhas=$(echo "$conteudo" | wc -l)
            bytes=$(echo "$conteudo" | wc -c)
            printf "        ${GREEN}✅ Simulação OK (%d linhas, %d bytes)${NC}\n" "$linhas" "$bytes"
            ((sucesso++))
            ((bytes_extraidos += bytes))
        else
            printf "        ${RED}❌ Simulação: Arquivo vazio ou não encontrado${NC}\n"
            ((erro++))
        fi
    elif [ -f "$arquivo_saida" ] && [ -s "$arquivo_saida" ]; then
        linhas=$(wc -l < "$arquivo_saida")
        bytes=$(wc -c < "$arquivo_saida")
        printf "        ${GREEN}✅ Sucesso (%d linhas, %d bytes)${NC}\n" "$linhas" "$bytes"
        ((sucesso++))
        ((bytes_extraidos += bytes))
    else
        printf "        ${RED}❌ Erro: Arquivo vazio ou não criado${NC}\n"
        ((erro++))
    fi
done

echo ""
end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "${CYAN}🎉 Extração concluída em ${duration}s!${NC}"
echo "================================"
echo -e "${PURPLE}📊 Resumo:${NC}"
echo -e "  • ${BLUE}Arquivo fonte: $CODIGO_FILE${NC}"
echo -e "  • ${BLUE}Destino: $DEST_DIR${NC}"
echo -e "  • ${GREEN}✅ Sucessos: $sucesso${NC}"
echo -e "  • ${RED}❌ Erros: $erro${NC}"
echo -e "  • ${PURPLE}📁 Total: $total_arquivos arquivos${NC}"
echo -e "  • ${CYAN}💾 Bytes extraídos: $bytes_extraidos${NC}"
echo -e "  • ${YELLOW}⏱️  Tempo: ${duration}s${NC}"

# Estatísticas detalhadas
if [ "$SHOW_STATS" = true ]; then
    echo ""
    echo -e "${CYAN}📈 Estatísticas Detalhadas:${NC}"
    echo "================================"
    
    if [ "$DRY_RUN" = false ] && [ "$sucesso" -gt 0 ]; then
        echo -e "${GREEN}🔍 Análise de arquivos criados:${NC}"
        
        # Arquivos por extensão
        echo -e "\n${BLUE}📋 Arquivos por extensão:${NC}"
        find "$DEST_DIR" -type f -name "*.*" | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10
        
        # Maiores arquivos
        echo -e "\n${BLUE}📏 Maiores arquivos:${NC}"
        find "$DEST_DIR" -type f -exec ls -la {} \; | sort -k5 -nr | head -5 | awk '{print $5, $9}'
        
        # Estrutura de diretórios
        echo -e "\n${BLUE}🌳 Estrutura de diretórios:${NC}"
        if command -v tree >/dev/null 2>&1; then
            tree "$DEST_DIR" -L 3
        else
            find "$DEST_DIR" -type d | sort | head -10
        fi
    fi
    
    # Estatísticas do arquivo fonte
    echo -e "\n${BLUE}📄 Estatísticas do arquivo fonte:${NC}"
    echo "  • Tamanho: $(wc -c < "$CODIGO_FILE") bytes"
    echo "  • Linhas: $(wc -l < "$CODIGO_FILE")"
    echo "  • Marcadores: $marcadores_count"
    echo "  • Eficiência: $(( (bytes_extraidos * 100) / total_size ))% do arquivo original"
fi

echo ""

if [ "$DRY_RUN" = false ] && [ "$sucesso" -gt 0 ]; then
    echo -e "${GREEN}🔍 Arquivos extraídos:${NC}"
    find "$DEST_DIR" -type f | sort | head -10
    total_files=$(find "$DEST_DIR" -type f | wc -l)
    if [ "$total_files" -gt 10 ]; then
        echo "  ... e mais $(( total_files - 10 )) arquivo(s)"
    fi
    echo ""
    echo -e "${CYAN}🚀 Para usar o projeto:${NC}"
    echo -e "  ${YELLOW}cd $DEST_DIR${NC}"
    echo -e "  ${YELLOW}npm install${NC}"
    echo -e "  ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${CYAN}🔧 Para extrair novamente:${NC}"
    echo -e "  ${YELLOW}./extract-files.sh $CODIGO_FILE ./novo-destino${NC}"
fi

if [ "$erro" -gt 0 ]; then
    echo ""
    echo -e "${RED}⚠️  Alguns arquivos não foram extraídos corretamente.${NC}"
    echo -e "${YELLOW}💡 Verifique se os marcadores estão no formato: /// caminho/arquivo ///${NC}"
    echo -e "${YELLOW}💡 Use --format para validar os marcadores${NC}"
fi

echo ""
echo -e "${PURPLE}💡 Comandos úteis:${NC}"
echo -e "  ${YELLOW}# Listar marcadores:${NC}"
echo -e "  grep '^///' $CODIGO_FILE"
echo -e "  ${YELLOW}# Buscar arquivo específico:${NC}"
echo -e "  grep '^/// src/App.tsx ///' $CODIGO_FILE -A 20"
echo -e "  ${YELLOW}# Contar marcadores:${NC}"
echo -e "  grep '^///' $CODIGO_FILE | wc -l"
echo -e "  ${YELLOW}# Verificar formato:${NC}"
echo -e "  ./extract-files.sh $CODIGO_FILE --format"
echo -e "  ${YELLOW}# Modo simulação:${NC}"
echo -e "  ./extract-files.sh $CODIGO_FILE ./destino --dry-run --stats"

# Códigos de saída
if [ "$erro" -gt 0 ]; then
    exit 1
else
    exit 0
fi