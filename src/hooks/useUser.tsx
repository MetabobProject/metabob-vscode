import { useContext } from 'react';
import { AccountSettingContext } from '../context/UserContext';

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUser = () => useContext(AccountSettingContext);
