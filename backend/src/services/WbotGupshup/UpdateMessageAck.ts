import Message from "../../models/Message";
import { logger } from "../../utils/logger";

/**
 * Atualiza o status de uma mensagem
 * @param messageId - ID da mensagem no Gupshup (gsId)
 * @param status - Novo status
 */
const UpdateMessageAck = async (messageId: string, status: string): Promise<void> => {
  try {
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
