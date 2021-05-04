import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Avatar,
  FilledTextFieldProps,
} from '@material-ui/core'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import TablePagination from '../TablePagination'
import { useGeneralContext } from '../../contexts/GeneralContext'
import { formatCrypto, formatCurrency, getCoinPrice } from '../../misc/utils'
import useStyles from './styles'

interface SelectValidatorsProps extends Partial<FilledTextFieldProps> {
  onConfirm(
    amount: number,
    delegations: Array<{
      name: string
      image: string
      amount: number
      isSelected: boolean
      reward: number
    }>,
    m: string
  ): void
  account: Account
  validators: any
}

const SelectValidators: React.FC<SelectValidatorsProps> = ({ account, onConfirm, validators }) => {
  const { t, lang } = useTranslation('common')
  const classes = useStyles()
  const { currency } = useGeneralContext()
  const [amount, setAmount] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [value, setValue] = React.useState('')
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [currentTab, setCurrentTab] = React.useState(0)
  const [state, setState] = React.useState({})
  const [price, setPrice] = React.useState(0)

  const getPrice = React.useCallback(async () => {
    try {
      const coinPrice = await getCoinPrice(account.crypto)
      setPrice(coinPrice)
    } catch (err) {
      console.log(err)
    }
  }, [])

  React.useEffect(() => {
    getPrice()
  }, [getPrice])

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  const [isSelectAll, setIsSelectAll] = React.useState(false)

  const tabs = [{ label: 'withrawReward' }, { label: 'withdraw commission' }]

  const validatorsWithTag = []
  validators.forEach((x) => {
    validatorsWithTag.push({ ...x, isSelected: false })
  })
  const [validatorList, setValidatorList] = React.useState(validatorsWithTag)

  const calculateWithdrawAmount = (latestValidatorList) => {
    let withdrawAmount = 0
    latestValidatorList.forEach((x) => {
      if (x.isSelected) {
        withdrawAmount += x.reward
      }
    })
    setAmount(withdrawAmount)
  }

  const calculateTotalAmount = () => {
    let totalAmount = 0
    validatorList.forEach((x) => {
      totalAmount += x.reward
    })
    return totalAmount
  }

  const onClick = (address) => {
    const index = validatorList.findIndex((v) => v.address === address)
    const updatedList = validatorList

    if (updatedList[index].isSelected === true) {
      updatedList[index].isSelected = false
    } else {
      updatedList[index].isSelected = true
    }
    setValidatorList(updatedList)
    calculateWithdrawAmount(updatedList)
  }

  const handleSelectAll = () => {
    const updatedList = validatorList
    if (!isSelectAll) {
      updatedList.forEach((x) => {
        x.isSelected = true
      })
    } else {
      updatedList.forEach((x) => {
        x.isSelected = false
      })
    }
    setIsSelectAll(!isSelectAll)
    setValidatorList(updatedList)
    calculateWithdrawAmount(updatedList)
  }

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        <Box mb={10}>
          <Tabs
            className={classes.tabs}
            value={currentTab}
            classes={{
              indicator: classes.tabIndicator,
            }}
            centered
            onChange={(e, v) => setCurrentTab(v)}
          >
            {tabs.map((tab) => (
              <Tab className={classes.tab} key={tab.label} label={t(tab.label)} />
            ))}
          </Tabs>
          <Box mt={4} mb={2}>
            <Typography className={classes.totalReward}>
              {t('total reward amount')}&nbsp;
              {formatCrypto(calculateTotalAmount(), account.crypto, lang)}
            </Typography>
            <Typography>{t('withdraw amount')}</Typography>
            <Typography variant="h1" className={classes.h1}>
              {formatCrypto(amount, account.crypto, lang)}
            </Typography>
            <Typography>
              {t('select the validator below you want to claim the reward amount')}
            </Typography>
          </Box>
          <FormControlLabel
            value="end"
            control={<Checkbox onClick={handleSelectAll} color="primary" size="small" />}
            label={<Typography>{t('withdraw all')}</Typography>}
            labelPlacement="end"
          />
          <Box mt={0}>
            {validatorList.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((v, i) => (
              <FormControlLabel
                className={classes.controllLabel}
                value="end"
                control={
                  <Checkbox
                    checked={v.isSelected}
                    onClick={() => onClick(v.address)}
                    onChange={handleChange}
                    color="primary"
                    size="small"
                    name={v.address}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" style={{ flex: 1, width: '25rem' }}>
                    <Avatar className={classes.validatorAvatar} alt={v.name} src={v.image} />
                    <Typography>{v.name}</Typography>
                    <Typography className={classes.rewardsAmount}>{`${v.reward} ATOM`}</Typography>
                  </Box>
                }
                labelPlacement="end"
              />
            ))}
          </Box>
          <TablePagination
            className={classes.tablePagination}
            hideFooter
            page={page}
            rowsPerPage={rowsPerPage}
            rowsCount={validators.length}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </Box>
        <Typography>{t('memo')}</Typography>
        <TextField
          InputProps={{
            disableUnderline: true,
          }}
          fullWidth
          variant="filled"
          value={value}
          placeholder={t('description')}
          multiline
          rows={4}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Box
          flex={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          mx={2}
        >
          <Box>
            <Typography variant="h5">{formatCrypto(amount, account.crypto, lang)}</Typography>
            <Typography>{formatCurrency(price * amount, currency, lang)}</Typography>
          </Box>
          <Button
            variant="contained"
            className={classes.button}
            color="primary"
            disabled={!Number(amount)}
            onClick={() =>
              onConfirm(
                amount,
                validatorList.filter((v) => v.isSelected === true),
                value
              )
            }
          >
            {t('next')}
          </Button>
        </Box>
      </DialogActions>
    </>
  )
}

export default SelectValidators
