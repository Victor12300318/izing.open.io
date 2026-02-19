# Webhooks Gupshup - Payloads de Referência

Documentação completa dos payloads recebidos nos webhooks da Gupshup WhatsApp API.

---

## 📋 Estrutura Base

Todos os webhooks têm a seguinte estrutura base:

```json
{
  "app": "NomeDoApp",
  "timestamp": 1640000000000,
  "version": 2,
  "type": "message|message-event|user-event|template-event|account-event",
  "payload": { ... }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `app` | string | Nome do aplicativo Gupshup |
| `timestamp` | number | Unix timestamp em milissegundos |
| `version` | number | Versão do payload (atual: 2) |
| `type` | string | Tipo de evento |
| `payload` | object | Dados específicos do evento |

---

## 💬 Mensagens Recebidas (Inbound)

### 1. Mensagem de Texto

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "text",
    "text": "Olá, gostaria de mais informações",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 2. Mensagem de Imagem

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "image",
    "url": "https://mmg-fna.whatsapp.net/d/f/As_.../v2/...",
    "caption": "Veja esta foto",
    "mimeType": "image/jpeg",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 3. Mensagem de Vídeo

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "video",
    "url": "https://mmg-fna.whatsapp.net/d/f/As_.../v2/...",
    "caption": "Vídeo demonstrativo",
    "mimeType": "video/mp4",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 4. Mensagem de Áudio

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "audio",
    "url": "https://mmg-fna.whatsapp.net/d/f/As_.../v2/...",
    "mimeType": "audio/ogg",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 5. Mensagem de Documento

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "document",
    "url": "https://mmg-fna.whatsapp.net/d/f/As_.../v2/...",
    "name": "documento.pdf",
    "mimeType": "application/pdf",
    "caption": "Segue o documento solicitado",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 6. Mensagem de Localização

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "location",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "label": "Escritório",
    "address": "Av. Paulista, 1000 - São Paulo",
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 7. Mensagem de Contato

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "contact",
    "contacts": [
      {
        "name": {
          "formatted_name": "Maria Santos",
          "first_name": "Maria",
          "last_name": "Santos"
        },
        "phones": [
          {
            "phone": "5511999999999",
            "wa_id": "5511999999999",
            "type": "MOBILE"
          }
        ],
        "emails": [
          {
            "email": "maria@example.com",
            "type": "WORK"
          }
        ]
      }
    ],
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 8. Resposta de Botão (Button Reply)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "button_reply",
    "payload": "sim_confirmar",
    "button": {
      "text": "Sim, confirmar",
      "payload": "sim_confirmar"
    },
    "context": {
      "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
      "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c"
    },
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

### 9. Resposta de Lista (List Reply)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "list_reply",
    "list": {
      "id": "id_opcao_1",
      "title": "Opção 1",
      "description": "Descrição da opção 1"
    },
    "context": {
      "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
      "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c"
    },
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

---

## 📊 Eventos de Status (Message Event)

### 1. Mensagem Enviada (Sent)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message-event",
  "payload": {
    "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
    "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "type": "text",
    "destination": "5511988888888",
    "payload": {
      "text": "Olá, tudo bem?"
    },
    "sender": {
      "phone": "5511999999999",
      "name": "Empresa",
      "country_code": "55",
      "dial_code": "11999999999"
    },
    "eventType": "sent",
    "eventTs": 1580227767000,
    "conversation": {
      "id": "a5f0f8b97f2c3d4e5f6a7b8c9d0e1f2a",
      "origin": {
        "type": "business_initiated"
      },
      "expiration_timestamp": 1580313600
    },
    "pricing": {
      "category": "business_initiated",
      "billable": true
    }
  }
}
```

### 2. Mensagem Entregue (Delivered)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message-event",
  "payload": {
    "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
    "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "type": "text",
    "destination": "5511988888888",
    "payload": {
      "text": "Olá, tudo bem?"
    },
    "sender": {
      "phone": "5511999999999",
      "name": "Empresa",
      "country_code": "55",
      "dial_code": "11999999999"
    },
    "eventType": "delivered",
    "eventTs": 1580227770000,
    "conversation": {
      "id": "a5f0f8b97f2c3d4e5f6a7b8c9d0e1f2a",
      "origin": {
        "type": "business_initiated"
      },
      "expiration_timestamp": 1580313600
    },
    "pricing": {
      "category": "business_initiated",
      "billable": true
    }
  }
}
```

### 3. Mensagem Lida (Read)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message-event",
  "payload": {
    "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
    "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "type": "text",
    "destination": "5511988888888",
    "payload": {
      "text": "Olá, tudo bem?"
    },
    "sender": {
      "phone": "5511999999999",
      "name": "Empresa",
      "country_code": "55",
      "dial_code": "11999999999"
    },
    "eventType": "read",
    "eventTs": 1580227775000,
    "conversation": {
      "id": "a5f0f8b97f2c3d4e5f6a7b8c9d0e1f2a",
      "origin": {
        "type": "business_initiated"
      },
      "expiration_timestamp": 1580313600
    },
    "pricing": {
      "category": "business_initiated",
      "billable": true
    }
  }
}
```

