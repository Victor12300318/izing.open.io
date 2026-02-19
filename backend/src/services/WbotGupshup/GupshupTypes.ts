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
  id: string;
  gsId: string;
  externalId?: string;
}

/**
 * Payload de mensagem recebida
 */
export interface GupshupPayload {
  id: string;
  type: GupshupMessageType;
  
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
  payload?: string;
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
    id: string;
    gsId: string;
    externalId?: string;
    type: GupshupMessageType;
    destination: string;
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
    cause?: string;
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
  source: string;
  destination: string;
  "src.name"?: string;
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
    template: string;
    language?: string;
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
  tokenAPI: string;
  gupshupAppName: string;
  number: string;
}
