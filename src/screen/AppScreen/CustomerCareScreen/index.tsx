import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {BASE_URL} from '../../../constant/urls';

const CustomerCareScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const customerCareUrl = `${BASE_URL}v1/auth/customer-care`;

  const handleRetry = () => {
    setLoading(true);
    setError(false);
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
        {loading && renderLoading()}
        {error ? renderError() : (
          <WebView
            source={{uri: customerCareUrl}}
            style={styles.webView}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
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
});

export default CustomerCareScreen;
