# Projeto-Conta

### Passos de Execução

1.  **Configurar e Rodar o Backend:**
    O backend é a parte que lida com a lógica de dados e a API.

      * Navegue até a pasta `backend`:
        ```bash
        cd backend
        ```
      * Instale as dependências do backend:
        ```bash
        npm install
        ```
      * Inicie o servidor de desenvolvimento do backend:
        ```bash
        npm run dev
        ```
        O backend estará rodando, geralmente em `http://localhost:3000` (ou a porta que você configurou).

2.  **Configurar e Rodar o Frontend:**
    O frontend é a interface de usuário que interage com o backend.

      * Abra um **novo terminal** ou volte para o diretório raiz do projeto (`Projeto-Conta`) e navegue até a pasta `frontend`:
        ```bash
        # Se você ainda estiver na pasta 'backend', use:
        cd ../frontend
        # Se você abriu um novo terminal e está na raiz do projeto 'Projeto-Conta', use:
        ```bash
        # cd frontend
        ```
      * Instale as dependências do frontend:
        ```bash
        npm install
        ```
      * Inicie o servidor de desenvolvimento do frontend:
        ```bash
        npm run dev
        ```
        O frontend estará rodando, geralmente em `http://localhost:5173` (ou a porta padrão do seu framework, como 3000 para Create React App, 5173 para Vite, etc.).


## Gerenciamento do Banco de Dados PostgreSQL

Este projeto utiliza PostgreSQL como banco de dados. Abaixo estão as instruções para salvar (backup) e restaurar (restauração) o banco de dados.

### Pré-requisitos do Banco de Dados

Certifique-se de ter o [PostgreSQL](https://www.postgresql.org/download/) instalado em sua máquina. O `pg_dump` e o `psql` (utilitários de linha de comando) são essenciais e geralmente vêm com a instalação do PostgreSQL.

### 1\. Salvar (Backup) o Banco de Dados

Para criar um backup completo do seu banco de dados `projeto_conta` (incluindo esquema e todos os dados), utilize o seguinte comando no terminal (Git Bash, Prompt de Comando ou PowerShell).

**Nota:** Substitua `[Caminho_Completo_Do_Seu_Projeto]` pelo caminho real onde o seu projeto está salvo no seu computador (por exemplo: `C:\Users\Wesley\Documents\Projeto-Conta`).

```bash
# Navegue até o diretório bin do PostgreSQL (se pg_dump não estiver no seu PATH)
# cd "C:\Program Files\PostgreSQL\17\bin"

# Crie o backup do banco de dados 'projeto_conta'
pg_dump -U postgres -F p projeto_conta > "[Caminho_Completo_Do_Seu_Projeto]\projeto_conta_backup_$(date +%Y%m%d_%H%M%S).sql"
```

  * **`-U postgres`**: Especifica o usuário `postgres` para o acesso ao banco de dados. Altere se você usa um usuário diferente.
  * **`-F p`**: Define o formato de saída como "plain" (texto SQL simples).
  * **`projeto_conta`**: É o nome do seu banco de dados.
  * O comando gerará um arquivo com a data e hora no nome (ex: `projeto_conta_backup_20250724_154500.sql`) dentro da pasta raiz do seu projeto. Você será solicitado a digitar a senha do usuário `postgres`.

### 2\. Restaurar o Banco de Dados (Em um Novo Ambiente/Computador)

Para carregar os dados de um backup SQL em um novo ambiente ou computador, siga estes passos:

1.  **Instale o PostgreSQL** no computador de destino.

2.  **Crie um banco de dados vazio** com o nome `projeto_conta` (ou o nome que preferir) no seu servidor PostgreSQL. Você pode fazer isso via `pgAdmin` ou linha de comando:

    ```bash
    # No terminal, conecte-se ao psql
    psql -U postgres
    # Dentro do psql, crie o banco de dados
    CREATE DATABASE projeto_conta OWNER postgres;
    # Saia do psql
    \q
    ```

3.  **Execute o arquivo de backup** no novo banco de dados. Navegue até o diretório onde você salvou o arquivo `.sql` e use o comando `psql`.

    **Nota:** Substitua `[Nome_Do_Arquivo_De_Backup]` pelo nome exato do arquivo `.sql` que você salvou (ex: `projeto_conta_backup_20250724_154500.sql`).

    ```bash
    # Navegue até o diretório bin do PostgreSQL (se psql não estiver no seu PATH)
    # cd "C:\Program Files\PostgreSQL\17\bin"

    # Restaure o banco de dados
    psql -U postgres -d projeto_conta -f "[Caminho_Completo_Do_Seu_Projeto]\[Nome_Do_Arquivo_De_Backup]"
    ```

      * **`-d projeto_conta`**: Especifica o banco de dados vazio que você criou para onde os dados serão restaurados.
      * Você será solicitado a digitar a senha do usuário `postgres`.


