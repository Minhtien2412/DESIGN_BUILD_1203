import React from 'react';
import { Text, View } from 'react-native';

/**
 * GlobalTextSafetyProvider - wraps the entire app to prevent text rendering errors
 */
export class GlobalTextSafetyProvider extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorCount: number }
> {
  private errorTimeoutId?: any;
  
  state = { hasError: false, errorCount: 0 };

  static getDerivedStateFromError(error: unknown) {
    const errorMessage = (error as any)?.message || '';
    const isTextError = errorMessage.includes('Text strings must be rendered') || 
                       errorMessage.includes('createTextInstance') ||
                       errorMessage.includes('text node');
    
    if (isTextError) {
      console.warn('[GlobalTextSafety] Text rendering error intercepted:', errorMessage);
      return { hasError: true };
    }
    
    // Re-throw non-text errors
    throw error;
  }

  componentDidCatch(error: unknown, info: any) {
    const errorMessage = (error as any)?.message || '';
    const isTextError = errorMessage.includes('Text strings must be rendered') || 
                       errorMessage.includes('createTextInstance') ||
                       errorMessage.includes('text node');

    if (isTextError) {
      console.warn('[GlobalTextSafety] Handling text error with immediate recovery');
      
      // Clear previous timeout
      if (this.errorTimeoutId) {
        clearTimeout(this.errorTimeoutId);
      }
      
      // Immediate recovery
      this.errorTimeoutId = setTimeout(() => {
        console.warn('[GlobalTextSafety] Recovering from text error...');
        this.setState(prevState => ({ 
          hasError: false, 
          errorCount: prevState.errorCount + 1 
        }));
      }, 10); // Very fast recovery
    }
  }

  componentWillUnmount() {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Ultra-minimal fallback during recovery
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <Text style={{ color: '#fff' }}>Initializing...</Text>
        </View>
      );
    }

    // Wrap children in a recovery-enabled container
    return (
      <View key={`recovery-${this.state.errorCount}`} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}

export default GlobalTextSafetyProvider;
