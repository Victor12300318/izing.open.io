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

    const whatsapp = await Whatsapp.findOne({
      where: { tokenHook: token, wabaBSP: "gupshup" }
    });

    if (!whatsapp) {
      logger.warn(`[GupshupWebhookController] Invalid token: ${token}`);
      return res.status(403).json({ message: "Invalid token" });
    }

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

    const whatsapp = await Whatsapp.findOne({
      where: { tokenHook: token, wabaBSP: "gupshup" }
    });

    if (!whatsapp) {
      logger.warn(`[GupshupWebhookController] Invalid token: ${token}`);
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).end();

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
