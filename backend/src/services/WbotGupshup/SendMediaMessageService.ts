import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import GupshupClient from "./GupshupClient";
import CreateMessageService from "./CreateMessageService";
import { logger } from "../../utils/logger";
import socketEmit from "../../helpers/socketEmit";

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

    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    let response;

    switch (mediaType) {
      case "image":
        response = await client.sendImage(contact.number, mediaUrl, caption);
        break;
      
      case "video":
        response = await client.sendVideo(contact.number, mediaUrl, caption);
        break;
      
      case "audio":
        response = await client.sendAudio(contact.number, mediaUrl);
        break;
      
      case "document":
        response = await client.sendDocument(
          contact.number,
          mediaUrl,
          fileName || "document",
          caption
        );
        break;
      
      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }

    if (response.status === "submitted") {
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

      await ticket.update({
        lastMessage: `[${mediaType.toUpperCase()}] ${caption || ""}`,
        answered: true
      });

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
