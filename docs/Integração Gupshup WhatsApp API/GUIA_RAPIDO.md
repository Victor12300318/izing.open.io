# 🚀 Guia Rápido - Configurar Gupshup no Izing

Siga estes passos simples para configurar a API Oficial do WhatsApp via Gupshup.

---

## 📋 Pré-requisitos

Antes de começar, você precisa:
- ✅ Conta no Gupshup (https://www.gupshup.io)
- ✅ Aplicação criada no painel Gupshup
- ✅ Número de WhatsApp Business aprovado
- ✅ Acesso administrativo no Izing

---

## 📝 Passo a Passo

### **PASSO 1: Obter Credenciais no Gupshup**

1. Acesse: https://www.gupshup.io/whatsapp/dashboard
2. Faça login na sua conta
3. Clique em **"Create App"** (se ainda não tiver)
4. Anote as informações:
   - **API Key**: Menu API Keys
   - **App Name**: Nome da sua aplicação
   - **Número do WhatsApp**: Configurado na aplicação

---

### **PASSO 2: Criar Conexão no Izing**

1. No Izing, vá em: **Configurações > Canais**
2. Clique no botão **"Adicionar"**
3. Preencha o formulário:

```
Tipo: WABA Gupshup
Nome: Minha Conexão Gupshup (ou qualquer nome)
Provedor BSP: Gupshup
Número: 5511999999999 (com código do país)
API Key: sua_api_key_aqui
Nome do App: nome_do_app_aqui
```

4. Clique em **"Testar Conexão"** (opcional, mas recomendado)
5. Clique em **"Salvar"**

---

### **PASSO 3: Configurar Webhook**

Após salvar, você verá uma seção com a **URL do Webhook**:

1. Clique no botão **"Copiar URL"**
2. A URL será algo como:
   ```
   https://seu-dominio.com/wabahooks/gupshup/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Volte ao painel do Gupshup:
   - Vá em **Integration > Webhooks**
   - Cole a URL copiada em **Callback URL**
   - Selecione os eventos:
     - ✅ Delivery Events
     - ✅ Inbound Messages
     - ✅ User Events (opcional)
   - Clique em **Save**

---

### **PASSO 4: Pronto! 🎉**

Agora você pode:
- ✅ Receber mensagens de clientes
- ✅ Responder mensagens
- ✅ Enviar mídia (imagens, vídeos, documentos)
- ✅ Usar templates aprovados

---

## 💡 Dicas Importantes

### Mensagens de Texto
- Dentro da janela de 24h: qualquer mensagem
- Fora da janela de 24h: apenas templates aprovados

### Templates
Para enviar mensagens fora da janela de 24h:
1. Crie templates no painel Gupshup
2. Aguarde aprovação da Meta
3. Use os templates aprovados no atendimento

### Opt-in
Para iniciar conversas:
- Cliente deve enviar mensagem primeiro, OU
- Usar link de opt-in, OU
- Cliente já ter conversado antes

### Formatos de Número
- ✅ Correto: `5511999999999`
- ❌ Incorreto: `+55 11 99999-9999`

---

## 🐛 Solução de Problemas

### "Falha ao testar conexão"
- Verifique se a API Key está correta
- Verifique se o Nome do App está correto
- Certifique-se de que o número está ativo no Gupshup

### "Webhook não recebe mensagens"
- Verifique se a URL do webhook está correta no painel Gupshup
- Certifique-se de que seu servidor está acessível
- Verifique se o SSL/HTTPS está configurado

### "Mensagens não enviam"
- Verifique se o número do cliente está correto
- Verifique se está dentro da janela de 24h ou usando template
- Verifique os logs do servidor

### "Status não atualiza"
- Verifique se os webhooks de Delivery Events estão ativados
- Verifique se o servidor está respondendo 200 aos webhooks

---

## 📊 Recursos Suportados

✅ Mensagens de texto  
✅ Imagens (JPEG, PNG, GIF)  
✅ Vídeos (MP4)  
✅ Áudio (OGG, MP3)  
✅ Documentos (PDF, DOC, etc)  
✅ Localização  
✅ Contatos  
✅ Templates aprovados  
✅ Status de entrega (sent, delivered, read)  
✅ Chatbots e Automações  

---

## 📞 Suporte

Em caso de dúvidas:
1. Consulte a documentação completa: `docs/Integração Gupshup WhatsApp API/`
2. Verifique os logs do servidor
3. Consulte a documentação oficial: https://docs.gupshup.io/

---

**Pronto para usar a API Oficial do WhatsApp!** 🚀
