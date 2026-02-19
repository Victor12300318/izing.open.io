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
      const formData = new FormData();
      
      formData.append("channel", message.channel);
      formData.append("source", message.source);
      formData.append("destination", message.destination);
      
      if (message["src.name"]) {
        formData.append("src.name", message["src.name"]);
      }

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
