import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface FindOrCreateContactRequest {
  name: string;
  firstName: string;
  lastName?: string;
  phone: string;
  countryCode: string;
  dialCode: string;
  profilePicUrl?: string;
  whatsapp: Whatsapp;
  tenantId: number;
}

/**
 * Encontra ou cria um contato baseado nos dados do Gupshup
 */
const FindOrCreateContactService = async ({
  name,
  firstName,
  lastName,
  phone,
  countryCode,
  dialCode,
  profilePicUrl,
  whatsapp,
  tenantId
}: FindOrCreateContactRequest): Promise<Contact> => {
  try {
    let number = phone;
    if (!number.startsWith("+") && !number.startsWith(countryCode)) {
      number = `${countryCode}${dialCode}`;
    }

    let contact = await Contact.findOne({
      where: { number, tenantId }
    });

    if (contact) {
      if (profilePicUrl && !contact.profilePicUrl) {
        await contact.update({ profilePicUrl });
      }
      logger.info(`[FindOrCreateContactService] Contact found: ${number}`);
      return contact;
    }

    contact = await Contact.create({
      number,
      name: name || `${firstName} ${lastName || ""}`.trim(),
      profilePicUrl,
      tenantId,
      whatsappId: whatsapp.id
    });

    logger.info(`[FindOrCreateContactService] Contact created: ${number}`);
    return contact;
  } catch (error: any) {
    logger.error(`[FindOrCreateContactService] Error: ${error.message}`);
    throw error;
  }
};

export default FindOrCreateContactService;
