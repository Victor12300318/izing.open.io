# Guia de Integração: Gupshup WhatsApp Business API

## 📋 Visão Geral

Este guia detalha a implementação da **API Oficial do WhatsApp** via **Gupshup** como alternativa ao Hub NotificaMe no sistema Izing.

### Comparativo

| Recurso | Hub NotificaMe | Gupshup (API Oficial) |
|---------|---------------|----------------------|
| **WhatsApp** | Via parceiro 3rd party | ✅ BSP Oficial Meta |
| **Templates** | Limitado | ✅ Completo |
| **Mídia** | Limitado | ✅ Todos os tipos |
| **24h Window** | Limitado | ✅ Completo |
| **Analytics** | Básico | ✅ Avançado |
| **Custo** | Intermediário | Direto com Gupshup |

---

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Conexões    │  │ Seleção     │  │ Config. Gupshup     │  │
│  │ WhatsApp    │  │ BSP         │  │ (API Key, App Name) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  ROUTES                               │   │
│  │  /wabahooks/gupshup/:token  ← Webhook Gupshup        │   │
│  │  /wabahooks/gupshup/verify/:token  ← Verificação     │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               CONTROLLERS                             │   │
│  │  GupshupWebhookController.ts                         │   │
│  │  GupshupMessageController.ts                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 SERVICES                              │   │
│  │  WbotGupshup/                                        │   │
│  │  ├── GupshupClient.ts        ← Cliente HTTP          │   │
│  │  ├── GupshupMessageListener.ts ← Processa webhooks   │   │
│  │  ├── SendTextMessageService.ts ← Envio texto         │   │
│  │  ├── SendMediaMessageService.ts ← Envio mídia        │   │
│  │  ├── SendTemplateMessageService.ts ← Templates       │   │
│  │  └── FindOrCreateContactService.ts ← Contatos        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      GUPSHUP API                             │
│  https://api.gupshup.io/sm/api/v1/msg                       │
│  https://api.gupshup.io/sm/api/v1/template                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

### Novos Arquivos a Criar

```
backend/
├── src/
│   ├── services/
│   │   └── WbotGupshup/                    # NOVO DIRETÓRIO
│   │       ├── index.ts                    # Exportações
│   │       ├── GupshupClient.ts            # Cliente HTTP
│   │       ├── GupshupTypes.ts             # Interfaces/Tipos
│   │       ├── GupshupMessageListener.ts   # Listener de webhooks
│   │       ├── SendTextMessageService.ts   # Envio de texto
│   │       ├── SendMediaMessageService.ts  # Envio de mídia
│   │       ├── SendTemplateMessageService.ts # Envio de templates
│   │       ├── FindOrCreateContactService.ts # Gerenciamento contatos
│   │       └── UpdateMessageAck.ts         # Atualização de status
│   ├── controllers/
│   │   ├── GupshupWebhookController.ts     # NOVO
│   │   └── GupshupMessageController.ts     # NOVO
│   ├── routes/
│   │   └── gupshupRoutes.ts                # NOVO
│   └── helpers/
│       └── GupshupMediaHelper.ts           # NOVO - Download mídia
│
├── docs/
│   └── Integração Gupshup WhatsApp API/
│       ├── README.md                        # Este arquivo
│       ├── IMPLEMENTACAO.md                 # Detalhes de código
│       └── WEBHOOKS.md                      # Payloads de webhook

frontend/
└── src/
    └── pages/
        └── connections/
            └── GupshupConfig.vue           # NOVO - Config. Gupshup
```

---

## 🔧 Pré-requisitos

### 1. Conta Gupshup

1. Acesse: https://www.gupshup.io/whatsapp/dashboard
2. Crie uma conta e solicite acesso ao WhatsApp Business API
3. Aguarde aprovação do número comercial

### 2. Credenciais Necessárias

| Credencial | Onde Encontrar | Uso |
|------------|----------------|-----|
| `API Key` | Dashboard > API Keys | Autenticação |
| `App Name` | Dashboard > Apps | Identificação |
| `Source Phone` | Dashboard > Números | Número WhatsApp |

### 3. Variáveis de Ambiente

Adicione ao `.env`:

```env
# Gupshup Configuration
GUPSHUP_API_URL=https://api.gupshup.io/sm/api/v1
GUPSHUP_API_KEY=sua_api_key_aqui
GUPSHUP_APP_NAME=seu_app_name_aqui
GUPSHUP_SOURCE_PHONE=5511999999999
```

---

## 📝 Passo a Passo de Implementação

### FASE 1: Backend - Tipos e Interfaces

Ver arquivo: `IMPLEMENTACAO.md`

### FASE 2: Backend - Cliente Gupshup

Ver arquivo: `IMPLEMENTACAO.md`

### FASE 3: Backend - Serviços de Mensagem

Ver arquivo: `IMPLEMENTACAO.md`

### FASE 4: Backend - Controllers e Rotas

Ver arquivo: `IMPLEMENTACAO.md`

### FASE 5: Frontend - Interface

Ver arquivo: `IMPLEMENTACAO.md`

---

## 🔌 Webhooks Gupshup

### URL de Callback

Configure no painel Gupshup:

```
https://seu-dominio.com/wabahooks/gupshup/{token}
```

### Eventos Suportados

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `message` | INBOUND | Mensagem recebida do usuário |
| `message-event` | STATUS | Status de envio (sent, delivered, read, failed) |
| `user-event` | OPT-IN | Usuário optou por receber mensagens |

### Exemplos de Payload

Ver arquivo: `WEBHOOKS.md`

---

## ✅ Checklist de Implementação

- [ ] **Backend - Modelos**
  - [ ] Verificar campo `wabaBSP` suporta "gupshup"
  - [ ] Verificar campo `tokenAPI` para API Key
  - [ ] Verificar campo `gupshupAppName` (adicionar se necessário)

- [ ] **Backend - Serviços**
  - [ ] Criar `WbotGupshup/` directory
  - [ ] Implementar `GupshupClient.ts`
  - [ ] Implementar `GupshupMessageListener.ts`
  - [ ] Implementar `SendTextMessageService.ts`
  - [ ] Implementar `SendMediaMessageService.ts`
  - [ ] Implementar `SendTemplateMessageService.ts`

- [ ] **Backend - Controllers**
  - [ ] Criar `GupshupWebhookController.ts`
  - [ ] Criar `GupshupMessageController.ts`

- [ ] **Backend - Rotas**
  - [ ] Adicionar rotas em `WebHooksRoutes.ts`
  - [ ] Registrar rotas no `app.ts`

- [ ] **Frontend**
  - [ ] Adicionar opção "Gupshup" na seleção de BSP
  - [ ] Criar campos de configuração
  - [ ] Atualizar serviço de conexões

- [ ] **Testes**
  - [ ] Testar webhook de verificação
  - [ ] Testar recebimento de mensagens
  - [ ] Testar envio de mensagens
  - [ ] Testar envio de mídia
  - [ ] Testar templates

---

## 📚 Referências

- [Documentação Oficial Gupshup](https://docs.gupshup.io/)
- [Console Gupshup](https://console.gupshup.io/)
- [WhatsApp Business API - Meta](https://developers.facebook.com/docs/whatsapp/business-platform)
- [NPM: gupshup-whatsapp-api](https://www.npmjs.com/package/gupshup-whatsapp-api)

---

## 🆘 Suporte

Em caso de dúvidas:

1. Consulte a documentação oficial Gupshup
2. Verifique os logs do sistema
3. Entre em contato com o suporte Gupshup

---

**Autor:** Sistema Izing  
**Versão:** 1.0.0  
**Última Atualização:** 2025
