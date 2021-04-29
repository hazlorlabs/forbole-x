import { Box, Button, Card, Grid, useTheme } from '@material-ui/core'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import get from 'lodash/get'
import { gql, useSubscription } from '@apollo/client'
import times from 'lodash/times'
import StarIcon from '../../assets/images/icons/icon_star.svg'
import EditIcon from '../../assets/images/icons/icon_edit_tool.svg'
import StarFilledIcon from '../../assets/images/icons/icon_star_marked.svg'
import AccountAvatar from '../AccountAvatar'
import { useGeneralContext } from '../../contexts/GeneralContext'
import BalanceChart, { dateRanges } from '../BalanceChart'
import useStyles from './styles'
import useIconProps from '../../misc/useIconProps'
import { useWalletsContext } from '../../contexts/WalletsContext'
import StatBox from './StatBox'
import DelegationDialog from '../DelegateDialog'
import ClaimRewardsDialog from '../ClaimRewardsDialog'
import {
  formatCrypto,
  formatCurrency,
  formatTokenAmount,
  getTokenAmountBalance,
  getTotalBalance,
  getTotalTokenAmount,
  transformGqlAcountBalance,
} from '../../misc/utils'
import useAccountsBalancesWithinPeriod from '../../graphql/hooks/useAccountsBalancesWithinPeriod'
import { getLatestAccountBalance } from '../../graphql/queries/accountBalances'
import SendDialog from '../SendDialog'

interface AccountDetailCardProps {
  account: Account
}

const AccountDetailCard: React.FC<AccountDetailCardProps> = ({ account }) => {
  const { lang, t } = useTranslation('common')
  const { currency } = useGeneralContext()
  const classes = useStyles()
  const iconProps = useIconProps()
  const theme = useTheme()
  const { updateAccount } = useWalletsContext()
  const [delegateDialogOpen, setDelegateDialogOpen] = React.useState(false)
  const [claimRewardsDialogOpen, setClaimRewardsDialogOpen] = React.useState(false)
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false)
  const [timestamps, setTimestamps] = React.useState<Date[]>(
    dateRanges.find((d) => d.isDefault).timestamps.map((timestamp) => new Date(timestamp))
  )
  // Chart Data
  const { data: accountsWithBalance, loading } = useAccountsBalancesWithinPeriod(
    [account],
    timestamps
  )
  const chartData = accountsWithBalance.length
    ? accountsWithBalance[0].balances.map((b) => getTotalBalance(b))
    : []
  // Balance Data
  const { data } = useSubscription(
    gql`
      ${getLatestAccountBalance(account.crypto)}
    `,
    { variables: { address: account.address } }
  )

  const { availableTokens, totalTokenAmount, usdBalance, accountBalance } = React.useMemo(() => {
    const ab = transformGqlAcountBalance(data, Date.now())
    return {
      availableTokens: get(data, 'account[0].available[0]', { coins: [], tokens_prices: [] }),
      accountBalance: ab,
      totalTokenAmount: getTotalTokenAmount(ab).amount,
      usdBalance: getTotalBalance(ab).balance,
    }
  }, [data])

  const isAvailableTokenEmpty = React.useMemo(() => !get(availableTokens, 'coins.length', 0), [
    availableTokens,
  ])

  const toggleFav = React.useCallback(() => {
    updateAccount(account.address, { fav: !account.fav })
  }, [account.address, account.fav, updateAccount])

  return (
    <>
      <Card className={classes.container}>
        <Box p={4}>
          <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
            <AccountAvatar size="large" account={account} />
            <Box display="flex">
              <Button
                classes={{ root: classes.fixedWidthButton }}
                variant="contained"
                color="primary"
                disabled={isAvailableTokenEmpty}
                onClick={() => setDelegateDialogOpen(true)}
              >
                {t('delegate')}
              </Button>
              <Button
                classes={{ root: classes.fixedWidthButton }}
                variant="contained"
                color="secondary"
                onClick={() => setClaimRewardsDialogOpen(true)}
              >
                {t('claim rewards')}
              </Button>
              <Button
                classes={{ root: classes.sendButton }}
                variant="contained"
                disabled={isAvailableTokenEmpty}
                onClick={() => setSendDialogOpen(true)}
              >
                {t('send')}
              </Button>
              <Button classes={{ root: classes.iconButton }} variant="outlined" onClick={toggleFav}>
                {account.fav ? (
                  <StarFilledIcon {...iconProps} fill={theme.palette.warning.light} />
                ) : (
                  <StarIcon {...iconProps} />
                )}
              </Button>
              <Button classes={{ root: classes.iconButton }} variant="outlined">
                <EditIcon {...iconProps} />
              </Button>
            </Box>
          </Box>
          <BalanceChart
            data={chartData}
            onDateRangeChange={(dateRange) => {
              setTimestamps(dateRange.timestamps.map((ts) => new Date(ts)))
            }}
            title={formatTokenAmount(totalTokenAmount, account.crypto, lang)}
            subtitle={formatCurrency(usdBalance, currency, lang)}
            loading={loading}
          />
          <Box mt={10}>
            <Grid container spacing={4}>
              {['available', 'delegated', 'unbonding', 'reward', 'commission'].map((key) => (
                <StatBox
                  key={key}
                  title={t(key)}
                  value={formatTokenAmount(
                    get(accountBalance, `balance.${key}`, {}),
                    account.crypto,
                    lang
                  )}
                  subtitle={formatCurrency(
                    getTokenAmountBalance(get(accountBalance, `balance.${key}`, {})),
                    currency,
                    lang
                  )}
                />
              ))}
            </Grid>
          </Box>
        </Box>
      </Card>
      <DelegationDialog
        open={delegateDialogOpen}
        onClose={() => setDelegateDialogOpen(false)}
        account={account}
      />
      <ClaimRewardsDialog
        open={claimRewardsDialogOpen}
        onClose={() => setClaimRewardsDialogOpen(false)}
        account={account}
        validators={[
          {
            address: 'desmos1qpm8wutycha3ncd0u3w9g42v89xnnfs6f9sg8d',
            image:
              'https://s3.amazonaws.com/keybase_processed_uploads/f5b0771af36b2e3d6a196a29751e1f05_360_360.jpeg',
            name: 'Forbole',
            reward: 599.013243,
          },
          {
            address: 'desmos1qpm8wutycha3ncd0u3w9g42v89xnnfs6f9s111',
            image:
              'https://s3.amazonaws.com/keybase_processed_uploads/f5b0771af36b2e3d6a196a29751e1f05_360_360.jpeg',
            name: 'Forbole',
            reward: 599.013243,
          },
          {
            address: 'desmos1qpm8wutycha3ncd0u3w9g42v89xnnfs6f9s222',
            image:
              'https://s3.amazonaws.com/keybase_processed_uploads/f5b0771af36b2e3d6a196a29751e1f05_360_360.jpeg',
            name: 'Forbole',
            reward: 599.013243,
          },
        ]}
      />
      <SendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        account={account}
        availableTokens={availableTokens}
      />
    </>
  )
}

export default AccountDetailCard
