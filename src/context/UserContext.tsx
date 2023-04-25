// ** React Imports
import { createContext, useState, ReactNode, useCallback, useEffect } from 'react'

// ** Services
import { AccountSettingTypes } from '../types'

// ** Defaults
const defaultProvider: AccountSettingTypes = {
  sellerAccount: {
    region: '',
    marketPlace: '',
    nickName: '',
    sellerEmail: ''
  }
}

const AccountSettingContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AccountSettingProvider = ({ children }: Props) => {
  const [sellerAccount, setSellerAccount] = useState<string>('')
  const [allStores, setAllStores] = useState('')

  const values = {
    sellerAccount,
    allStores,
    setSellerAccount,
    setAllStores
  }

  return <AccountSettingContext.Provider value={values}>{children}</AccountSettingContext.Provider>
}

export { AccountSettingContext, AccountSettingProvider }
