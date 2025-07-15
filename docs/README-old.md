# 🚀 LookAtni File System v3.0

## A Revolução na Entrega de Código

O **LookAtni** é um sistema revolucionário de marcadores únicos que resolve um dos maiores problemas na entrega de código: como facilitar a separação automática de arquivos múltiplos entregues em um único texto.

### 🎯 O Problema que Resolvemos

Quando Claude (ou outros AIs) entregam código com múltiplos arquivos, tradicionalmente usam comentários simples como:
```
// src/App.js
// código aqui...

// src/components/Header.js  
// código aqui...
```

**Problemas desta abordagem:**
- ❌ Comentários podem ser confundidos com código
- ❌ Difícil separação automática
- ❌ Requer scripts complexos para parsing
- ❌ Sensível a variações de formato
- ❌ Não é robusto para automação

### 💡 Nossa Solução: Marcadores Únicos

O LookAtni usa um sistema de **marcadores únicos** que são:
- ✅ **Únicos e inconfundíveis**: `/// arquivo ///`
- ✅ **Fáceis de parsear**: Uma única linha sed/awk
- ✅ **Robustos**: Funcionam com qualquer estrutura
- ✅ **Automatizáveis**: Scripts simples e confiáveis
- ✅ **Validáveis**: Detecção automática de problemas

## 🔧 Componentes do Sistema

### 1. **extract-files.sh** - O Extrator Mágico ✨
```bash
./extract-files.sh codigo.txt ./meu-projeto
```

**Funcionalidades:**
- 🎯 Extração automática de arquivos
- 🔍 Validação de formato dos marcadores
- 📊 Estatísticas detalhadas
- 🔄 Modo simulação (dry-run)
- 🎛️ Modo interativo
- 🎨 Output colorido e informativo
- ⚡ Detecção automática de problemas

**Opções avançadas:**
```bash
# Simular sem extrair
./extract-files.sh codigo.txt ./dest --dry-run --stats

# Modo interativo
./extract-files.sh codigo.txt ./dest --interactive

# Validar formato
./extract-files.sh codigo.txt ./dest --format

# Verbose com estatísticas
./extract-files.sh codigo.txt ./dest --verbose --stats
```

### 2. **generate-markers.sh** - O Gerador Inteligente 🧠
```bash
./generate-markers.sh ./meu-projeto codigo.txt
```

**Funcionalidades:**
- 🔍 Escaneamento automático de arquivos de código
- 🎯 Detecção inteligente de tipos de arquivo
- 🚫 Exclusão automática de arquivos desnecessários
- 📏 Controle de tamanho máximo por arquivo
- 🎨 Relatórios detalhados
- ⚙️ Configuração flexível

**Opções avançadas:**
```bash
# Excluir padrões específicos
./generate-markers.sh ./src codigo.txt --exclude node_modules --exclude .git

# Incluir apenas tipos específicos
./generate-markers.sh ./src codigo.txt --include "*.js" --include "*.ts"

# Controlar tamanho máximo
./generate-markers.sh ./src codigo.txt --max-size 500
```

### 3. **test-lookatni.sh** - Suite de Testes 🧪
```bash
./test-lookatni.sh
```

**Funcionalidades:**
- 🏗️ Criação de estrutura de teste
- 🔧 Teste de geração de marcadores
- 📤 Teste de extração
- 🔒 Verificação de integridade
- 📊 Comparação de tamanhos
- 🚀 Teste de funcionalidades avançadas

## 🎨 Formato dos Marcadores

### Formato Simples e Único:
```