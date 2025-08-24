import {Linking} from 'react-native';

/**
 * Simple WhatsApp test utility for debugging
 * This bypasses all checks and tries to open WhatsApp directly
 */
export const testWhatsApp = async (phoneNumber: string, message: string = "Test message") => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
  
  const urls = [
    `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`,
    `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`,
    `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`
  ];
  
  console.log('=== WhatsApp Test Debug ===');
  console.log('Original number:', phoneNumber);
  console.log('Formatted number:', formattedNumber);
  console.log('Message:', message);
  console.log('URLs to try:', urls);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`Trying URL ${i + 1}:`, url);
      await Linking.openURL(url);
      console.log(`SUCCESS: WhatsApp opened with URL ${i + 1}`);
      return true;
    } catch (error) {
      console.log(`FAILED: URL ${i + 1} failed:`, error);
    }
  }
  
  console.log('ERROR: All URLs failed');
  return false;
};

/**
 * Test with the exact same data from your log
 */
export const testWithLogData = async () => {
  return testWhatsApp(
    "+919824223344", 
    "Hi Chhaya, I'd like to speak with an agent about this property. Could you please help me?"
  );
};
