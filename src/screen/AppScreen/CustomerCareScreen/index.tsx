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

const CustomerCareScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [useWebView, setUseWebView] = useState(false);

  const customerCareUrl = `${BASE_URL}v1/auth/contact-us`;

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

  const fetchCustomerCareContent = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await axios.get(customerCareUrl);
      
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
      console.error('Error fetching Customer Care content:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerCareContent();
  }, []);

  const handleRetry = () => {
    fetchCustomerCareContent();
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
              <title>Customer Care</title>
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
        />
      );
    } else {
      return (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.textContent}>
            <MagicText style={styles.contentTitle}>Customer Care</MagicText>
            <MagicText style={styles.contentText}>
              {htmlContent}
            </MagicText>
          </View>
        </ScrollView>
      );
    }
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
      <MagicText style={styles.loadingText}>Loading Customer Care...</MagicText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.headerTitleContainer}>
          <MagicText style={styles.headerTitle}>Customer Care</MagicText>
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
});

export default CustomerCareScreen;
