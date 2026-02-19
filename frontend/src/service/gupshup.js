import request from 'src/service/request'

/**
 * Serviço para integração com Gupshup WhatsApp API
 */

// Testar conexão com Gupshup
export function TestarConexaoGupshup (data) {
  return request({
    url: '/gupshup/test',
    method: 'post',
    data
  })
}

// Obter informações do número
export function ObterInfoGupshup (whatsappId) {
  return request({
    url: `/gupshup/info/${whatsappId}`,
    method: 'get'
  })
}

// Listar templates disponíveis
export function ListarTemplatesGupshup (whatsappId) {
  return request({
    url: `/gupshup/templates/${whatsappId}`,
    method: 'get'
  })
}

// Enviar mensagem de texto
export function EnviarTextoGupshup (ticketId, data) {
  return request({
    url: `/gupshup/messages/text/${ticketId}`,
    method: 'post',
    data
  })
}

// Enviar mensagem de mídia
export function EnviarMidiaGupshup (ticketId, data) {
  return request({
    url: `/gupshup/messages/media/${ticketId}`,
    method: 'post',
    data
  })
}

// Enviar template
export function EnviarTemplateGupshup (ticketId, data) {
  return request({
    url: `/gupshup/messages/template/${ticketId}`,
    method: 'post',
    data
  })
}
