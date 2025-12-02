# 🚀 Guia de Deploy no Azure

Este guia explica como fazer o deploy do Auto Daily App no **Azure App Service** com CI/CD completo usando GitHub Actions.

## 📋 Pré-requisitos

- Conta Azure (estudante com $100 de crédito funciona perfeitamente)
- Repositório no GitHub
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) instalado (opcional, mas recomendado)

---

## 🎯 Opção 1: Azure App Service (Recomendado)

O Azure App Service é a melhor opção para Next.js com API Routes.

### Passo 1: Criar recursos no Azure Portal

1. **Acesse o [Azure Portal](https://portal.azure.com)**

2. **Criar um Resource Group**

   - Pesquise por "Resource groups" na barra de pesquisa
   - Clique em "+ Create"
   - **Subscription**: Azure for Students
   - **Resource group**: `rg-auto-daily-app`
   - **Region**: `Brazil South` (ou a mais próxima de você)
   - Clique em "Review + create" → "Create"

3. **Criar o App Service Plan**

   - Pesquise por "App Service plans"
   - Clique em "+ Create"
   - **Subscription**: Azure for Students
   - **Resource Group**: `rg-auto-daily-app`
   - **Name**: `asp-auto-daily-app`
   - **Operating System**: Linux
   - **Region**: Brazil South
   - **Pricing Plan**:
     - Para estudantes: **F1 (Free)** ou **B1 (Basic)** - ~$13/mês
     - Free tier tem limitações mas funciona para testes
   - Clique em "Review + create" → "Create"

4. **Criar o Web App**
   - Pesquise por "App Services"
   - Clique em "+ Create" → "Web App"
   - **Subscription**: Azure for Students
   - **Resource Group**: `rg-auto-daily-app`
   - **Name**: `auto-daily-app` (deve ser único globalmente)
   - **Publish**: Code
   - **Runtime stack**: Node 20 LTS
   - **Operating System**: Linux
   - **Region**: Brazil South
   - **App Service Plan**: `asp-auto-daily-app`
   - Clique em "Review + create" → "Create"

### Passo 2: Configurar variáveis de ambiente no Azure

1. No Azure Portal, vá para seu **App Service**
2. No menu lateral, clique em **Settings** → **Environment variables**
3. Clique em **+ Add** e adicione:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Sua chave da API do Gemini
4. Clique em **Apply** e depois **Confirm**

### Passo 3: Configurar autenticação para GitHub Actions

Você precisa criar uma **Service Principal** para o GitHub Actions se autenticar no Azure.

#### Opção A: Usando Azure CLI (Recomendado)

```bash
# 1. Faça login no Azure
az login

# 2. Obtenha seu Subscription ID
az account show --query id -o tsv

# 3. Crie a Service Principal (substitua <SUBSCRIPTION_ID>)
az ad sp create-for-rbac \
  --name "github-actions-auto-daily" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-auto-daily-app \
  --sdk-auth
```

O comando retornará um JSON assim:

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

#### Opção B: Usando o Azure Portal

1. Vá para **Microsoft Entra ID** (antigo Azure Active Directory)
2. No menu lateral, clique em **App registrations** → **+ New registration**
3. **Name**: `github-actions-auto-daily`
4. Clique em **Register**
5. Anote o **Application (client) ID** e **Directory (tenant) ID**
6. Vá em **Certificates & secrets** → **+ New client secret**
7. Adicione uma descrição e escolha a expiração
8. Anote o **Value** do secret (só aparece uma vez!)
9. Vá para **Subscriptions** → sua subscription → **Access control (IAM)**
10. Clique em **+ Add** → **Add role assignment**
11. Role: **Contributor**
12. Members: Selecione a app registration que você criou
13. Clique em **Review + assign**

### Passo 4: Configurar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Adicione os seguintes secrets clicando em **New repository secret**:

| Secret Name             | Valor                                |
| ----------------------- | ------------------------------------ |
| `AZURE_CLIENT_ID`       | O `clientId` do passo anterior       |
| `AZURE_TENANT_ID`       | O `tenantId` do passo anterior       |
| `AZURE_SUBSCRIPTION_ID` | O `subscriptionId` do passo anterior |
| `GEMINI_API_KEY`        | Sua chave da API do Gemini           |

> **Nota**: Se usou a Opção A com `--sdk-auth`, você também pode usar o secret `AZURE_CREDENTIALS` com o JSON completo.

### Passo 5: Atualizar o nome do App no Workflow

Edite o arquivo `.github/workflows/azure-appservice.yml`:

```yaml
env:
  NODE_VERSION: "20.x"
  AZURE_WEBAPP_NAME: "auto-daily-app" # ← Coloque o nome exato do seu Web App aqui
```

### Passo 6: Fazer deploy!

```bash
# Commit e push das mudanças
git add .
git commit -m "ci: add Azure App Service deployment"
git push origin main
```

O GitHub Actions irá automaticamente:

1. ✅ Fazer checkout do código
2. ✅ Instalar dependências
3. ✅ Rodar type-check e lint
4. ✅ Fazer build da aplicação
5. ✅ Fazer deploy no Azure

Acompanhe o progresso em: `https://github.com/SEU-USUARIO/Auto-Daily-App/actions`

---

## 🌐 Opção 2: Azure Static Web Apps (Alternativa)

> ⚠️ **Atenção**: Azure Static Web Apps tem suporte limitado para Next.js API Routes. Use apenas se não precisar das API Routes ou se migrar para API functions separadas.

### Passo 1: Criar Static Web App

1. No Azure Portal, pesquise "Static Web Apps"
2. Clique em **+ Create**
3. **Subscription**: Azure for Students
4. **Resource Group**: `rg-auto-daily-app`
5. **Name**: `swa-auto-daily-app`
6. **Plan type**: Free
7. **Region**: Brazil South
8. **Deployment details**: GitHub
9. Autorize o Azure a acessar seu GitHub
10. Selecione:
    - **Organization**: Sua org/usuário
    - **Repository**: Auto-Daily-App
    - **Branch**: main
11. **Build Details**:
    - **Build Presets**: Next.js
    - **App location**: `/`
    - **API location**: (deixe vazio)
    - **Output location**: `.next`
12. Clique em "Review + create" → "Create"

O Azure criará automaticamente um workflow no seu repositório!

### Passo 2: Adicionar variáveis de ambiente

1. Vá para seu Static Web App no Portal
2. **Settings** → **Environment variables**
3. Adicione `GEMINI_API_KEY`

---

## 🔧 Comandos Úteis do Azure CLI

```bash
# Ver logs do App Service em tempo real
az webapp log tail --name auto-daily-app --resource-group rg-auto-daily-app

# Reiniciar o App Service
az webapp restart --name auto-daily-app --resource-group rg-auto-daily-app

# Ver configurações do App
az webapp config show --name auto-daily-app --resource-group rg-auto-daily-app

# Listar variáveis de ambiente
az webapp config appsettings list --name auto-daily-app --resource-group rg-auto-daily-app

# Adicionar variável de ambiente via CLI
az webapp config appsettings set --name auto-daily-app --resource-group rg-auto-daily-app --settings GEMINI_API_KEY="sua-chave"
```

---

## 📊 Monitoramento

### Application Insights (Opcional mas recomendado)

1. No seu App Service, vá em **Settings** → **Application Insights**
2. Clique em **Turn on Application Insights**
3. Crie um novo recurso ou use um existente
4. Clique em **Apply**

Isso habilitará:

- 📈 Métricas de performance
- 🐛 Rastreamento de erros
- 📉 Análise de uso

---

## 💰 Estimativa de Custos (Azure for Students)

| Recurso              | Tier       | Custo Estimado   |
| -------------------- | ---------- | ---------------- |
| App Service Plan     | F1 (Free)  | $0/mês           |
| App Service Plan     | B1 (Basic) | ~$13/mês         |
| Application Insights | Free tier  | $0 (até 5GB/mês) |

Com $100 de crédito de estudante, você pode rodar a aplicação por **meses** no tier gratuito ou ~7 meses no tier Basic.

---

## 🔒 Boas Práticas de Segurança

1. ✅ **Nunca commite secrets** - Use GitHub Secrets e Azure Environment Variables
2. ✅ **Use HTTPS** - Azure App Service já vem com HTTPS habilitado
3. ✅ **Renove secrets periodicamente** - Service Principals expiram
4. ✅ **Mínimo privilégio** - A Service Principal só tem acesso ao Resource Group específico
5. ✅ **Monitore custos** - Configure alertas de budget no Azure

---

## ❓ Troubleshooting

### Build falha com erro de memória

- No App Service, vá em **Configuration** → **General settings**
- Aumente o tamanho da instância ou adicione: `NODE_OPTIONS=--max_old_space_size=4096`

### API Routes não funcionam

- Verifique se está usando **App Service** e não Static Web Apps
- Confirme que o `output: "standalone"` está no `next.config.ts`

### Deploy falha com erro de autenticação

- Verifique se os secrets do GitHub estão corretos
- Confirme que a Service Principal tem role "Contributor" no Resource Group

### Aplicação lenta no tier Free

- O tier F1 tem limitações de CPU
- Considere upgrade para B1 para melhor performance
- O primeiro acesso pode demorar (cold start)

---

## 📚 Recursos Adicionais

- [Documentação Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Deploy Next.js no Azure](https://docs.microsoft.com/azure/static-web-apps/deploy-nextjs)
- [GitHub Actions para Azure](https://docs.microsoft.com/azure/developer/github/github-actions)
- [Azure for Students](https://azure.microsoft.com/free/students/)

---

🎉 **Parabéns!** Sua aplicação agora está rodando no Azure com CI/CD completo!
