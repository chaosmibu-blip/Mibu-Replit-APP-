/**
 * 店舖編輯頁面路由（動態路由）
 *
 * 路由參數：id - 店舖 ID
 * 對應 Screen: PlaceEditScreen（來自 merchant 模組）
 * 功能：編輯單一店舖的詳細資訊
 */
import { PlaceEditScreen } from '../../../src/modules/merchant';

export default function PlaceEditPage() {
  return <PlaceEditScreen />;
}
