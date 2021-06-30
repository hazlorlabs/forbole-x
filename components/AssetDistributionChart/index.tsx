/* eslint-disable no-await-in-loop */
import { Box, Card, Typography } from '@material-ui/core'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import get from 'lodash/get'
import useStyles from './styles'
import SectoredByButton from './SectoredByButton'
import { SectoredBy, sectoredByTypes } from './types'
import Chart from './Chart'
import EmptyState from './EmptyState'
import fetchAccountBalance from '../../graphql/fetch/fetchAccountBalance'
import { sumTokenAmounts } from '../../misc/utils'
import { useWalletsContext } from '../../contexts/WalletsContext'
import cryptocurrencies from '../../misc/cryptocurrencies'
import AssetPopover from './AssetPopover'

const AssetDistributionChart: React.FC = () => {
  const classes = useStyles()
  const { t } = useTranslation('common')
  const { accounts } = useWalletsContext()
  const [sectoredBy, setSectoredBy] = React.useState<SectoredBy>(sectoredByTypes[0])
  const [data, setData] = React.useState([])
  const [popoverIndex, setPopoverIndex] = React.useState<number | undefined>()
  const [anchorPosition, setAnchorPosition] = React.useState(null)

  const fetchData = React.useCallback(async () => {
    try {
      if (sectoredBy === 'by assets') {
        const accountBalances: any = { total: {}, accountBalance: {} }
        for (let i = 0; i < accounts.length; i += 1) {
          const { accountBalance, total } = await fetchAccountBalance(
            accounts[i].address,
            accounts[i].crypto
          )
          accountBalances.total = sumTokenAmounts([accountBalances.total || {}, total])
          Object.keys(accountBalance).forEach((key) => {
            accountBalances.accountBalance[key] = sumTokenAmounts([
              accountBalances.accountBalance[key] || {},
              accountBalance[key],
            ])
          })
        }
        const rawData = []
        Object.keys(accountBalances.total).forEach((denom) => {
          rawData.push({
            name: denom.toUpperCase(),
            value: accountBalances.total[denom].amount * accountBalances.total[denom].price,
          })
        })
        const total = rawData.map((d) => d.value).reduce((a, b) => a + b, 0)
        setData(
          rawData.map((d) => ({
            name: d.name,
            image: cryptocurrencies[d.name].image,
            value: d.value === total ? 1 : Math.round(d.value / total),
            extraData: { ...accountBalances.accountBalance, total: accountBalances.total },
          }))
        )
      }
    } catch (err) {
      console.log(err)
    }
  }, [sectoredBy, accounts])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])
  console.log(data)

  return (
    <Card className={classes.container}>
      <Box display="flex" flexDirection="column" alignItems="center" my={2}>
        <Typography variant="h1">{t('asset distribution')}</Typography>
        <SectoredByButton sectoredBy={sectoredBy} onChange={setSectoredBy} />
      </Box>
      {data.length > 0 ? (
        <Chart
          data={data}
          setAnchorPosition={setAnchorPosition}
          setPopoverIndex={setPopoverIndex}
        />
      ) : (
        <EmptyState />
      )}
      <AssetPopover
        anchorPosition={anchorPosition}
        onClose={() => setAnchorPosition(null)}
        accountBalance={get(data, `[${popoverIndex}].extraData`, {})}
        cryptocurrency={
          cryptocurrencies[get(data, `[${popoverIndex}].name`, '')] ||
          Object.values(cryptocurrencies)[0]
        }
        percentage={get(data, `[${popoverIndex}].value`, 0)}
      />
    </Card>
  )
}

export default AssetDistributionChart
