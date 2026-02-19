import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import socketEmit from "../../helpers/socketEmit";
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
    const { downloadMedia } = await import("../../helpers/GupshupMediaHelper");
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
};

export default GupshupMessageListener;
