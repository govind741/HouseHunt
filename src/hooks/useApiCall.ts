import {useState, useCallback} from 'react';
import Toast from 'react-native-toast-message';

interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiCallOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export const useApiCall = <T = any>(options: UseApiCallOptions = {}) => {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const execute = useCallback(
    async (apiFunction: () => Promise<T>): Promise<T | null> => {
      setState(prev => ({...prev, loading: true, error: null}));

      try {
        const result = await apiFunction();
        setState({data: result, loading: false, error: null});

        if (showSuccessToast) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: successMessage,
          });
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || 'An unexpected error occurred';
        setState(prev => ({...prev, loading: false, error: errorMessage}));

        if (showErrorToast) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
            visibilityTime: 4000,
          });
        }

        return null;
      }
    },
    [showSuccessToast, showErrorToast, successMessage],
  );

  const reset = useCallback(() => {
    setState({data: null, loading: false, error: null});
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
