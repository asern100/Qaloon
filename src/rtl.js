import { I18nManager } from 'react-native';

// Layout helpers that render right-to-left whether or not the phone itself
// is set to an RTL language.
const rtl = I18nManager.isRTL;
export const ROW = rtl ? 'row' : 'row-reverse';
export const RIGHT = rtl ? 'left' : 'right'; // textAlign that looks right-aligned
export const START = rtl ? 'flex-start' : 'flex-end'; // alignItems towards the right
export const END = rtl ? 'flex-end' : 'flex-start';
