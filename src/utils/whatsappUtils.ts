import {Alert, Linking} from 'react-native';

/**
 * Predefined WhatsApp message templates
 */
export const WHATSAPP_MESSAGES = {
  GENERAL_INQUIRY: "Hi, I'd like to chat with an agent.",
  AGENT_HELP: "Hi, I'd like to speak with an agent.",
  PROPERTY_INQUIRY: "Hello, I have a query. Could you please help me?",
  PROPERTY_SPECIFIC: (propertyName: string) => 
    `Hi, I'd like to chat with an agent about ${propertyName}. Could you please help me?`,
  AGENT_SPECIFIC: (agentName: string) => 
    `Hi ${agentName}, I'd like to speak with an agent about this property. Could you please help me?`,
};

/**
 * Format phone number for WhatsApp
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (cleanNumber.startsWith('91')) {
    return cleanNumber;
  } else {
    return `91${cleanNumber}`;
  }
};

/**
 * Open WhatsApp with predefined message
 */
export const openWhatsApp = async (
  phoneNumber: string, 
  message: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    if (!phoneNumber) {
      const errorMsg = 'WhatsApp number not available';
      onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    
    // Try multiple URL formats for better compatibility
    // Don't rely on canOpenURL as it's unreliable for WhatsApp on Android
    const whatsappURLs = [
      `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`,
      `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`,
      `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`
    ];
    
    console.log('Opening WhatsApp:', {
      originalNumber: phoneNumber,
      formattedNumber,
      message,
      urls: whatsappURLs
    });

    // Try each URL format until one works
    let opened = false;
    let lastError = null;
    
    for (const url of whatsappURLs) {
      try {
        console.log('Trying WhatsApp URL:', url);
        await Linking.openURL(url);
        onSuccess?.();
        opened = true;
        console.log('WhatsApp opened successfully with URL:', url);
        break;
      } catch (urlError) {
        console.log('Failed to open with URL:', url, urlError);
        lastError = urlError;
        continue;
      }
    }
    
    if (!opened) {
      console.error('All WhatsApp URLs failed. Last error:', lastError);
      const errorMsg = 'WhatsApp is not installed on this device or unable to open WhatsApp';
      onError?.(errorMsg);
      Alert.alert(
        'WhatsApp Not Available', 
        'Please make sure WhatsApp is installed on your device, or try copying the phone number: ' + formattedNumber,
        [
          {
            text: 'Copy Number',
            onPress: () => {
              // You can add clipboard functionality here if needed
              console.log('Phone number to copy:', formattedNumber);
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    }
    
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    const errorMsg = 'Unable to open WhatsApp';
    onError?.(errorMsg);
    Alert.alert('Error', errorMsg);
  }
};

/**
 * Open WhatsApp for property inquiry
 */
export const openWhatsAppForProperty = async (
  phoneNumber: string,
  propertyName?: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  const message = propertyName 
    ? WHATSAPP_MESSAGES.PROPERTY_SPECIFIC(propertyName)
    : WHATSAPP_MESSAGES.PROPERTY_INQUIRY;
    
  return openWhatsApp(phoneNumber, message, onSuccess, onError);
};

/**
 * Open WhatsApp for agent inquiry
 */
export const openWhatsAppForAgent = async (
  phoneNumber: string,
  agentName?: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  const message = agentName 
    ? WHATSAPP_MESSAGES.AGENT_SPECIFIC(agentName)
    : WHATSAPP_MESSAGES.AGENT_HELP;
    
  return openWhatsApp(phoneNumber, message, onSuccess, onError);
};
