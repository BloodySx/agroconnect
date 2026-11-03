import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { styles } from '../styles';

interface ActionItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  highlighted?: boolean;
}

export default function ActionItem({
  icon,
  title,
  description,
  onPress,
  highlighted = false,
}: ActionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionItem,
        highlighted
          ? styles.actionItemHighlighted
          : styles.actionItemSecondary,
      ]}
    >
      {/* ÍCONE */}
      <View
        style={[
          styles.actionIconContainer,
          highlighted && styles.actionIconContainerHighlighted,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={34}
          color={highlighted ? '#FFFFFF' : '#397653'}
        />
      </View>

      {/* TEXTO */}
      <View style={styles.actionTextContainer}>
        <Text
          style={[
            styles.actionTitle,
            !highlighted && styles.actionTitleSecondary,
          ]}
        >
          {title}
        </Text>

        {description !== '' && (
          <Text
            style={[
              styles.actionDescription,
              !highlighted && styles.actionDescriptionSecondary,
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {/* SETA */}
      <View style={styles.actionArrow}>
        <Text style={styles.actionArrowText}>›</Text>
      </View>
    </Pressable>
  );
}