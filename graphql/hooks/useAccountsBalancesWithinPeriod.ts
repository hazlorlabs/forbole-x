import React from 'react'
import get from 'lodash/get'
import cryptocurrencies from '../../misc/cryptocurrencies'
import { getTokenAmountFromDenoms } from '../../misc/utils'
import { getBalanceAtTimestamp } from '../queries/accountBalances'

const fetchBalance = async (address: string, crypto: string, timestamp: Date) => {
  const balance = await fetch(cryptocurrencies[crypto].graphqlHttpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: getBalanceAtTimestamp(crypto),
      variables: { address, timestamp },
    }),
  }).then((r) => r.json())

  const denoms = get(balance, 'data.tokens_prices', [])
  const available = getTokenAmountFromDenoms(get(balance, 'data.balance', []), denoms)
  const delegated = getTokenAmountFromDenoms(get(balance, 'data.delegated', []), denoms)
  const unbonding = getTokenAmountFromDenoms(get(balance, 'data.unbonding', []), denoms)
  const commissions = getTokenAmountFromDenoms(get(balance, 'data.commissions', []), denoms)
  const rewards = getTokenAmountFromDenoms(get(balance, 'data.rewards', []), denoms)

  return {
    balance: {
      available,
      delegated,
      unbonding,
      commissions,
      rewards,
    },
    timestamp: timestamp.getTime(),
    availableTokens: { coins: get(balance, 'data.balance', []), tokens_prices: denoms },
  }
}

const fetchAccountsBalancesWithinPeriod = async (
  accounts: Account[],
  timestamps: Date[]
): Promise<AccountWithBalance[]> => {
  const results = await Promise.all(
    accounts.map((a) => Promise.all(timestamps.map((t) => fetchBalance(a.address, a.crypto, t))))
  )
  return accounts.map((a, i) => ({
    ...a,
    balances: results[i].sort((x, y) => x.timestamp - y.timestamp),
  }))
}

const useAccountsBalancesWithinPeriod = (
  accounts: Account[],
  timestamps: Date[]
): { data: AccountWithBalance[]; loading: boolean } => {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<AccountWithBalance[]>([])

  const getWalletsWithBalance = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchAccountsBalancesWithinPeriod(accounts, timestamps)
      setData(result)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }, [accounts.length, timestamps])

  React.useEffect(() => {
    getWalletsWithBalance()
  }, [getWalletsWithBalance])

  return { data, loading }
}

export default useAccountsBalancesWithinPeriod
