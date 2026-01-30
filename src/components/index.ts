/**
 * Components 向後兼容匯出
 *
 * 注意：components 已移至 src/modules/{role}/components/
 * 這個檔案保持向後兼容
 */

// Shared Components - 共用元件
export { RoleSwitcher } from '../modules/shared/components/RoleSwitcher';
export { GachaTopNav, GachaTopNav as ModuleNav } from '../modules/shared/components/ModuleNav';
export { TierBadge } from '../modules/shared/components/TierBadge';
export { InfoToast } from '../modules/shared/components/InfoToast';
export { LoadingAdScreen } from '../modules/shared/components/LoadingAdScreen';
export { TagInput } from '../modules/shared/components/TagInput';

// Merchant Components - 商家元件
export { MerchantRegistrationForm } from '../modules/merchant/components/MerchantRegistrationForm';
