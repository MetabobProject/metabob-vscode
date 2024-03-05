import { useContext } from 'react';
import { AccountSettingContext } from '../context/UserContext';
// @ts-ignore
export const useUser = () => useContext(AccountSettingContext);
