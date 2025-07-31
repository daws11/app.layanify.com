import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted string with IV prepended
 */
export function encryptField(text: string): string {
  if (!text) return '';
  
  try {
    const iv = CryptoJS.lib.WordArray.random(12); // 96-bit IV for GCM
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    });
    
    // Combine IV and encrypted data
    const combined = iv.concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypts a string using AES-256-GCM
 * @param encryptedText - Encrypted string with IV prepended
 * @returns Decrypted plain text
 */
export function decryptField(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedText);
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 3)); // 12 bytes = 3 words
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(3));
    
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({ ciphertext }),
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
      {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * Encrypts user's sensitive fields before saving to database
 * @param user - User object with potential sensitive fields
 * @returns User object with encrypted sensitive fields
 */
export function encryptUserSensitiveFields(user: any) {
  const encryptedUser = { ...user };
  
  if (encryptedUser.metaAccessToken) {
    encryptedUser.metaAccessToken = encryptField(encryptedUser.metaAccessToken);
  }
  
  if (encryptedUser.n8nApiKey) {
    encryptedUser.n8nApiKey = encryptField(encryptedUser.n8nApiKey);
  }
  
  // Encrypt WhatsApp Business API credentials
  if (encryptedUser.whatsappClientId) {
    encryptedUser.whatsappClientId = encryptField(encryptedUser.whatsappClientId);
  }
  
  if (encryptedUser.whatsappClientSecret) {
    encryptedUser.whatsappClientSecret = encryptField(encryptedUser.whatsappClientSecret);
  }
  
  if (encryptedUser.whatsappAccessToken) {
    encryptedUser.whatsappAccessToken = encryptField(encryptedUser.whatsappAccessToken);
  }
  
  if (encryptedUser.whatsappBusinessAccountId) {
    encryptedUser.whatsappBusinessAccountId = encryptField(encryptedUser.whatsappBusinessAccountId);
  }
  
  if (encryptedUser.whatsappPhoneNumberId) {
    encryptedUser.whatsappPhoneNumberId = encryptField(encryptedUser.whatsappPhoneNumberId);
  }
  
  return encryptedUser;
}

/**
 * Decrypts user's sensitive fields after retrieving from database
 * @param user - User object with encrypted sensitive fields
 * @returns User object with decrypted sensitive fields
 */
export function decryptUserSensitiveFields(user: any) {
  const decryptedUser = { ...user };
  
  if (decryptedUser.metaAccessToken) {
    try {
      decryptedUser.metaAccessToken = decryptField(decryptedUser.metaAccessToken);
    } catch (error) {
      console.error('Failed to decrypt metaAccessToken for user:', user._id);
      decryptedUser.metaAccessToken = null;
    }
  }
  
  if (decryptedUser.n8nApiKey) {
    try {
      decryptedUser.n8nApiKey = decryptField(decryptedUser.n8nApiKey);
    } catch (error) {
      console.error('Failed to decrypt n8nApiKey for user:', user._id);
      decryptedUser.n8nApiKey = null;
    }
  }
  
  // Decrypt WhatsApp Business API credentials
  if (decryptedUser.whatsappClientId) {
    try {
      decryptedUser.whatsappClientId = decryptField(decryptedUser.whatsappClientId);
    } catch (error) {
      console.error('Failed to decrypt whatsappClientId for user:', user._id);
      decryptedUser.whatsappClientId = null;
    }
  }
  
  if (decryptedUser.whatsappClientSecret) {
    try {
      decryptedUser.whatsappClientSecret = decryptField(decryptedUser.whatsappClientSecret);
    } catch (error) {
      console.error('Failed to decrypt whatsappClientSecret for user:', user._id);
      decryptedUser.whatsappClientSecret = null;
    }
  }
  
  if (decryptedUser.whatsappAccessToken) {
    try {
      decryptedUser.whatsappAccessToken = decryptField(decryptedUser.whatsappAccessToken);
    } catch (error) {
      console.error('Failed to decrypt whatsappAccessToken for user:', user._id);
      decryptedUser.whatsappAccessToken = null;
    }
  }
  
  if (decryptedUser.whatsappBusinessAccountId) {
    try {
      decryptedUser.whatsappBusinessAccountId = decryptField(decryptedUser.whatsappBusinessAccountId);
    } catch (error) {
      console.error('Failed to decrypt whatsappBusinessAccountId for user:', user._id);
      decryptedUser.whatsappBusinessAccountId = null;
    }
  }
  
  if (decryptedUser.whatsappPhoneNumberId) {
    try {
      decryptedUser.whatsappPhoneNumberId = decryptField(decryptedUser.whatsappPhoneNumberId);
    } catch (error) {
      console.error('Failed to decrypt whatsappPhoneNumberId for user:', user._id);
      decryptedUser.whatsappPhoneNumberId = null;
    }
  }
  
  return decryptedUser;
}
