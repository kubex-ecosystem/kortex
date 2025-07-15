conteúdo do outro arquivo...
```

### Por que este formato?

1. **Único**: `///` é altamente improvável de aparecer em código
2. **Simétrico**: Abertura `///` e fechamento `///`
3. **Parseable**: Uma única expressão regular resolve tudo
4. **Legível**: Humans conseguem entender facilmente
5. **Robusto**: Funciona com qualquer linguagem e estrutura

## 🚀 Casos de Uso

### Para Desenvolvedores:
```bash
# Recebeu código do Claude? Extraia facilmente:
./extract-files.sh codigo-do-claude.txt ./meu-projeto

# Quer compartilhar seu projeto? Gere marcadores:
./generate-markers.sh ./meu-projeto codigo-compartilhado.txt

# Teste antes de compartilhar:
./test-lookatni.sh
```

### Para Claude e outros AIs:
```bash
# Gere sempre código no formato: