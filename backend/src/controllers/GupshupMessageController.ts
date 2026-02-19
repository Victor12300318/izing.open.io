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

    const validTypes = ["image", "video", "audio", "document"];
    if (!validTypes.includes(mediaType)) {
      throw new AppError(`Invalid media type. Valid types: ${validTypes.join(", ")}`, 400);
    }

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

/**
 * Testar conexão com Gupshup
 * Usado pelo frontend para validar credenciais antes de salvar
 */
export const testConnection = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tokenAPI, gupshupAppName } = req.body;

    if (!tokenAPI || !gupshupAppName) {
      throw new AppError("API Key e Nome do App são obrigatórios", 400);
    }

    // Inicializar cliente com dados de teste
    const client = new GupshupClient({
      apiKey: tokenAPI,
      appName: gupshupAppName,
      sourcePhone: "0000000000" // Número fictício apenas para teste
    });

    // Tentar obter templates para validar credenciais
    await client.getTemplates();

    return res.status(200).json({
      message: "Conexão com Gupshup testada com sucesso",
      status: "connected"
    });
  } catch (error: any) {
    logger.error(`[GupshupMessageController] testConnection error: ${error.message}`);
    throw new AppError(
      error.message || "Falha ao conectar com Gupshup. Verifique suas credenciais.",
      401
    );
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

    const client = new GupshupClient({
      apiKey: whatsapp.tokenAPI,
      appName: whatsapp.gupshupAppName,
      sourcePhone: whatsapp.number
    });

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
