import cryptocurrencies from './cryptocurrencies'

const formatCosmosTransactionMsg = ({ type, ...params }: any): TransactionMsg => {
  if (type === 'delegate') {
    const { delegator, validator, amount, denom } = params
    return {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        delegator_address: delegator,
        validator_address: validator,
        amount: { amount: amount.toString(), denom },
      },
    }
  }
  if (type === 'undelegate') {
    const { delegator, validator, amount, denom } = params
    return {
      type: 'cosmos-sdk/MsgUndelegate',
      value: {
        delegator_address: delegator,
        validator_address: validator,
        amount: { amount: amount.toString(), denom },
      },
    }
  }
  if (type === 'redelegate') {
    const { delegator, fromValidator, toValidator, amount, denom } = params
    return {
      type: 'cosmos-sdk/MsgBeginRedelegate',
      value: {
        delegator_address: delegator,
        validator_src_address: fromValidator,
        validator_dst_address: toValidator,
        amount: { amount: amount.toString(), denom },
      },
    }
  }
  if (type === 'withdraw reward') {
    const { delegator, validator } = params
    return {
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        delegator_address: delegator,
        validator_address: validator,
      },
    }
  }
  if (type === 'send') {
    const { from, to, amount, denom } = params
    return {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: from,
        to_address: to,
        amount: [{ amount: amount.toString(), denom }],
      },
    }
  }
  return null
}

export const formatTransactionMsg = (crypto: string, msg: any) => {
  const { ecosystem } = cryptocurrencies[crypto] || {}
  if (ecosystem === 'cosmos') {
    return formatCosmosTransactionMsg(msg)
  }
  return null
}

export const formatRawTransactionData = (crypto: string, transactionMsg: any) => {
  const { ecosystem } = cryptocurrencies[crypto] || {}
  if (ecosystem === 'cosmos') {
    return {
      fee: transactionMsg.gasFee,
      msgs: transactionMsg.transactions,
      memo: transactionMsg.memo,
      account_number: transactionMsg.accountNumber,
      sequence: transactionMsg.sequence,
      chain_id: transactionMsg.chainId,
    }
  }
  return null
}
