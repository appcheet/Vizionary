import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';

interface CustomCardViewProps {
  title: string;
  description?: string;
  type: string;
  children: React.ReactNode;
  onPress?: (type: string, event: GestureResponderEvent) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomCardView: React.FC<CustomCardViewProps> = ({
  title,
  description,
  type,
  children,
  onPress,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      <View style={styles.content}>
        {children}
      </View>

      {onPress && <TouchableOpacity
        style={styles.button}
        onPress={(e) => {
          if (onPress) {
            onPress(type, e);
          }
        }}
      >
        <Text style={styles.buttonText}>See More Examples</Text>
      </TouchableOpacity>}
    </View>
  );
};

export default CustomCardView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 0,
   alignSelf: 'flex-start',
  },
  content: {
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});
