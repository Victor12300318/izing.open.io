# Implementação Detalhada - Gupshup WhatsApp API

Este arquivo contém todo o código necessário para implementar a integração.

---

## FASE 1: Tipos e Interfaces

### Arquivo: `backend/src/services/WbotGupshup/GupshupTypes.ts`

```typescript
/**
 * Tipos e Interfaces para integração Gupshup WhatsApp API
 * @description Define todas as estruturas de dados para comunicação com a API Gupshup
 */

// ============================================
// TIPOS BASE
// ============================================

export type GupshupChannel = "whatsapp";

export type GupshupMessageType = 
  | "text" 
  | "image" 
  | "video" 
  | "audio" 
  | "document" 
  | "location" 
  | "contact"
  | "sticker"
  | "template";

export type GupshupEventType = 
  | "message" 
  | "message-event" 
  | "user-event" 
  | "billing-event"
  | "template-event"
  | "account-event";

export type GupshupMessageStatus = 
  | "sent" 
  | "delivered" 
  | "read" 
  | "failed" 
  | "enqueued";

// ============================================
// INTERFACES DE WEBHOOK - ENTRADA
// ============================================

/**
 * Remetente da mensagem (cliente)
 */
export interface GupshupSender {
  phone: string;
  name: string;
  country_code: string;
  dial_code: string;
}

/**
 * Contexto da mensagem (resposta/quote)
 */
export interface GupshupContext {
  id: string;           // ID da mensagem original
  gsId: string;         // Gupshup ID da mensagem original
  externalId?: string;  // ID externo se houver
}

/**
 * Payload de mensagem recebida
 */
export interface GupshupPayload {
  id: string;                    // ID da mensagem WhatsApp
  type: GupshupMessageType;      // Tipo da mensagem
  
  // Conteúdo baseado no tipo
  text?: string;
  caption?: string;
  
  // Mídia
  url?: string;
  name?: string;
  mimeType?: string;
  
  // Imagem/Vídeo/Áudio
  previewUrl?: string;
  originalUrl?: string;
  
  // Localização
  longitude?: number;
  latitude?: number;
  label?: string;
  address?: string;
  
  // Contato
  contacts?: GupshupContact[];
  
  // Botões
  payload?: string;              // Resposta de botão
  button?: {
    text: string;
    payload: string;
  };
  
  // Lista
  list?: {
    id: string;
    title: string;
    description: string;
  };
  
  // Metadados
  sender: GupshupSender;
  context?: GupshupContext;
  timestamp: string;
}

/**
 * Contato enviado pelo usuário
 */
export interface GupshupContact {
  name: {
    formatted_name: string;
    first_name: string;
    last_name?: string;
  };
  phones?: {
    phone: string;
    wa_id: string;
    type: string;
  }[];
  emails?: {
    email: string;
    type: string;
  }[];
}

/**
 * Webhook de mensagem recebida
 */
export interface GupshupInboundMessage {
  app: string;
  timestamp: number;
  version: number;
  type: "message";
  payload: GupshupPayload;
}

/**
 * Evento de status de mensagem
 */
export interface GupshupMessageEvent {
  app: string;
  timestamp: number;
  version: number;
  type: "message-event";
  payload: {
    id: string;                    // ID da mensagem
    gsId: string;                  // Gupshup ID
    externalId?: string;
    type: GupshupMessageType;
    destination: string;           // Número do destinatário
    payload: {
      header?: {
        type: string;
        text?: string;
      };
      text?: string;
      caption?: string;
      url?: string;
      name?: string;
      mimeType?: string;
    };
    context?: GupshupContext;
    sender: GupshupSender;
    eventType: GupshupMessageStatus;
    eventTs: number;
    cause?: string;               // Motivo do erro (se failed)
    errorCode?: string;
    conversation?: {
      id: string;
      origin: {
        type: "business_initiated" | "user_initiated" | "referral_conversion";
      };
      expiration_timestamp: number;
    };
    pricing?: {
      category: "business_initiated" | "user_initiated" | "referral_conversion" | "authentication" | "marketing" | "utility";
      billable: boolean;
    };
  };
}

/**
 * Evento de usuário (opt-in/opt-out)
 */
export interface GupshupUserEvent {
  app: string;
  timestamp: number;
  version: number;
  type: "user-event";
  payload: {
    phone: string;
    dial_code: string;
    country_code: string;
    type: "opted-in" | "opted-out";
    optin_source?: string;
    optin_timestamp?: number;
    last_message_timestamp?: number;
  };
}

/**
 * Union de todos os tipos de webhook
 */
export type GupshupWebhook = 
  | GupshupInboundMessage 
  | GupshupMessageEvent 
  | GupshupUserEvent;

// ============================================
// INTERFACES DE ENVIO - SAÍDA
// ============================================

/**
 * Opções base para envio de mensagem
 */
export interface GupshupSendOptions {
  channel: "whatsapp";
  source: string;           // Número do WhatsApp Business
  destination: string;      // Número do destinatário (sem +)
  "src.name"?: string;      // Nome do app (sandbox)
}

/**
 * Mensagem de texto
 */
export interface GupshupTextMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "text";
    text: string;
  };
}

/**
 * Mensagem de imagem
 */
export interface GupshupImageMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "image";
    originalUrl: string;
    previewUrl?: string;
    caption?: string;
  };
}

/**
 * Mensagem de vídeo
 */
export interface GupshupVideoMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "video";
    originalUrl: string;
    previewUrl?: string;
    caption?: string;
  };
}

/**
 * Mensagem de áudio
 */
export interface GupshupAudioMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "audio";
    originalUrl: string;
  };
}

/**
 * Mensagem de documento
 */
export interface GupshupDocumentMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "file";
    originalUrl: string;
    filename: string;
    caption?: string;
  };
}

/**
 * Mensagem de localização
 */
export interface GupshupLocationMessage extends GupshupSendOptions {
  message: {
    isHSM?: "true" | "false";
    type: "location";
    longitude: number;
    latitude: number;
    label?: string;
    address?: string;
  };
}

/**
 * Parâmetro de template
 */
export interface GupshupTemplateParam {
  type: "text" | "image" | "video" | "document" | "currency" | "date_time";
  text?: string;
  image?: { link: string };
  video?: { link: string };
  document?: { link: string; filename?: string };
  currency?: { fallback_value: string; code: string; amount_1000: number };
  date_time?: { fallback_value: string };
}

/**
 * Componente de template
 */
export interface GupshupTemplateComponent {
  type: "header" | "body" | "button";
  parameters?: GupshupTemplateParam[];
  sub_type?: "quick_reply" | "url";
  index?: number;
}

/**
 * Mensagem de template (HSM)
 */
export interface GupshupTemplateMessage extends GupshupSendOptions {
  message: {
    isHSM: "true";
    type: "template";
    template: string;                    // Nome do template
    language?: string;                   // Código do idioma (ex: pt_BR)
    components?: GupshupTemplateComponent[];
  };
}

/**
 * Union de todos os tipos de mensagem
 */
export type GupshupOutboundMessage = 
  | GupshupTextMessage 
  | GupshupImageMessage 
  | GupshupVideoMessage 
  | GupshupAudioMessage 
  | GupshupDocumentMessage 
  | GupshupLocationMessage 
  | GupshupTemplateMessage;

// ============================================
// RESPOSTAS DA API
// ============================================

/**
 * Resposta de envio de mensagem
 */
export interface GupshupSendResponse {
  status: "submitted" | "error";
  messageId?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Lista de templates
 */
export interface GupshupTemplate {
  elementName: string;
  languageCode: string;
  category: string;
  templateType: string;
  bodyText: string;
  status: string;
  createdOn: number;
  modifiedOn: number;
}

/**
 * Lista de opt-ins
 */
export interface GupshupOptInUser {
  countryCode: string;
  phone: string;
  optinStatus: "OPT_IN" | "OPT_OUT";
  optinSource: string;
  optinTimeStamp: number;
  lastMessageTimeStamp: number;
}

// ============================================
// CONFIGURAÇÃO
// ============================================

/**
 * Configuração do cliente Gupshup
 */
export interface GupshupConfig {
  apiKey: string;
  appName?: string;
  sourcePhone: string;
  apiUrl?: string;
}

/**
 * Dados de conexão salvos no banco
 */
export interface GupshupConnectionData {
  wabaBSP: "gupshup";
  tokenAPI: string;         // API Key
  gupshupAppName: string;   // Nome do App
  number: string;           // Número do WhatsApp Business
}
```

