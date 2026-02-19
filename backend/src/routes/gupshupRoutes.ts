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

// Testar conexão
gupshupRoutes.post(
  "/gupshup/test",
  isAuth,
  GupshupMessageController.testConnection
);

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
