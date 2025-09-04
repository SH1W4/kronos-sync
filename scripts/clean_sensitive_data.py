#!/usr/bin/env python3

import os
import re
import sys
from pathlib import Path

# Padrões para identificar dados sensíveis
SENSITIVE_PATTERNS = {
    'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    'phone': r'\(?[0-9]{2,3}\)?[-. ]?[0-9]{4,5}[-. ]?[0-9]{4}',
    'password': r'(?i)password["\s]*[:=]["\s]*[^"\s]+',
    'token': r'(?i)(api_?key|token|secret)["\s]*[:=]["\s]*[^"\s]+',
    'database_url': r'(?i)database_url["\s]*[:=]["\s]*[^"\s]+',
    'auth_secret': r'(?i)(jwt_?secret|nextauth_?secret)["\s]*[:=]["\s]*[^"\s]+'
}

# Substituições para cada tipo
REPLACEMENTS = {
    'email': '{{EMAIL}}',
    'phone': '{{PHONE}}',
    'password': 'password: {{PASSWORD}}
    'token': 'token: {{TOKEN}}
    'database_url': 'database_url: {{DATABASE_URL}}
    'auth_secret': 'token: {{TOKEN}}
}

def clean_file(file_path):
    """Limpa dados sensíveis de um arquivo."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        cleaned = content
        for pattern_name, pattern in SENSITIVE_PATTERNS.items():
            cleaned = re.sub(pattern, REPLACEMENTS[pattern_name], cleaned)

        if cleaned != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            print(f"Limpado: {file_path}")
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")

def scan_directory(directory):
    """Escaneia um diretório recursivamente por arquivos para limpar."""
    try:
        for root, _, files in os.walk(directory):
            for file in files:
                # Ignorar arquivos e diretórios específicos
                if any(ignored in file.lower() for ignored in ['.git', 'node_modules', 'venv', '.env']):
                    continue
                
                file_path = Path(root) / file
                if file_path.suffix.lower() in ['.md', '.py', '.js', '.ts', '.json', '.yaml', '.yml']:
                    clean_file(file_path)
    except Exception as e:
        print(f"Erro ao escanear diretório: {e}")

def main():
    if len(sys.argv) != 2:
        print("Uso: python clean_sensitive_data.py <diretório>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Diretório não encontrado: {directory}")
        sys.exit(1)

    print(f"Iniciando limpeza em: {directory}")
    scan_directory(directory)
    print("Limpeza concluída!")

if __name__ == '__main__':
    main()
