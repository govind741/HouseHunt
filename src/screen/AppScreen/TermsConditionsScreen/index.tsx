import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {BASE_URL} from '../../../constant/urls';
import axios from 'axios';

const TermsConditionsScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [useWebView, setUseWebView] = useState(false);

  const termsUrl = `${BASE_URL}v1/auth/terms`;

  // Helper function to extract text from Draft.js content
  const extractTextFromStructuredContent = (contentString: string): string => {
    try {
      const data = JSON.parse(contentString);
      if (data && data.blocks && Array.isArray(data.blocks)) {
        return data.blocks
          .map((block: any) => block.text || '')
          .filter((text: string) => text.trim().length > 0)
          .join('\n\n');
      }
      return contentString;
    } catch (error) {
      return contentString;
    }
  };

  const fetchTermsContent = async () => {
    try {
      setLoading(true);
      setError(false);
      
      console.log('Fetching Terms & Conditions content from:', termsUrl);
      const response = await axios.get(termsUrl);
      
      console.log('Terms & Conditions API Response Status:', response.status);
      
      if (response.data) {
        let content = '';
        let isHtml = false;
        
        if (typeof response.data === 'string') {
          content = response.data;
          isHtml = content.includes('<html>') || (content.includes('<') && content.includes('>'));
        } else if (typeof response.data === 'object') {
          let dataObj = response.data;
          
          if (dataObj.data && typeof dataObj.data === 'object') {
            dataObj = dataObj.data;
          }
          
          if (dataObj.data && Array.isArray(dataObj.data) && dataObj.data.length > 0) {
            const firstItem = dataObj.data[0];
            if (firstItem && firstItem.content) {
              content = extractTextFromStructuredContent(firstItem.content);
            } else if (firstItem && firstItem.text) {
              content = firstItem.text;
            } else {
              content = 'No content available';
            }
          } else if (dataObj.content) {
            content = extractTextFromStructuredContent(dataObj.content);
          } else {
            content = 'No content available';
          }
          
          isHtml = typeof content === 'string' && (content.includes('<html>') || (content.includes('<') && content.includes('>')));
        } else {
          content = String(response.data);
        }
        
        content = String(content || '');
        
        if (content && content.trim().length > 0) {
          setHtmlContent(content);
          setUseWebView(isHtml);
          setError(false);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching Terms & Conditions content:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermsContent();
  }, []);

  const handleRetry = () => {
    fetchTermsContent();
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
      <MagicText style={styles.loadingText}>Loading Terms & Conditions...</MagicText>
    </View>
  );

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <MagicText key={index} style={[styles.contentText, styles.boldText]}>
            {boldText}
          </MagicText>
        );
      }
      return (
        <MagicText key={index} style={styles.contentText}>
          {part}
        </MagicText>
      );
    });
  };

  const renderHtmlContent = () => {
    if (useWebView && htmlContent) {
      const fullHtmlContent = htmlContent.includes('<html>') 
        ? htmlContent 
        : `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Terms & Conditions</title>
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
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

      return (
        <WebView
          source={{html: fullHtmlContent}}
          style={styles.webView}
          scalesPageToFit={true}
          showsVerticalScrollIndicator={false}
          onError={() => setUseWebView(false)}
          onLoadEnd={() => console.log('WebView loaded successfully')}
        />
      );
    } else {
      const contentLines = htmlContent.split('\n\n').filter(line => line.trim());
      
      return (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.textContent}>
            <MagicText style={styles.contentTitle}>Terms & Conditions</MagicText>
            {contentLines.length > 0 ? (
              contentLines.map((line, index) => (
                <View key={index} style={styles.paragraphContainer}>
                  {renderFormattedText(line)}
                </View>
              ))
            ) : (
              <MagicText style={styles.contentText}>
                {`Welcome to our real estate platform. By using our services, you agree to these terms and conditions.

1. Acceptance of Terms
By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily use our platform for personal, non-commercial transitory viewing only.

3. User Account
• You are responsible for maintaining the confidentiality of your account
• You must provide accurate and complete information
• You are responsible for all activities under your account

4. Property Listings
• All property information is provided by third-party agents
• We do not guarantee the accuracy of property details
• Property availability is subject to change

5. User Conduct
You agree not to:
• Use the service for any unlawful purpose
• Interfere with or disrupt the service
• Attempt to gain unauthorized access to any portion of the service

6. Privacy
Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.

7. Limitation of Liability
We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

8. Contact Information
For questions about these Terms & Conditions, please contact our support team.

Last updated: ${new Date().toLocaleDateString()}`}
              </MagicText>
            )}
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.headerTitleContainer}>
          <MagicText style={styles.headerTitle}>Terms & Conditions</MagicText>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? renderLoading() : error ? renderError() : renderHtmlContent()}
      </View>
    </SafeAreaView>
  );
};

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
    marginRight: 40,
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
  boldText: {
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  paragraphContainer: {
    marginBottom: 16,
  },
});

export default TermsConditionsScreen;
