import Share from 'react-native-share';
import {Alert} from 'react-native';
import {BASE_URL} from '../constant/urls';

/**
 * Property share data interface
 */
export interface PropertyShareData {
  id?: number | string;
  title?: string;
  description?: string;
  agentName?: string;
  agencyName?: string;
  location?: string;
  price?: string | number;
  imageUrl?: string;
  phone?: string;
  whatsappNumber?: string;
}

/**
 * Generate property share URL
 */
export const generatePropertyShareURL = (propertyId?: number | string): string => {
  if (propertyId) {
    return `${BASE_URL}/property/${propertyId}`;
  }
  return `${BASE_URL}/properties`;
};

/**
 * Format property title for sharing
 */
export const formatPropertyTitle = (data: PropertyShareData): string => {
  const agencyName = data.agencyName || data.agentName;
  const location = data.location;
  
  if (agencyName && location) {
    return `${agencyName} - ${location}`;
  } else if (agencyName) {
    return agencyName;
  } else if (location) {
    return `Property in ${location}`;
  } else {
    return 'Property Details';
  }
};

/**
 * Format property description for sharing
 */
export const formatPropertyDescription = (data: PropertyShareData): string => {
  const parts: string[] = [];
  
  // Add title/agency name
  if (data.agencyName || data.agentName) {
    parts.push(`🏠 ${data.agencyName || data.agentName}`);
  }
  
  // Add location
  if (data.location) {
    parts.push(`📍 ${data.location}`);
  }
  
  // Add price if available
  if (data.price) {
    parts.push(`💰 Price: ${data.price}`);
  }
  
  // Add agent name if different from agency
  if (data.agentName && data.agencyName && data.agentName !== data.agencyName) {
    parts.push(`👤 Agent: ${data.agentName}`);
  }
  
  // Add contact info
  if (data.phone) {
    parts.push(`📞 Contact: ${data.phone}`);
  }
  
  // Add call to action
  parts.push('\n🔗 View full details and contact the agent!');
  
  return parts.join('\n');
};

/**
 * Get property image URL
 */
export const getPropertyImageURL = (data: PropertyShareData): string | undefined => {
  if (data.imageUrl) {
    // If it's already a full URL, return as is
    if (data.imageUrl.startsWith('http')) {
      return data.imageUrl;
    }
    // If it's a relative path, prepend BASE_URL
    return `${BASE_URL}${data.imageUrl}`;
  }
  return undefined;
};

/**
 * Share property details
 */
export const shareProperty = async (
  data: PropertyShareData,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    const title = formatPropertyTitle(data);
    const message = formatPropertyDescription(data);
    const url = generatePropertyShareURL(data.id);
    const imageUrl = getPropertyImageURL(data);
    
    console.log('Sharing property:', {
      title,
      message,
      url,
      imageUrl,
      originalData: data
    });
    
    // Create comprehensive share content
    const fullMessage = `${message}\n\n🔗 View Details: ${url}`;
    
    const shareOptions: any = {
      title: title,
      message: fullMessage,
      url: url,
    };
    
    // Try to include image if available
    if (imageUrl) {
      try {
        // Test if image URL is accessible
        console.log('Adding image to share:', imageUrl);
        shareOptions.urls = [imageUrl];
      } catch (imageError) {
        console.log('Image not accessible, sharing without image:', imageError);
      }
    }
    
    console.log('Final share options:', shareOptions);
    
    const result = await Share.open(shareOptions);
    
    console.log('Share result:', result);
    onSuccess?.();
    
  } catch (error: any) {
    console.error('Share error:', error);
    
    // Handle user cancellation (not an actual error)
    if (error?.message?.includes('User did not share') || 
        error?.error?.includes('cancelled') ||
        error?.message?.includes('cancelled')) {
      console.log('User cancelled sharing');
      return;
    }
    
    // If sharing with image fails, try without image
    if (error?.message?.includes('image') || error?.message?.includes('url')) {
      console.log('Retrying share without image...');
      try {
        const fallbackOptions = {
          title: formatPropertyTitle(data),
          message: `${formatPropertyDescription(data)}\n\n🔗 View Details: ${generatePropertyShareURL(data.id)}`,
          url: generatePropertyShareURL(data.id),
        };
        
        console.log('Fallback share options:', fallbackOptions);
        await Share.open(fallbackOptions);
        onSuccess?.();
        return;
      } catch (fallbackError) {
        console.error('Fallback share also failed:', fallbackError);
      }
    }
    
    const errorMsg = 'Unable to share property details';
    onError?.(errorMsg);
    Alert.alert('Share Error', errorMsg);
  }
};

