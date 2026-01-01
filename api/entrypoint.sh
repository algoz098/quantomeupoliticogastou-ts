#!/bin/sh
set -e

DATABASE_PATH="${DATABASE_PATH:-/app/data/politicos.db}"
CURRENT_YEAR=$(date +%Y)

echo "==================================================="
echo "Quanto Meu Politico Gastou - API Startup"
echo "==================================================="
echo "Database path: $DATABASE_PATH"

# Verificar se o banco de dados existe
if [ ! -f "$DATABASE_PATH" ]; then
    echo ""
    echo ">>> Banco de dados nao encontrado. Iniciando importacao..."
    echo ""
    
    # Importar ultimos 4 anos
    for i in 0 1 2 3; do
        ANO=$((CURRENT_YEAR - i))
        echo ""
        echo ">>> Importando dados do ano $ANO..."
        echo ""
        node dist/scripts/import.js --ano "$ANO" --fonte ambos || {
            echo "Aviso: Falha ao importar ano $ANO, continuando..."
        }
    done
    
    echo ""
    echo ">>> Importacao concluida!"
    echo ""
else
    echo ""
    echo ">>> Banco de dados encontrado. Pulando importacao."
    echo ""
fi

echo "==================================================="
echo "Iniciando servidor API..."
echo "==================================================="

# Executar o comando principal (servidor)
exec node dist/index.js

