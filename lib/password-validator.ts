export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を1文字以上含める必要があります');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を1文字以上含める必要があります');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('数字を1文字以上含める必要があります');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('記号を1文字以上含める必要があります');
  }

  // Common password check
  const commonPasswords = [
    'password',
    'Password1!',
    '12345678',
    'Password123!',
    'Qwerty123!',
  ];
  if (commonPasswords.includes(password)) {
    errors.push('よく使われるパスワードは使用できません');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordRequirements(): string[] {
  return [
    '8文字以上',
    '大文字を1文字以上含む',
    '小文字を1文字以上含む',
    '数字を1文字以上含む',
    '記号を1文字以上含む',
    'よく使われるパスワードは避ける',
  ];
}
