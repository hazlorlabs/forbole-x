import { Button, IconButton, Menu, MenuItem, Box } from '@material-ui/core'
import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import useStyles from './styles'
import EditIcon from '../../assets/images/icons/icon_edit.svg'
import useIconProps from '../../misc/useIconProps'
import ChangeWalletMonikerDialog from './ChangeWalletMonikerDialog'
import ChangeSecurityPasswordDialog from './ChangeSecurityPasswordDialog'

const WalletMenuButton: React.FC<{ walletId: string }> = ({ walletId }) => {
  const { t } = useTranslation('common')
  const iconProps = useIconProps()
  const classes = useStyles()
  const [anchor, setAnchor] = React.useState<Element>()

  const [changeWalletNameOpen, setChangeWalletNameOpen] = React.useState(false)
  const [changeSecurityPasswordOpen, setChangeSecurityPasswordOpen] = React.useState(false)

  const onClose = React.useCallback(() => setAnchor(undefined), [setAnchor])

  return (
    <>
      <IconButton className={classes.iconButton} onClick={(e) => setAnchor(e.currentTarget)}>
        <EditIcon {...iconProps} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        keepMounted
        open={!!anchor}
        onClose={onClose}
      >
        <MenuItem
          className={classes.menuItem}
          button
          onClick={() => {
            setChangeWalletNameOpen(true)
            onClose()
          }}
        >
          {t('change wallet moniker')}
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          button
          onClick={() => {
            setChangeSecurityPasswordOpen(true)
            onClose()
          }}
        >
          {t('change security password')}
        </MenuItem>
        <MenuItem className={classes.menuItem} button>
          {t('view mnemonic phrase')}
        </MenuItem>
        <MenuItem className={classes.menuItem} button>
          {t('add account to wallet')}
        </MenuItem>
        <Box m={2}>
          <Button fullWidth variant="contained" color="primary">
            {t('delete wallet')}
          </Button>
        </Box>
      </Menu>
      <ChangeWalletMonikerDialog
        open={changeWalletNameOpen}
        onClose={() => setChangeWalletNameOpen(false)}
        walletId={walletId}
      />
      <ChangeSecurityPasswordDialog
        open={changeSecurityPasswordOpen}
        onClose={() => setChangeSecurityPasswordOpen(false)}
        walletId={walletId}
      />
    </>
  )
}

export default React.memo(WalletMenuButton)
