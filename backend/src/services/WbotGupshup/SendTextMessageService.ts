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
    const ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [Contact, User]
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    let body = pupa(message || "", {
      protocol: ticket.protocol || "",
      name: ticket.contact?.name || contact.name || "",
    });

    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

    const isHSM = !ticket.isWithin24h;

    const response = await client.sendText(
      contact.number,
      body,
      isHSM
    );

    if (response.status === "submitted") {
      await CreateMessageService({
        id: response.messageId || `gupshup_${Date.now()}`,
        body,
        contactId: contact.id,
        ticketId,
        fromMe: true,
        tenantId: whatsapp.tenantId
      });

      await ticket.update({
        lastMessage: body,
        answered: true
      });

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
