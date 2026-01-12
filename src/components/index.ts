/**
 * Components 向後兼容匯出
 *
 * 注意：components 已移至 src/modules/{role}/components/
 * 這個檔案保持向後兼容
 */

// Shared Components
export { default as RoleSwitcher } from '../modules/shared/components/RoleSwitcher';
export { default as ModuleNav } from '../modules/shared/components/ModuleNav';
export { default as TierBadge } from '../modules/shared/components/TierBadge';
export { default as InfoToast } from '../modules/shared/components/InfoToast';
export { default as LoadingAdScreen } from '../modules/shared/components/LoadingAdScreen';
export { default as TagInput } from '../modules/shared/components/TagInput';

// Merchant Components
export { default as MerchantRegistrationForm } from '../modules/merchant/components/MerchantRegistrationForm';
