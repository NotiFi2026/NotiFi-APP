/**
 * A-3. 회원가입 — ui-spec.md A-3.
 * 로그인 화면과 같은 세계를 쓰되, 폼이 길어 로고 대신 뒤로가기와 제목으로 시작한다.
 */

import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { SignupView } from '@/features/auth/presentation/components/SignupView';
import { Screen } from '@/shared/components/layout/Screen';

export default function SignupScreen() {
  return (
    <Screen gutter={false}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        >
          <SignupView />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
