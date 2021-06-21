import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { stringToPath } from '@cosmjs/crypto'
import { LedgerSigner } from '@cosmjs/ledger-amino'
import { SigningStargateClient } from '@cosmjs/stargate'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import camelCase from 'lodash/camelCase'
import cryptocurrencies from './cryptocurrencies'
import sendMsgToChromeExt from './sendMsgToChromeExt'

const typeUrlMap: any = {
  'cosmos-sdk/MsgDelegate': '/cosmos.staking.v1beta1.MsgDelegate',
  'cosmos-sdk/MsgUndelegate': '/cosmos.staking.v1beta1.MsgUndelegate',
  'cosmos-sdk/MsgBeginRedelegate': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  'cosmos-sdk/MsgWithdrawDelegationReward':
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  'cosmos-sdk/MsgSend': '/cosmos.bank.v1beta1.MsgSend',
}

const formatTransactionMsg = (msg: any) => {
  const transformedMsg: any = {}
  transformedMsg.typeUrl = typeUrlMap[msg.type]
  transformedMsg.value = {}
  Object.keys(msg.value).forEach((k) => {
    transformedMsg.value[camelCase(k)] = msg.value[k]
  })
  return transformedMsg
}

const signAndBroadcastCosmosTransaction = async (
  mnemonic: string,
  crypto: string,
  index: number,
  transactionData: any
): Promise<any> => {
  let signer
  const signerOptions = {
    hdPaths: [stringToPath(`m/44'/${cryptocurrencies[crypto].coinType}'/0'/0/${index}`)],
    prefix: cryptocurrencies[crypto].prefix,
  }
  if (mnemonic) {
    signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, signerOptions)
  } else {
    const transport = await TransportWebUSB.create()
    signer = new LedgerSigner(transport, signerOptions as any)
  }
  const accounts = await signer.getAccounts()
  const client = await SigningStargateClient.connectWithSigner(
    cryptocurrencies[crypto].rpcEndpoint,
    signer
  )
  const result = await client.signAndBroadcast(
    accounts[0].address,
    transactionData.msgs.map((msg: any) => formatTransactionMsg(msg)),
    transactionData.fee,
    transactionData.memo
  )
  return result
}

const signAndBroadcastTransaction = async (
  password: string,
  account: Account,
  transactionData: any,
  securityPassword: string
): Promise<any> => {
  const channel = new BroadcastChannel('forbole-x')
  try {
    const { mnemonic } = await sendMsgToChromeExt({
      event: 'viewMnemonicPhrase',
      data: { password, id: account.walletId, securityPassword },
    })
    // TODO: handle other ecosystem
    const result = await signAndBroadcastCosmosTransaction(
      mnemonic,
      account.crypto,
      account.index,
      transactionData
    )
    channel.postMessage({
      event: 'transactionSuccess',
      data: result,
    })
    return result
  } catch (err) {
    channel.postMessage({
      event: 'transactionFail',
      data: err,
    })
    throw err
  }
}

export default signAndBroadcastTransaction
