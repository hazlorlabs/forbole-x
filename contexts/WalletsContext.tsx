import React from 'react'
import CryptoJS from 'crypto-js'
import usePersistedState from '../misc/usePersistedState'

interface Wallet {
  id: string
  name: string
  mnemonic?: string
  privateKey?: string
}

interface WalletsState {
  isFirstTimeUser: boolean
  wallets: Wallet[]
  password: string
  setPassword?: React.Dispatch<React.SetStateAction<string>>
  addWallet?: (wallet: Wallet) => void
  deleteWallet?: (id: string) => void
}

const initialState: WalletsState = {
  isFirstTimeUser: false,
  wallets: [],
  password: '',
}

const WalletsContext = React.createContext<WalletsState>(initialState)

const WalletsProvider: React.FC = ({ children }) => {
  const [encryptedWalletsString, setEncryptedWalletsString] = usePersistedState('wallets', '')
  const [password, setPassword] = React.useState('')
  const wallets = React.useMemo(() => {
    try {
      if (password && encryptedWalletsString) {
        const decryptedWalletsString = CryptoJS.AES.decrypt(
          encryptedWalletsString,
          password
        ).toString(CryptoJS.enc.Utf8)
        return JSON.parse(decryptedWalletsString)
      }
      return []
    } catch (err) {
      console.log(err)
      return []
    }
  }, [password, encryptedWalletsString])

  const addWallet = React.useCallback(
    (wallet: Omit<Wallet, 'id'>) => {
      setEncryptedWalletsString(
        CryptoJS.AES.encrypt(
          JSON.stringify([{ ...wallet, id: Date.now() }, ...wallets]).toString(),
          password
        )
      )
    },
    [wallets, password, setEncryptedWalletsString]
  )

  const deleteWallet = React.useCallback(
    (id: string) => {
      setEncryptedWalletsString(
        CryptoJS.AES.encrypt(
          JSON.stringify(wallets.filter((w) => w.id !== id)).toString(),
          password
        )
      )
    },
    [wallets, password, setEncryptedWalletsString]
  )

  return (
    <WalletsContext.Provider
      value={{
        isFirstTimeUser: !encryptedWalletsString,
        wallets,
        password,
        setPassword,
        addWallet,
        deleteWallet,
      }}
    >
      {children}
    </WalletsContext.Provider>
  )
}

const useWalletsContext = () => React.useContext(WalletsContext)

export { WalletsProvider, useWalletsContext }