---

## FASE 2: Cliente HTTP Gupshup

### Arquivo: `backend/src/services/WbotGupshup/GupshupClient.ts`

```typescript
import axios, { AxiosInstance, AxiosResponse } from "axios";
import FormData from "form-data";
import { logger } from "../../utils/logger";
import {
  GupshupConfig,
  GupshupSendResponse,
  GupshupOutboundMessage,
  GupshupTemplate,
  GupshupOptInUser
} from "./GupshupTypes";

/**
 * Cliente HTTP para API Gupshup
 * @description Gerencia todas as chamadas HTTP para a API Gupshup
 */
class GupshupClient {
  private api: AxiosInstance;
  private config: GupshupConfig;

  constructor(config: GupshupConfig) {
    this.config = {
      apiUrl: "https://api.gupshup.io/sm/api/v1",
      ...config
    };

    this.api = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": this.config.apiKey
      }
    });

    // Interceptor para logging
    this.api.interceptors.request.use(
      (request) => {
        logger.info(`[GupshupClient] Request: ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      },
      (error) => {
        logger.error("[GupshupClient] Request Error:", error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        logger.info(`[GupshupClient] Response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error("[GupshupClient] Response Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Envia uma mensagem para a API Gupshup
   * @param message - Dados da mensagem
   * @returns Promise com a resposta da API
   */
  async sendMessage(message: GupshupOutboundMessage): Promise<GupshupSendResponse> {
    try {
      // Preparar dados no formato esperado pela API
      const formData = new FormData();
      
      // Campos obrigatórios
      formData.append("channel", message.channel);
      formData.append("source", message.source);
      formData.append("destination", message.destination);
      
      // Nome do app (necessário para sandbox)
      if (message["src.name"]) {
        formData.append("src.name", message["src.name"]);
      }

      // Serializar a mensagem
      formData.append("message", JSON.stringify(message.message));

      const response: AxiosResponse<GupshupSendResponse> = await this.api.post(
        "/msg",
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error("[GupshupClient] sendMessage error:", error.response?.data || error.message);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Envia mensagem de texto simples
   */
  async sendText(
    destination: string,
    text: string,
    isHSM: boolean = false
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        isHSM: isHSM ? "true" : "false",
        type: "text",
        text
      }
    });
  }

  /**
   * Envia mensagem de imagem
   */
  async sendImage(
    destination: string,
    imageUrl: string,
    caption?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        type: "image",
        originalUrl: imageUrl,
        caption
      }
    });
  }

  /**
   * Envia mensagem de vídeo
   */
  async sendVideo(
    destination: string,
    videoUrl: string,
    caption?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        type: "video",
        originalUrl: videoUrl,
        caption
      }
    });
  }

  /**
   * Envia mensagem de áudio
   */
  async sendAudio(
    destination: string,
    audioUrl: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        type: "audio",
        originalUrl: audioUrl
      }
    });
  }

  /**
   * Envia mensagem de documento
   */
  async sendDocument(
    destination: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        type: "file",
        originalUrl: documentUrl,
        filename,
        caption
      }
    });
  }

  /**
   * Envia mensagem de localização
   */
  async sendLocation(
    destination: string,
    latitude: number,
    longitude: number,
    label?: string,
    address?: string
  ): Promise<GupshupSendResponse> {
    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message: {
        type: "location",
        latitude,
        longitude,
        label,
        address
      }
    });
  }

  /**
   * Envia mensagem de template
   */
  async sendTemplate(
    destination: string,
    templateName: string,
    languageCode: string = "pt_BR",
    params?: Record<string, string>
  ): Promise<GupshupSendResponse> {
    const message: any = {
      isHSM: "true",
      type: "template",
      template: templateName,
      language: languageCode
    };

    // Se houver parâmetros, adicionar componentes
    if (params && Object.keys(params).length > 0) {
      message.components = [
        {
          type: "body",
          parameters: Object.entries(params).map(([_, value]) => ({
            type: "text",
            text: value
          }))
        }
      ];
    }

    return this.sendMessage({
      channel: "whatsapp",
      source: this.config.sourcePhone,
      destination,
      "src.name": this.config.appName,
      message
    });
  }

  /**
   * Lista todos os templates aprovados
   */
  async getTemplates(): Promise<GupshupTemplate[]> {
    try {
      const response = await this.api.get(`/template/list/${this.config.appName}`);
      return response.data;
    } catch (error: any) {
      logger.error("[GupshupClient] getTemplates error:", error.message);
      throw error;
    }
  }

  /**
   * Lista usuários opt-in
   */
  async getOptInUsers(): Promise<GupshupOptInUser[]> {
    try {
      const response = await this.api.get(`/users/${this.config.appName}`);
      return response.data.users;
    } catch (error: any) {
      logger.error("[GupshupClient] getOptInUsers error:", error.message);
      throw error;
    }
  }

  /**
   * Realiza opt-in de um usuário
   */
  async optInUser(phoneNumber: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("user", phoneNumber);

      await this.api.post(`/app/opt/in/${this.config.appName}`, formData, {
        headers: formData.getHeaders()
      });
    } catch (error: any) {
      logger.error("[GupshupClient] optInUser error:", error.message);
      throw error;
    }
  }
}

export default GupshupClient;
```

---

## FASE 3: Serviços de Mensagem

### Arquivo: `backend/src/services/WbotGupshup/CreateMessageService.ts`

```typescript
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

interface CreateMessageRequest {
  id: string;
  body: string;
  contactId: number;
  ticketId: number;
  fromMe: boolean;
  tenantId: number;
  mediaType?: string;
  fileName?: string;
  originalName?: string;
  quotedMsgId?: string;
  timestamp?: number;
}

/**
 * Cria uma nova mensagem no banco de dados
 */
const CreateMessageService = async ({
  id,
  body,
  contactId,
  ticketId,
  fromMe,
  tenantId,
  mediaType,
  fileName,
  originalName,
  quotedMsgId,
  timestamp
}: CreateMessageRequest): Promise<Message> => {
  try {
    const message = await Message.create({
      id,
      body,
      contactId,
      ticketId,
      fromMe,
      tenantId,
      mediaType,
      fileName,
      originalName,
      quotedMsgId,
      timestamp: timestamp || Date.now(),
      status: fromMe ? "pending" : "received"
    });

    logger.info(`[CreateMessageService] Message created: ${id}`);
    return message;
  } catch (error: any) {
    logger.error(`[CreateMessageService] Error: ${error.message}`);
    throw error;
  }
};

export default CreateMessageService;
```

### Arquivo: `backend/src/services/WbotGupshup/FindOrCreateContactService.ts`

```typescript
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface FindOrCreateContactRequest {
  name: string;
  firstName: string;
  lastName?: string;
  phone: string;
  countryCode: string;
  dialCode: string;
  profilePicUrl?: string;
  whatsapp: Whatsapp;
  tenantId: number;
}

/**
 * Encontra ou cria um contato baseado nos dados do Gupshup
 */
const FindOrCreateContactService = async ({
  name,
  firstName,
  lastName,
  phone,
  countryCode,
  dialCode,
  profilePicUrl,
  whatsapp,
  tenantId
}: FindOrCreateContactRequest): Promise<Contact> => {
  try {
    // Formatar número (remover código do país se já estiver incluso)
    let number = phone;
    if (!number.startsWith("+") && !number.startsWith(countryCode)) {
      number = `${countryCode}${dialCode}`;
    }

    // Buscar contato existente
    let contact = await Contact.findOne({
      where: { number, tenantId }
    });

    if (contact) {
      // Atualizar dados se necessário
      if (profilePicUrl && !contact.profilePicUrl) {
        await contact.update({ profilePicUrl });
      }
      logger.info(`[FindOrCreateContactService] Contact found: ${number}`);
      return contact;
    }

    // Criar novo contato
    contact = await Contact.create({
      number,
      name: name || `${firstName} ${lastName || ""}`.trim(),
      profilePicUrl,
      tenantId,
      whatsappId: whatsapp.id
    });

    logger.info(`[FindOrCreateContactService] Contact created: ${number}`);
    return contact;
  } catch (error: any) {
    logger.error(`[FindOrCreateContactService] Error: ${error.message}`);
    throw error;
  }
};

export default FindOrCreateContactService;
```

### Arquivo: `backend/src/services/WbotGupshup/GupshupMessageListener.ts`

```typescript
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import socketEmit from "../../helpers/socketEmit";
import { downloadMedia } from "../../helpers/GupshupMediaHelper";
import { 
  GupshupWebhook, 
  GupshupInboundMessage, 
  GupshupMessageEvent 
} from "./GupshupTypes";
import CreateMessageService from "./CreateMessageService";
import FindOrCreateContactService from "./FindOrCreateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import UpdateMessageAck from "./UpdateMessageAck";

/**
 * Listener de mensagens do Gupshup
 * @description Processa webhooks recebidos do Gupshup
 */
const GupshupMessageListener = async (
  webhook: GupshupWebhook,
  whatsapp: Whatsapp
): Promise<void> => {
  try {
    logger.info(`[GupshupMessageListener] Received webhook type: ${webhook.type}`);

    // Processar baseado no tipo de evento
    switch (webhook.type) {
      case "message":
        await handleInboundMessage(webhook as GupshupInboundMessage, whatsapp);
        break;
      
      case "message-event":
        await handleMessageEvent(webhook as GupshupMessageEvent);
        break;
      
      case "user-event":
        await handleUserEvent(webhook);
        break;
      
      default:
        logger.info(`[GupshupMessageListener] Unhandled event type: ${webhook.type}`);
    }
  } catch (error: any) {
    logger.error(`[GupshupMessageListener] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Processa mensagem recebida do usuário
 */
const handleInboundMessage = async (
  message: GupshupInboundMessage,
  whatsapp: Whatsapp
): Promise<void> => {
  const { payload } = message;
  const { sender, id: messageId, type, timestamp } = payload;

  logger.info(`[handleInboundMessage] Processing ${type} from ${sender.phone}`);

  try {
    // Criar ou atualizar contato
    const contact = await FindOrCreateContactService({
      name: sender.name,
      firstName: sender.name.split(" ")[0] || sender.name,
      lastName: sender.name.split(" ").slice(1).join(" "),
      phone: sender.phone,
      countryCode: sender.country_code,
      dialCode: sender.dial_code,
      whatsapp,
      tenantId: whatsapp.tenantId
    });

    // Criar ou encontrar ticket
    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId: whatsapp.id!,
      unreadMessages: 1,
      tenantId: whatsapp.tenantId,
      groupContact: undefined,
      msg: {
        body: getMessageBody(payload),
        fromMe: false,
        timestamp: parseInt(timestamp)
      },
      channel: "waba_gupshup"
    });

    // Processar conteúdo baseado no tipo
    switch (type) {
      case "text":
        await handleTextMessage(messageId, payload, contact, ticket, whatsapp);
        break;
      
      case "image":
      case "video":
      case "audio":
      case "document":
        await handleMediaMessage(messageId, payload, contact, ticket, whatsapp, type);
        break;
      
      case "location":
        await handleLocationMessage(messageId, payload, contact, ticket, whatsapp);
        break;
      
      case "contact":
        await handleContactMessage(messageId, payload, contact, ticket, whatsapp);
        break;
      
      default:
        logger.warn(`[handleInboundMessage] Unhandled message type: ${type}`);
        await handleTextMessage(messageId, { ...payload, text: `[${type}]` }, contact, ticket, whatsapp);
    }

    // Emitir socket para atualização em tempo real
    socketEmit({
      tenantId: whatsapp.tenantId,
      type: "ticket:update",
      payload: ticket
    });

  } catch (error: any) {
    logger.error(`[handleInboundMessage] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Extrai o corpo da mensagem baseado no tipo
 */
const getMessageBody = (payload: any): string => {
  if (payload.text) return payload.text;
  if (payload.caption) return payload.caption;
  if (payload.name) return payload.name;
  if (payload.label) return payload.label;
  return "[Mensagem]";
};

/**
 * Processa mensagem de texto
 */
const handleTextMessage = async (
  messageId: string,
  payload: any,
  contact: any,
  ticket: any,
  whatsapp: Whatsapp
): Promise<void> => {
  await CreateMessageService({
    id: messageId,
    body: payload.text || "",
    contactId: contact.id,
    ticketId: ticket.id,
    fromMe: false,
    tenantId: whatsapp.tenantId
  });

  await ticket.update({ lastMessage: payload.text });
};

/**
 * Processa mensagem de mídia
 */
const handleMediaMessage = async (
  messageId: string,
  payload: any,
  contact: any,
  ticket: any,
  whatsapp: Whatsapp,
  mediaType: string
): Promise<void> => {
  try {
    // Download da mídia
    const mediaUrl = payload.url || payload.originalUrl;
    const mediaData = await downloadMedia(mediaUrl);

    await CreateMessageService({
      id: messageId,
      body: payload.caption || mediaData.filename,
      contactId: contact.id,
      ticketId: ticket.id,
      fromMe: false,
      tenantId: whatsapp.tenantId,
      mediaType: mediaType === "document" ? "file" : mediaType,
      fileName: mediaData.filename,
      originalName: mediaData.originalname
    });

    await ticket.update({ lastMessage: `[${mediaType.toUpperCase()}] ${payload.caption || ""}` });
  } catch (error: any) {
    logger.error(`[handleMediaMessage] Error downloading media: ${error.message}`);
    // Criar mensagem mesmo sem o download
    await CreateMessageService({
      id: messageId,
      body: `[${mediaType.toUpperCase()}] ${payload.caption || ""}`,
      contactId: contact.id,
      ticketId: ticket.id,
      fromMe: false,
      tenantId: whatsapp.tenantId
    });
  }
};

/**
 * Processa mensagem de localização
 */
const handleLocationMessage = async (
  messageId: string,
  payload: any,
  contact: any,
  ticket: any,
  whatsapp: Whatsapp
): Promise<void> => {
  const locationText = `📍 Localização: ${payload.label || ""}\n${payload.address || ""}\nhttps://maps.google.com/?q=${payload.latitude},${payload.longitude}`;
  
  await CreateMessageService({
    id: messageId,
    body: locationText,
    contactId: contact.id,
    ticketId: ticket.id,
    fromMe: false,
    tenantId: whatsapp.tenantId
  });

  await ticket.update({ lastMessage: "[LOCALIZAÇÃO]" });
};

/**
 * Processa mensagem de contato
 */
const handleContactMessage = async (
  messageId: string,
  payload: any,
  contact: any,
  ticket: any,
  whatsapp: Whatsapp
): Promise<void> => {
  const contacts = payload.contacts || [];
  let contactText = "📇 Contato(s):\n\n";
  
  contacts.forEach((c: any) => {
    contactText += `Nome: ${c.name?.formatted_name || ""}\n`;
    if (c.phones?.length > 0) {
      contactText += `Telefone: ${c.phones[0].phone}\n`;
    }
    contactText += "\n";
  });

  await CreateMessageService({
    id: messageId,
    body: contactText,
    contactId: contact.id,
    ticketId: ticket.id,
    fromMe: false,
    tenantId: whatsapp.tenantId
  });

  await ticket.update({ lastMessage: "[CONTATO]" });
};

/**
 * Processa evento de status de mensagem
 */
const handleMessageEvent = async (event: GupshupMessageEvent): Promise<void> => {
  const { payload } = event;
  const { eventType, gsId } = payload;

  logger.info(`[handleMessageEvent] Status update: ${eventType} for message ${gsId}`);

  // Mapear status do Gupshup para status interno
  const statusMap: Record<string, string> = {
    "sent": "sent",
    "delivered": "delivered",
    "read": "read",
    "failed": "failed"
  };

  const internalStatus = statusMap[eventType];
  if (internalStatus) {
    await UpdateMessageAck(gsId, internalStatus);
  }
};

/**
 * Processa evento de usuário (opt-in/opt-out)
 */
const handleUserEvent = async (event: any): Promise<void> => {
  const { payload } = event;
  logger.info(`[handleUserEvent] User ${payload.phone} ${payload.type}`);
  // Implementar lógica de opt-in/opt-out se necessário
};

export default GupshupMessageListener;
```

### Arquivo: `backend/src/services/WbotGupshup/SendTextMessageService.ts`

```typescript
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import GupshupClient from "./GupshupClient";
import CreateMessageService from "./CreateMessageService";
import { logger } from "../../utils/logger";
import socketEmit from "../../helpers/socketEmit";
import { pupa } from "../../utils/pupa";
import User from "../../models/User";

interface SendTextMessageRequest {
  message: string;
  ticketId: number;
  contact: Contact;
  whatsapp: Whatsapp;
}

/**
 * Envia mensagem de texto via Gupshup
 */
const SendTextMessageService = async ({
  message,
  ticketId,
  contact,
  whatsapp
}: SendTextMessageRequest): Promise<void> => {
  try {
    // Buscar ticket para obter dados adicionais
    const ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [Contact, User]
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Substituir variáveis na mensagem
    let body = pupa(message || "", {
      protocol: ticket.protocol || "",
      name: ticket.contact?.name || contact.name || "",
    });

    // Inicializar cliente Gupshup
    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    // Determinar se é HSM (fora da janela de 24h)
    const isHSM = !ticket.isWithin24h;

    // Enviar mensagem
    const response = await client.sendText(
      contact.number,
      body,
      isHSM
    );

    if (response.status === "submitted") {
      // Criar registro da mensagem
      await CreateMessageService({
        id: response.messageId || `gupshup_${Date.now()}`,
        body,
        contactId: contact.id,
        ticketId,
        fromMe: true,
        tenantId: whatsapp.tenantId
      });

      // Atualizar ticket
      await ticket.update({
        lastMessage: body,
        answered: true
      });

      // Emitir atualização
      socketEmit({
        tenantId: whatsapp.tenantId,
        type: "ticket:update",
        payload: ticket
      });

      logger.info(`[SendTextMessageService] Message sent: ${response.messageId}`);
    } else {
      throw new Error(response.message || "Failed to send message");
    }
  } catch (error: any) {
    logger.error(`[SendTextMessageService] Error: ${error.message}`);
    throw error;
  }
};

export default SendTextMessageService;
```

### Arquivo: `backend/src/services/WbotGupshup/SendMediaMessageService.ts`

```typescript
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import GupshupClient from "./GupshupClient";
import CreateMessageService from "./CreateMessageService";
import { logger } from "../../utils/logger";
import socketEmit from "../../helpers/socketEmit";
import { getPublicUrl } from "../../helpers/GetPublicUrl";

interface SendMediaMessageRequest {
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "document";
  caption?: string;
  fileName?: string;
  ticketId: number;
  contact: Contact;
  whatsapp: Whatsapp;
}

/**
 * Envia mensagem de mídia via Gupshup
 */
const SendMediaMessageService = async ({
  mediaUrl,
  mediaType,
  caption,
  fileName,
  ticketId,
  contact,
  whatsapp
}: SendMediaMessageRequest): Promise<void> => {
  try {
    const ticket = await Ticket.findOne({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Inicializar cliente Gupshup
    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    // Garantir URL pública
    const publicUrl = getPublicUrl(mediaUrl);
    let response;

    // Enviar baseado no tipo de mídia
    switch (mediaType) {
      case "image":
        response = await client.sendImage(contact.number, publicUrl, caption);
        break;
      
      case "video":
        response = await client.sendVideo(contact.number, publicUrl, caption);
        break;
      
      case "audio":
        response = await client.sendAudio(contact.number, publicUrl);
        break;
      
      case "document":
        response = await client.sendDocument(
          contact.number,
          publicUrl,
          fileName || "document",
          caption
        );
        break;
      
      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }

    if (response.status === "submitted") {
      // Criar registro da mensagem
      await CreateMessageService({
        id: response.messageId || `gupshup_${Date.now()}`,
        body: caption || `[${mediaType.toUpperCase()}]`,
        contactId: contact.id,
        ticketId,
        fromMe: true,
        tenantId: whatsapp.tenantId,
        mediaType,
        fileName: fileName || `${mediaType}_${Date.now()}`,
        originalName: fileName
      });

      // Atualizar ticket
      await ticket.update({
        lastMessage: `[${mediaType.toUpperCase()}] ${caption || ""}`,
        answered: true
      });

      // Emitir atualização
      socketEmit({
        tenantId: whatsapp.tenantId,
        type: "ticket:update",
        payload: ticket
      });

      logger.info(`[SendMediaMessageService] ${mediaType} sent: ${response.messageId}`);
    } else {
      throw new Error(response.message || "Failed to send media");
    }
  } catch (error: any) {
    logger.error(`[SendMediaMessageService] Error: ${error.message}`);
    throw error;
  }
};

export default SendMediaMessageService;
```

### Arquivo: `backend/src/services/WbotGupshup/UpdateMessageAck.ts`

```typescript
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

/**
 * Atualiza o status de uma mensagem
 * @param messageId - ID da mensagem no Gupshup (gsId)
 * @param status - Novo status
 */
const UpdateMessageAck = async (messageId: string, status: string): Promise<void> => {
  try {
    // Buscar mensagem pelo ID externo
    const message = await Message.findOne({
      where: { id: messageId }
    });

    if (message) {
      await message.update({ ack: status });
      logger.info(`[UpdateMessageAck] Message ${messageId} updated to ${status}`);
    } else {
      logger.warn(`[UpdateMessageAck] Message ${messageId} not found`);
    }
  } catch (error: any) {
    logger.error(`[UpdateMessageAck] Error: ${error.message}`);
  }
};

export default UpdateMessageAck;
```

### Arquivo: `backend/src/services/WbotGupshup/index.ts`

```typescript
/**
 * Exportações do módulo WbotGupshup
 */

export { default as GupshupClient } from "./GupshupClient";
export { default as GupshupMessageListener } from "./GupshupMessageListener";
export { default as CreateMessageService } from "./CreateMessageService";
export { default as FindOrCreateContactService } from "./FindOrCreateContactService";
export { default as SendTextMessageService } from "./SendTextMessageService";
export { default as SendMediaMessageService } from "./SendMediaMessageService";
export { default as UpdateMessageAck } from "./UpdateMessageAck";
export * from "./GupshupTypes";
```

---

## FASE 4: Controllers e Rotas

### Arquivo: `backend/src/controllers/GupshupWebhookController.ts`

```typescript
import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import GupshupMessageListener from "../services/WbotGupshup/GupshupMessageListener";
import { logger } from "../utils/logger";

/**
 * Controller para webhooks Gupshup
 * @description Gerencia recebimento de mensagens e eventos do Gupshup
 */

/**
 * Verificação do webhook (GET request)
 * Usado pelo Gupshup para validar a URL
 */
export const verifyWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.params;
    const challenge = req.query["hub.challenge"];

    logger.info(`[GupshupWebhookController] Verification request received for token: ${token}`);

    // Verificar se o token existe
    const whatsapp = await Whatsapp.findOne({
      where: { tokenHook: token, wabaBSP: "gupshup" }
    });

    if (!whatsapp) {
      logger.warn(`[GupshupWebhookController] Invalid token: ${token}`);
      return res.status(403).json({ message: "Invalid token" });
    }

    // Retornar o challenge para confirmar a URL
    if (challenge) {
      logger.info(`[GupshupWebhookController] Challenge accepted`);
      return res.status(200).send(challenge);
    }

    return res.status(200).json({ message: "Webhook verified" });
  } catch (error: any) {
    logger.error(`[GupshupWebhookController] Verification error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Recebe webhooks do Gupshup (POST request)
 * Processa mensagens e eventos
 */
export const receiveWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.params;
    const webhook = req.body;

    logger.info(`[GupshupWebhookController] Webhook received: ${webhook.type}`);

    // Verificar se o token existe
    const whatsapp = await Whatsapp.findOne({
      where: { tokenHook: token, wabaBSP: "gupshup" }
    });

    if (!whatsapp) {
      logger.warn(`[GupshupWebhookController] Invalid token: ${token}`);
      return res.status(404).json({ message: "Channel not found" });
    }

    // Responder imediatamente (200 OK)
    // O Gupshup requer resposta rápida, o processamento é feito em background
    res.status(200).end();

    // Processar webhook em background
    try {
      await GupshupMessageListener(webhook, whatsapp);
    } catch (error: any) {
      logger.error(`[GupshupWebhookController] Error processing webhook: ${error.message}`);
    }

    return res;
  } catch (error: any) {
    logger.error(`[GupshupWebhookController] Webhook error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Status do webhook
 * Retorna informações sobre a conexão
 */
export const getWebhookStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.params;

    const whatsapp = await Whatsapp.findOne({
      where: { tokenHook: token, wabaBSP: "gupshup" }
    });

    if (!whatsapp) {
      return res.status(404).json({ message: "Channel not found" });
    }

    return res.status(200).json({
      status: "active",
      channel: whatsapp.name,
      number: whatsapp.number,
      connected: whatsapp.status === "CONNECTED"
    });
  } catch (error: any) {
    logger.error(`[GupshupWebhookController] Status error: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};
```

### Arquivo: `backend/src/controllers/GupshupMessageController.ts`

```typescript
import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import GupshupClient from "../services/WbotGupshup/GupshupClient";
import SendTextMessageService from "../services/WbotGupshup/SendTextMessageService";
import SendMediaMessageService from "../services/WbotGupshup/SendMediaMessageService";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

/**
 * Controller para envio de mensagens via Gupshup
 * @description Gerencia envio de mensagens através da API
 */

/**
 * Envia mensagem de texto
 */
export const sendTextMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new AppError("Message body is required", 400);
    }

    // Buscar ticket
    const ticket = await Ticket.findByPk(ticketId, {
      include: [Contact, Whatsapp]
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (!ticket.whatsapp) {
      throw new AppError("WhatsApp channel not found", 404);
    }

    if (ticket.whatsapp.wabaBSP !== "gupshup") {
      throw new AppError("This ticket is not a Gupshup channel", 400);
    }

    // Enviar mensagem
    await SendTextMessageService({
      message,
      ticketId: parseInt(ticketId),
      contact: ticket.contact,
      whatsapp: ticket.whatsapp
    });

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] sendTextMessage error: ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Envia mensagem de mídia
 */
export const sendMediaMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { mediaUrl, mediaType, caption, fileName } = req.body;

    if (!mediaUrl || !mediaType) {
      throw new AppError("Media URL and type are required", 400);
    }

    // Buscar ticket
    const ticket = await Ticket.findByPk(ticketId, {
      include: [Contact, Whatsapp]
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (!ticket.whatsapp) {
      throw new AppError("WhatsApp channel not found", 404);
    }

    if (ticket.whatsapp.wabaBSP !== "gupshup") {
      throw new AppError("This ticket is not a Gupshup channel", 400);
    }

    // Validar tipo de mídia
    const validTypes = ["image", "video", "audio", "document"];
    if (!validTypes.includes(mediaType)) {
      throw new AppError(`Invalid media type. Valid types: ${validTypes.join(", ")}`, 400);
    }

    // Enviar mensagem
    await SendMediaMessageService({
      mediaUrl,
      mediaType: mediaType as any,
      caption,
      fileName,
      ticketId: parseInt(ticketId),
      contact: ticket.contact,
      whatsapp: ticket.whatsapp
    });

    return res.status(200).json({ message: "Media sent successfully" });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] sendMediaMessage error: ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Lista templates disponíveis
 */
export const listTemplates = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { whatsappId } = req.params;

    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new AppError("WhatsApp channel not found", 404);
    }

    if (whatsapp.wabaBSP !== "gupshup") {
      throw new AppError("This is not a Gupshup channel", 400);
    }

    // Inicializar cliente
    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    const templates = await client.getTemplates();

    return res.status(200).json({ templates });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] listTemplates error: ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Envia mensagem de template
 */
export const sendTemplate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { templateName, languageCode, params } = req.body;

    if (!templateName) {
      throw new AppError("Template name is required", 400);
    }

    // Buscar ticket
    const ticket = await Ticket.findByPk(ticketId, {
      include: [Contact, Whatsapp]
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (!ticket.whatsapp) {
      throw new AppError("WhatsApp channel not found", 404);
    }

    if (ticket.whatsapp.wabaBSP !== "gupshup") {
      throw new AppError("This ticket is not a Gupshup channel", 400);
    }

    // Inicializar cliente
    const client = new GupshupClient({
      apiKey: ticket.whatsapp.tokenAPI,
      appName: ticket.whatsapp.gupshupAppName,
      sourcePhone: ticket.whatsapp.number
    });

    const response = await client.sendTemplate(
      ticket.contact.number,
      templateName,
      languageCode || "pt_BR",
      params
    );

    return res.status(200).json({
      message: "Template sent successfully",
      messageId: response.messageId
    });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] sendTemplate error: ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Obtém informações sobre o número
 */
export const getNumberInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { whatsappId } = req.params;

    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new AppError("WhatsApp channel not found", 404);
    }

    if (whatsapp.wabaBSP !== "gupshup") {
      throw new AppError("This is not a Gupshup channel", 400);
    }

    // Inicializar cliente
    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    // Obter opt-in users como métrica de uso
    const optInUsers = await client.getOptInUsers();

    return res.status(200).json({
      number: whatsapp.number,
      name: whatsapp.name,
      status: whatsapp.status,
      isDefault: whatsapp.isDefault,
      optInUsersCount: optInUsers.length,
      webhookUrl: whatsapp.UrlWabaWebHook
    });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] getNumberInfo error: ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};
```

### Arquivo: `backend/src/routes/gupshupRoutes.ts`

```typescript
import express from "express";
import * as GupshupWebhookController from "../controllers/GupshupWebhookController";
import * as GupshupMessageController from "../controllers/GupshupMessageController";
import isAuth from "../middleware/isAuth";

const gupshupRoutes = express.Router();

// ============================================
// WEBHOOKS (Público - Sem autenticação)
// ============================================

// Verificação do webhook (GET)
gupshupRoutes.get(
  "/wabahooks/gupshup/verify/:token",
  GupshupWebhookController.verifyWebhook
);

// Recebimento de webhooks (POST)
gupshupRoutes.post(
  "/wabahooks/gupshup/:token",
  GupshupWebhookController.receiveWebhook
);

// Status do webhook (GET)
gupshupRoutes.get(
  "/wabahooks/gupshup/status/:token",
  GupshupWebhookController.getWebhookStatus
);

// ============================================
// API MESSAGES (Autenticado)
// ============================================

// Enviar mensagem de texto
gupshupRoutes.post(
  "/gupshup/messages/text/:ticketId",
  isAuth,
  GupshupMessageController.sendTextMessage
);

// Enviar mensagem de mídia
gupshupRoutes.post(
  "/gupshup/messages/media/:ticketId",
  isAuth,
  GupshupMessageController.sendMediaMessage
);

// Enviar template
gupshupRoutes.post(
  "/gupshup/messages/template/:ticketId",
  isAuth,
  GupshupMessageController.sendTemplate
);

// Listar templates
gupshupRoutes.get(
  "/gupshup/templates/:whatsappId",
  isAuth,
  GupshupMessageController.listTemplates
);

// Informações do número
gupshupRoutes.get(
  "/gupshup/info/:whatsappId",
  isAuth,
  GupshupMessageController.getNumberInfo
);

export default gupshupRoutes;
```

### Arquivo: `backend/src/helpers/GupshupMediaHelper.ts`

```typescript
import axios from "axios";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";

interface DownloadedMedia {
  filename: string;
  originalname: string;
  mimeType: string;
  path: string;
  buffer: Buffer;
}

/**
 * Faz download de mídia do URL fornecido pelo Gupshup
 * @param mediaUrl - URL da mídia
 * @returns Dados da mídia baixada
 */
export const downloadMedia = async (
  mediaUrl: string
): Promise<DownloadedMedia> => {
  try {
    logger.info(`[GupshupMediaHelper] Downloading media from: ${mediaUrl}`);

    const response = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      timeout: 30000 // 30 segundos
    });

    const contentType = response.headers["content-type"];
    const buffer = Buffer.from(response.data, "binary");

    // Determinar extensão do arquivo
    let extension = ".bin";
    if (contentType) {
      const mimeToExt: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "video/ogg": ".ogg",
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "text/plain": ".txt"
      };
      extension = mimeToExt[contentType] || ".bin";
    }

    const filename = `gupshup_${Date.now()}${extension}`;
    const originalname = filename;

    logger.info(`[GupshupMediaHelper] Downloaded: ${filename} (${buffer.length} bytes)`);

    return {
      filename,
      originalname,
      mimeType: contentType || "application/octet-stream",
      path: path.join("public", filename),
      buffer
    };
  } catch (error: any) {
    logger.error(`[GupshupMediaHelper] Download error: ${error.message}`);
    throw error;
  }
};

/**
 * Salva a mídia no disco
 * @param media - Dados da mídia
 * @returns Caminho do arquivo salvo
 */
export const saveMedia = async (media: DownloadedMedia): Promise<string> => {
  try {
    const publicPath = path.resolve(__dirname, "..", "..", "public");
    
    // Criar diretório se não existir
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const filePath = path.join(publicPath, media.filename);
    fs.writeFileSync(filePath, media.buffer);

    logger.info(`[GupshupMediaHelper] Media saved to: ${filePath}`);
    return filePath;
  } catch (error: any) {
    logger.error(`[GupshupMediaHelper] Save error: ${error.message}`);
    throw error;
  }
};
```

### Atualização: `backend/src/routes/index.ts`

Adicione a importação e registro das rotas:

```typescript
// ... imports existentes
import gupshupRoutes from "./gupshupRoutes";

// ... código existente

// Registrar rotas
routes.use(gupshupRoutes);
```

---

## FASE 5: Frontend

### Arquivo: `frontend/src/pages/connections/GupshupConfig.vue`

```vue
<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Configuração Gupshup WhatsApp API</div>
        <div class="text-subtitle2">API Oficial do WhatsApp</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Nome da Conexão -->
          <q-input
            v-model="form.name"
            label="Nome da Conexão *"
            outlined
            :rules="[val => !!val || 'Nome é obrigatório']"
          />

          <!-- Número do WhatsApp Business -->
          <q-input
            v-model="form.number"
            label="Número do WhatsApp Business *"
            outlined
            mask="#############"
            hint="Apenas números, com código do país (ex: 5511999999999)"
            :rules="[val => !!val || 'Número é obrigatório']"
          />

          <!-- API Key -->
          <q-input
            v-model="form.tokenAPI"
            label="API Key *"
            outlined
            type="password"
            :rules="[val => !!val || 'API Key é obrigatória']"
          >
            <template v-slot:hint>
              Obtenha no <a href="https://www.gupshup.io/whatsapp/dashboard" target="_blank">Dashboard Gupshup</a>
            </template>
          </q-input>

          <!-- App Name -->
          <q-input
            v-model="form.gupshupAppName"
            label="Nome do App *"
            outlined
            :rules="[val => !!val || 'Nome do App é obrigatório']"
          >
            <template v-slot:hint>
              Nome do aplicativo configurado no Gupshup
            </template>
          </q-input>

          <!-- Checkbox Padrão -->
          <q-checkbox
            v-model="form.isDefault"
            label="Definir como padrão"
          />

          <!-- Ações -->
          <div class="row q-gutter-sm">
            <q-btn
              label="Salvar"
              type="submit"
              color="primary"
              :loading="loading"
            />
            <q-btn
              label="Testar Conexão"
              color="secondary"
              @click="testConnection"
              :loading="testing"
            />
            <q-btn
              label="Cancelar"
              color="grey"
              flat
              @click="$router.back()"
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Informações -->
      <q-card-section class="bg-grey-1">
        <div class="text-subtitle2">Informações</div>
        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label>Webhook URL:</q-item-label>
              <q-item-label caption class="text-primary">{{ webhookUrl }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                icon="content_copy"
                size="sm"
                @click="copyToClipboard(webhookUrl)"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Status:</q-item-label>
              <q-item-label caption>
                <q-badge :color="statusColor">{{ statusText }}</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/boot/axios';

export default {
  name: 'GupshupConfig',
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    const loading = ref(false);
    const testing = ref(false);
    const connectionStatus = ref('DISCONNECTED');

    const form = ref({
      name: '',
      number: '',
      tokenAPI: '',
      gupshupAppName: '',
      isDefault: false,
      type: 'waba',
      wabaBSP: 'gupshup'
    });

    const isEditing = computed(() => !!route.params.id);

    const webhookUrl = computed(() => {
      const baseUrl = process.env.BACKEND_URL || window.location.origin;
      return `${baseUrl}/wabahooks/gupshup/{token}`;
    });

    const statusColor = computed(() => {
      const colors = {
        CONNECTED: 'positive',
        DISCONNECTED: 'negative',
        CONNECTING: 'warning',
        PENDING: 'grey'
      };
      return colors[connectionStatus.value] || 'grey';
    });

    const statusText = computed(() => {
      const texts = {
        CONNECTED: 'Conectado',
        DISCONNECTED: 'Desconectado',
        CONNECTING: 'Conectando...',
        PENDING: 'Pendente'
      };
      return texts[connectionStatus.value] || connectionStatus.value;
    });

    const fetchConnection = async () => {
      if (!isEditing.value) return;

      try {
        const { data } = await api.get(`/whatsapp/${route.params.id}`);
        form.value = {
          ...form.value,
          ...data
        };
        connectionStatus.value = data.status || 'DISCONNECTED';
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar conexão'
        });
      }
    };

    const onSubmit = async () => {
      loading.value = true;
      try {
        const url = isEditing.value
          ? `/whatsapp/${route.params.id}`
          : '/whatsapp';
        const method = isEditing.value ? 'put' : 'post';

        await api[method](url, form.value);

        $q.notify({
          type: 'positive',
          message: isEditing.value
            ? 'Conexão atualizada com sucesso!'
            : 'Conexão criada com sucesso!'
        });

        router.push('/connections');
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao salvar conexão'
        });
      } finally {
        loading.value = false;
      }
    };

    const testConnection = async () => {
      if (!form.value.tokenAPI || !form.value.gupshupAppName) {
        $q.notify({
          type: 'warning',
          message: 'Preencha API Key e Nome do App primeiro'
        });
        return;
      }

      testing.value = true;
      try {
        // Implementar teste de conexão com a API
        await api.post('/gupshup/test', {
          tokenAPI: form.value.tokenAPI,
          gupshupAppName: form.value.gupshupAppName
        });

        $q.notify({
          type: 'positive',
          message: 'Conexão testada com sucesso!'
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Falha no teste de conexão'
        });
      } finally {
        testing.value = false;
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      $q.notify({
        type: 'positive',
        message: 'Copiado para a área de transferência!'
      });
    };

    onMounted(() => {
      fetchConnection();
    });

    return {
      form,
      loading,
      testing,
      webhookUrl,
      statusColor,
      statusText,
      isEditing,
      onSubmit,
      testConnection,
      copyToClipboard
    };
  }
};
</script>
```

---

## FASE 6: Atualizações Necessárias nos Arquivos Existentes

### Atualização: `backend/src/models/Whatsapp.ts`

Adicione o campo `gupshupAppName` ao modelo:

```typescript
// Após a linha 142, adicione:

@Column(DataType.TEXT)
gupshupAppName: string;
```

### Atualização: `backend/src/services/WhatsappService/CreateWhatsAppService.ts`

Adicione suporte ao campo `gupshupAppName`:

```typescript
// Na interface Request, adicione:
interface Request {
  // ... campos existentes
  gupshupAppName?: string;
}

// Nos parâmetros da função, adicione:
const CreateWhatsAppService = async ({
  // ... campos existentes
  gupshupAppName,
}: Request): Promise<Response> => {

// Adicione validação para Gupshup:
if (type === "waba" && wabaBSP === "gupshup" && (!tokenAPI || !gupshupAppName)) {
  throw new AppError("Gupshup: favor informar o Token API e o Nome do App");
}

// No create, adicione:
const whatsapp = await Whatsapp.create({
  // ... campos existentes
  gupshupAppName,
});
```

### Atualização: `backend/src/services/WhatsappService/UpdateWhatsAppService.ts`

Adicione suporte ao campo `gupshupAppName` da mesma forma.

### Atualização: `backend/src/services/WhatsappService/ShowWhatsAppService.ts`

Adicione `gupshupAppName` na lista de atributos retornados.

### Atualização: Migration

Crie uma migration para adicionar o campo:

```typescript
// backend/src/database/migrations/20250219120000-add-gupshup-app-name.ts
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "gupshupAppName", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "gupshupAppName");
  }
};
```

---

## Configuração do Gupshup no Painel

### Passo 1: Criar App no Gupshup

1. Acesse https://www.gupshup.io/whatsapp/dashboard
2. Clique em "Create App"
3. Preencha as informações necessárias
4. Obtenha o **API Key** e **App Name**

### Passo 2: Configurar Webhook

1. No painel Gupshup, vá em **Integration > Webhooks**
2. Configure a URL de callback:
   ```
   https://seu-dominio.com/wabahooks/gupshup/{token}
   ```
3. O token será gerado automaticamente ao criar a conexão no Izing
4. Selecione os eventos:
   - ✅ Delivery Events
   - ✅ Inbound Messages
   - ✅ User Events (opcional)

### Passo 3: Configurar Templates

1. No painel Gupshup, vá em **Templates**
2. Crie seus templates de mensagem
3. Aguarde aprovação da Meta

### Passo 4: Opt-in de Usuários

Para enviar mensagens fora da janela de 24h, é necessário opt-in:

- Via link de opt-in
- Via API (implementado em `GupshupClient.optInUser`)
- Via QR Code

---

## Testando a Integração

### Teste 1: Criar Conexão

```bash
curl -X POST http://localhost:3000/whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Gupshup Test",
    "type": "waba",
    "wabaBSP": "gupshup",
    "number": "5511999999999",
    "tokenAPI": "sua_api_key",
    "gupshupAppName": "seu_app_name",
    "isDefault": false
  }'
```

### Teste 2: Enviar Mensagem

```bash
curl -X POST http://localhost:3000/gupshup/messages/text/{ticketId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "message": "Olá! Esta é uma mensagem de teste."
  }'
```

### Teste 3: Simular Webhook (Local)

```bash
curl -X POST http://localhost:3000/wabahooks/gupshup/{token} \
  -H "Content-Type: application/json" \
  -d '{
    "app": "seu_app_name",
    "timestamp": 1640000000000,
    "version": 2,
    "type": "message",
    "payload": {
      "id": "test_message_id",
      "source": "5511888888888",
      "type": "text",
      "text": "Mensagem de teste",
      "sender": {
        "phone": "5511888888888",
        "name": "Test User",
        "country_code": "55",
        "dial_code": "11888888888"
      },
      "timestamp": "1640000000"
    }
  }'
```

---

## Resolução de Problemas

### Erro: "Invalid token"

- Verifique se o token está correto
- Certifique-se de que a conexão foi criada com `wabaBSP: "gupshup"`

### Erro: "Failed to send message"

- Verifique se o número está no formato correto (sem +, com código do país)
- Verifique se o usuário deu opt-in
- Verifique se o template está aprovado (para mensagens HSM)

### Erro: "Webhook not received"

- Verifique se a URL está acessível externamente
- Verifique se o SSL está configurado corretamente
- Verifique os logs do servidor

### Mensagens não aparecem no chat

- Verifique se o `GupshupMessageListener` está processando corretamente
- Verifique os logs do `FindOrCreateTicketService`
- Verifique se o socket está emitindo eventos

---

## Próximos Passos

Após implementar a integração básica, considere adicionar:

1. **Suporte a Botões Interativos**
2. **Suporte a Listas de Opções**
3. **Analytics e Métricas**
4. **Automação de Opt-in**
5. **Templates com Mídia**
6. **Conversas de 24h (Session Messages)**
7. **Suporte a Múltiplos Números**

---

**Documentação criada em:** Fevereiro 2025  
**Versão:** 1.0.0  
**Compatível com:** Izing Open.IO



