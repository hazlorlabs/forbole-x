export const getLatestAccountBalance = (crypto: string): string => `
  subscription AccountBalance($address: String!) @${crypto} {
    account(where: {address: {_eq: $address}}) {
      address
      available: account_balances(limit: 1, order_by: {height: desc}) {
        coins
        height
        tokens_prices {
          unit_name
          price
          timestamp
          token_unit {
            denom
            exponent
            token {
              token_units {
                denom
                exponent
              }
            }
          }
        }
      }
      delegated: delegations(limit: 1, order_by: {height: desc}) {
        height
        amount
      }
      unbonding: unbonding_delegations(limit: 1, order_by: {height: desc}) {
        height
        amount
      }
      rewards: delegation_rewards(limit: 1, order_by: {height: desc}, where: {delegator_address: {_eq: $address}}) {
        height
        amount
        delegator_address
      }
      validator: validator_infos(where: {self_delegate_address: {_eq: $address}}) {
        consensus_address
        operator_address
        self_delegate_address
        validator {
          commissions: validator_commission_amounts(limit: 1, order_by: {height: desc}) {
            height
            amount
          }
        }
      }
    }
  }  
`

export const getBalanceAtHeight = (crypto: string): string => `
  query AccountBalance($address: String!, $height: bigint! ) @${crypto} {
    account(where: { address: { _eq: $address } }) {
      address
      available: account_balances(limit: 1, order_by: { height: desc }, where: { height: { _lte: $height } }) {
        coins
        height
        block { timestamp }
        tokens_prices {
          unit_name
          price
          timestamp
          token_unit {
            denom
            exponent
            token {
              token_units {
                denom
                exponent
              }
            }
          }
        }
      }
      delegated: delegations(limit: 1, order_by: { height: desc }, where: { height: { _lte: $height } }) {
        height
        amount
      }
      unbonding: unbonding_delegations(limit: 1, order_by: { height: desc }, where: { height: { _lte: $height } }) {
        height
        amount
      }
      rewards: delegation_rewards(limit: 1, order_by: { height: desc }, where: {delegator_address: { _eq: $address }, height: { _lte: $height }}) {
        height
        amount
        delegator_address
      }
      validator: validator_infos(where: {self_delegate_address: { _eq: $address }}) {
        consensus_address
        operator_address
        self_delegate_address
        validator {
          commissions: validator_commission_amounts(limit: 1, order_by: { height: desc }, where: { height: { _lte: $height } }) {
            height
            amount
          }
        }
      }
    }
  }
`