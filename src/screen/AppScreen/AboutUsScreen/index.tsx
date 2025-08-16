import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {AboutUsScreenProps} from '../../../types/appTypes';
import {BASE_URL} from '../../../constant/urls';
import axios from 'axios';

const AboutUsScreen = ({navigation}: AboutUsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [useWebView, setUseWebView] = useState(false);

  const aboutUsUrl = `${BASE_URL}v1/auth/about-us`;

  // Helper function to extract text from structured content
  const extractTextFromStructuredContent = (data: any): string => {
    try {
      // Handle Draft.js or similar block-based content
      if (data && typeof data === 'object') {
        // Check for blocks array (Draft.js format)
        if (data.blocks && Array.isArray(data.blocks)) {
          return data.blocks
            .map((block: any) => {
              if (block && block.text) {
                return block.text;
              }
              return '';
            })
            .filter((text: string) => text.trim().length > 0)
            .join('\n\n');
        }
        
        // Check for entityMap or other structured formats
        if (data.entityMap && data.blocks) {
          return data.blocks
            .map((block: any) => block.text || '')
            .filter((text: string) => text.trim().length > 0)
            .join('\n\n');
        }
        
        // Handle array of content blocks
        if (Array.isArray(data)) {
          return data
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (item && item.text) return item.text;
              if (item && item.content) return item.content;
              return '';
            })
            .filter((text: string) => text.trim().length > 0)
            .join('\n\n');
        }
        
        // Handle single content object
        if (data.text) return data.text;
        if (data.content) return data.content;
        if (data.description) return data.description;
      }
      
      return '';
    } catch (error) {
      console.error('Error extracting text from structured content:', error);
      return '';
    }
  };

  // Fetch content via API
  const fetchAboutUsContent = async () => {
    try {
      setLoading(true);
      setError(false);
      
      console.log('🔄 Fetching About Us content from:', aboutUsUrl);
      const response = await axios.get(aboutUsUrl);
      
      console.log('✅ About Us API Response Status:', response.status);
      console.log('✅ About Us API Response Data Type:', typeof response.data);
      console.log('✅ About Us API Response Data:', response.data);
      
      if (response.data) {
        let content = '';
        let isHtml = false;
        
        // Handle different response formats
        if (typeof response.data === 'string') {
          content = response.data;
          isHtml = content.includes('<html>') || (content.includes('<') && content.includes('>'));
        } else if (typeof response.data === 'object') {
          // Handle nested object structures
          let dataObj = response.data;
          
          // Check for nested data structure like {"data": {"data": [...]}, "success": true}
          if (dataObj.data && typeof dataObj.data === 'object') {
            dataObj = dataObj.data;
          }
          
          // Extract content from various possible fields
          if (dataObj.content) {
            content = dataObj.content;
          } else if (dataObj.data) {
            // Handle array or object data
            if (Array.isArray(dataObj.data)) {
              // If it's an array, try to extract content from first item or join items
              if (dataObj.data.length > 0) {
                const firstItem = dataObj.data[0];
                if (typeof firstItem === 'string') {
                  content = dataObj.data.join('\n');
                } else if (typeof firstItem === 'object') {
                  // Try to extract structured content first
                  const extractedText = extractTextFromStructuredContent(firstItem);
                  if (extractedText) {
                    content = extractedText;
                  } else {
                    content = firstItem.content || firstItem.text || firstItem.description || JSON.stringify(firstItem, null, 2);
                  }
                } else {
                  content = String(firstItem);
                }
              } else {
                content = 'No content available';
              }
            } else if (typeof dataObj.data === 'string') {
              content = dataObj.data;
            } else if (typeof dataObj.data === 'object') {
              // Try to extract structured content first
              const extractedText = extractTextFromStructuredContent(dataObj.data);
              if (extractedText) {
                content = extractedText;
              } else {
                content = dataObj.data.content || dataObj.data.text || dataObj.data.description || JSON.stringify(dataObj.data, null, 2);
              }
            } else {
              content = String(dataObj.data);
            }
          } else if (dataObj.message) {
            content = dataObj.message;
          } else if (dataObj.text) {
            content = dataObj.text;
          } else if (dataObj.description) {
            content = dataObj.description;
          } else {
            // Try to extract structured content from the entire object
            const extractedText = extractTextFromStructuredContent(dataObj);
            if (extractedText) {
              content = extractedText;
            } else {
              // Convert entire object to readable text
              content = JSON.stringify(dataObj, null, 2);
            }
          }
          
          isHtml = typeof content === 'string' && (content.includes('<html>') || (content.includes('<') && content.includes('>')));
        } else {
          content = String(response.data);
          isHtml = false;
        }
        
        // Ensure content is a string before calling substring
        content = String(content || '');
        
        console.log('📝 Processed content:', content.substring(0, 200) + '...');
        console.log('🏷️ Is HTML:', isHtml);
        
        if (content && content.trim().length > 0) {
          setHtmlContent(content);
          setUseWebView(isHtml);
          setError(false);
        } else {
          console.warn('⚠️ Empty content received');
          setError(true);
        }
      } else {
        console.warn('⚠️ No data in response');
        setError(true);
      }
    } catch (err) {
      console.error('❌ Error fetching About Us content:', err);
      if (err.response) {
        console.error('❌ Response status:', err.response.status);
        console.error('❌ Response data:', err.response.data);
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUsContent();
  }, []);

  const handleRetry = () => {
    fetchAboutUsContent();
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <MagicText style={styles.errorTitle}>Unable to Load Content</MagicText>
      <MagicText style={styles.errorMessage}>
        Please check your internet connection and try again.
      </MagicText>
      <View style={styles.retryButton}>
        <MagicText style={styles.retryText} onPress={handleRetry}>
          Retry
        </MagicText>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <MagicText style={styles.loadingText}>Loading About Us...</MagicText>
    </View>
  );

  const renderHtmlContent = () => {
    if (useWebView && htmlContent) {
      // Create a complete HTML document if the content is not already wrapped
      const fullHtmlContent = htmlContent.includes('<html>') 
        ? htmlContent 
        : `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>About Us</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: ${COLORS.WHITE};
                  color: ${COLORS.BLACK};
                  padding: 16px;
                  margin: 0;
                  line-height: 1.6;
                }
                h1, h2, h3, h4, h5, h6 {
                  color: ${COLORS.BLACK};
                  font-weight: 600;
                  margin-top: 20px;
                  margin-bottom: 10px;
                }
                p {
                  color: ${COLORS.TEXT_GRAY};
                  line-height: 1.6;
                  font-size: 16px;
                  margin-bottom: 12px;
                }
                a {
                  color: ${COLORS.PRIMARY};
                  text-decoration: none;
                }
                ul, ol {
                  color: ${COLORS.TEXT_GRAY};
                  padding-left: 20px;
                }
                li {
                  margin-bottom: 8px;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                .container {
                  max-width: 100%;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

      // Display HTML content using WebView
      return (
        <WebView
          source={{html: fullHtmlContent}}
          style={styles.webView}
          scalesPageToFit={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setUseWebView(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error:', nativeEvent);
            setUseWebView(false);
          }}
          onLoadEnd={() => {
            console.log('✅ WebView loaded successfully');
          }}
        />
      );
    } else {
      // Display plain text content
      return (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.textContent}>
            <MagicText style={styles.contentTitle}>About Us</MagicText>
            <MagicText style={styles.contentText}>
              {htmlContent || 'Welcome to our platform! We are dedicated to providing you with the best real estate services and helping you find your perfect home.\n\nOur team of experienced professionals is committed to making your property search and transaction process as smooth and efficient as possible.\n\nFor more detailed information, please contact our support team.'}
            </MagicText>
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.headerTitleContainer}>
          <MagicText style={styles.headerTitle}>About Us</MagicText>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? renderLoading() : error ? renderError() : renderHtmlContent()}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // Compensate for back button width
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: COLORS.WHITE,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  textContent: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 20,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    lineHeight: 24,
    textAlign: 'justify',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  fallbackContent: {
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 20,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
});

export default AboutUsScreen;
