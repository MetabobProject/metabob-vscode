import { useContext } from 'react'
import { AccountSettingContext } from '../context/UserContext'

export const useUser = () => useContext(AccountSettingContext)