### 4. Falha no Envio (Failed)

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message-event",
  "payload": {
    "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
    "gsId": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "type": "text",
    "destination": "5511988888888",
    "payload": {
      "text": "Olá, tudo bem?"
    },
    "sender": {
      "phone": "5511999999999",
      "name": "Empresa",
      "country_code": "55",
      "dial_code": "11999999999"
    },
    "eventType": "failed",
    "eventTs": 1580227770000,
    "cause": "Número não possui WhatsApp",
    "errorCode": "1011"
  }
}
```

**Códigos de Erro Comuns:**

| Código | Descrição |
|--------|-----------|
| 1005 | Número inválido |
| 1011 | Número não possui WhatsApp |
| 1013 | Usuário bloqueou a empresa |
| 1025 | Template não aprovado |
| 1030 | Fora da janela de 24h e sem template |

---

## 👤 Eventos de Usuário (User Event)

### 1. Opt-in

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "user-event",
  "payload": {
    "phone": "5511988888888",
    "dial_code": "11988888888",
    "country_code": "55",
    "type": "opted-in",
    "optin_source": "API",
    "optin_timestamp": 1580227766000,
    "last_message_timestamp": 1580227766000
  }
}
```

### 2. Opt-out

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "user-event",
  "payload": {
    "phone": "5511988888888",
    "dial_code": "11988888888",
    "country_code": "55",
    "type": "opted-out",
    "last_message_timestamp": 1580227766000
  }
}
```

---

## 📄 Eventos de Template (Template Event)

### 1. Template Aprovado

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "template-event",
  "payload": {
    "type": "status-update",
    "id": "4dacef15-6c04-12db-b393-6190ac567eff",
    "status": "approved",
    "elementName": "boas_vindas",
    "languageCode": "pt_BR",
    "category": "MARKETING"
  }
}
```

### 2. Template Rejeitado

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "template-event",
  "payload": {
    "type": "status-update",
    "id": "4dacef15-6c04-12db-b393-6190ac567eff",
    "status": "rejected",
    "elementName": "promocao",
    "languageCode": "pt_BR",
    "reason": "TEMPLATE_CONTENT_VIOLATES_POLICIES"
  }
}
```

---

## 🏢 Eventos de Conta (Account Event)

### 1. Mudança de Tier

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "account-event",
  "payload": {
    "type": "tier-event",
    "waba_id": "1234567890",
    "phone_number": "5511999999999",
    "currentLimit": "TIER_100K",
    "oldLimit": "TIER_10K"
  }
}
```

### 2. Status do Número

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "account-event",
  "payload": {
    "type": "pndn-event",
    "waba_id": "1234567890",
    "phone_number": "5511999999999",
    "display_phone_number": "+55 11 99999-9999",
    "event": "VERIFIED"
  }
}
```

---

## 🔄 Contexto de Mensagens (Reply/Quote)

Quando uma mensagem é uma resposta a outra mensagem:

```json
{
  "app": "DemoApp",
  "timestamp": 1580227766370,
  "version": 2,
  "type": "message",
  "payload": {
    "id": "ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c",
    "source": "5511988888888",
    "type": "text",
    "text": "Resposta à mensagem anterior",
    "context": {
      "id": "gBEGkYaYVSEEAgnPFrOLcjkFjL8",
      "gsId": "ABEGkYaYVSEEAhAt2MgAKjL1qGe88OKyMQfM"
    },
    "sender": {
      "phone": "5511988888888",
      "name": "João Silva",
      "country_code": "55",
      "dial_code": "11988888888"
    },
    "timestamp": "1580227766"
  }
}
```

---

## 📊 Campos de Conversation e Pricing

### Conversation

| Campo | Descrição |
|-------|-----------|
| `id` | ID único da conversa |
| `origin.type` | Origem: `business_initiated`, `user_initiated`, `referral_conversion` |
| `expiration_timestamp` | Timestamp de expiração da janela de 24h |

### Pricing

| Campo | Descrição |
|-------|-----------|
| `category` | Categoria: `marketing`, `utility`, `authentication`, `service` |
| `billable` | Se a mensagem foi cobrada |

---

## 📝 Notas Importantes

1. **Resposta Rápida**: Sempre responda com status 200 imediatamente ao receber um webhook
2. **Processamento Assíncrono**: Processe o webhook em background para não bloquear a resposta
3. **Idempotência**: Webhooks podem ser enviados múltiplas vezes - implemente verificação de duplicatas
4. **SSL Obrigatório**: Webhooks só funcionam com HTTPS
5. **Timeouts**: Gupshup espera resposta em até 20 segundos

---

**Documentação baseada na API v2 da Gupshup**  
**Última atualização:** Fevereiro 2025
