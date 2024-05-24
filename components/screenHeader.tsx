import { Button, ButtonProps, styled, View, Text } from 'tamagui';
import { NativeStackHeaderProps } from '@react-navigation/native-stack/src/types';
import { getHeaderTitle, Header, HeaderBackButton } from '@react-navigation/elements';
import { router } from 'expo-router';
import { Platform } from 'react-native';

const HeaderWrapper = styled(View, {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
  paddingTop: Platform.OS === 'web' ? 0 : 25,
});

export function ScreenHeader(props: NativeStackHeaderProps) {
  const { headerTintColor, headerRight } = props.options;

  const canGoBack = props.back !== undefined;

  return (
    <HeaderWrapper>
      <Header
        title={getHeaderTitle(props.options, props.route.name)}
        headerTitle={(props) => (
          <Text
            color={'black'}
            $sm={{
              fontSize: 16,
            }}>
            {props.children}
          </Text>
        )}
        headerTintColor={headerTintColor}
        headerLeft={({ tintColor }) =>
          canGoBack && <HeaderBackButton tintColor={tintColor} onPress={() => router.back()} />
        }
        headerRight={
          typeof headerRight === 'function'
            ? ({ tintColor }) => headerRight({ tintColor, canGoBack })
            : headerRight
        }
      />
    </HeaderWrapper>
  );
}

export function HeaderButton(props: ButtonProps) {
  return (
    <Button
      size={48}
      marginRight={5}
      backgroundColor={'transparent'}
      hoverStyle={{ backgroundColor: 'transparent' }}
      {...props}
    />
  );
}
