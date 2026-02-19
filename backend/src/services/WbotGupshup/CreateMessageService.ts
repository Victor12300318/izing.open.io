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