/**
 * Share property from PropertyCard data
 */
export const sharePropertyFromCard = async (
  item: any,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  console.log('sharePropertyFromCard - Raw item data:', item);
  
  const shareData: PropertyShareData = {
    id: item.id || item.agent_id,
    agencyName: item.agency_name,
    agentName: item.name,
    location: item.agent_address || item.address,
    phone: item.phone || item.mobile || item.whatsapp_number,
    whatsappNumber: item.whatsapp_number,
    imageUrl: item.image_urls?.[0] || item.profile_image,
  };
  
  console.log('sharePropertyFromCard - Mapped share data:', shareData);
  
  return shareProperty(shareData, onSuccess, onError);
};

/**
 * Share property from PropertyDetail data
 */
export const sharePropertyFromDetail = async (
  agentDetails: any,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  console.log('sharePropertyFromDetail - Raw agentDetails:', agentDetails);
  
  const data = agentDetails?.data || agentDetails;
  console.log('sharePropertyFromDetail - Extracted data:', data);
  
  const shareData: PropertyShareData = {
    id: data?.id || data?.agent_id,
    agencyName: data?.agency_name,
    agentName: data?.name,
    location: data?.agent_address || data?.address,
    phone: data?.phone || data?.mobile || data?.whatsapp_number,
    whatsappNumber: data?.whatsapp_number,
    imageUrl: data?.image_urls?.[0] || data?.profile_image,
  };
  
  console.log('sharePropertyFromDetail - Mapped share data:', shareData);
  
  return shareProperty(shareData, onSuccess, onError);
};

/**
 * Test share functionality with sample data
 */
export const testShareFunctionality = async (): Promise<void> => {
  const testData: PropertyShareData = {
    id: '123',
    agencyName: 'Test Property Agency',
    agentName: 'John Doe',
    location: 'Mumbai, Maharashtra',
    phone: '+919876543210',
    price: '₹50,00,000',
  };
  
  console.log('Testing share functionality with data:', testData);
  
  await shareProperty(
    testData,
    () => console.log('Test share successful'),
    (error) => console.error('Test share failed:', error)
  );
};

/**
 * Share with specific social media platform
 */
export const shareToSpecificPlatform = async (
  data: PropertyShareData,
  platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram',
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    const title = formatPropertyTitle(data);
    const message = formatPropertyDescription(data);
    const url = generatePropertyShareURL(data.id);
    
    const shareOptions: any = {
      title: title,
      message: message,
      url: url,
    };
    
    // Set specific social platform
    switch (platform) {
      case 'whatsapp':
        shareOptions.social = Share.Social.WHATSAPP;
        break;
      case 'facebook':
        shareOptions.social = Share.Social.FACEBOOK;
        break;
      case 'twitter':
        shareOptions.social = Share.Social.TWITTER;
        break;
      case 'instagram':
        shareOptions.social = Share.Social.INSTAGRAM;
        break;
    }
    
    await Share.shareSingle(shareOptions);
    onSuccess?.();
    
  } catch (error) {
    console.error(`Share to ${platform} error:`, error);
    const errorMsg = `Unable to share to ${platform}`;
    onError?.(errorMsg);
    Alert.alert('Share Error', errorMsg);
  }
};
