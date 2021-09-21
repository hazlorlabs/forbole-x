import { makeStyles } from '@material-ui/core/styles'
import { CustomTheme } from '../../misc/theme'

const useStyles = makeStyles(
  (theme: CustomTheme) => ({
    container: {
      marginBottom: theme.spacing(2),
    },
    sendButton: {
      color: 'white',
      width: theme.spacing(18),
      marginLeft: theme.spacing(2),
      backgroundColor: theme.palette.success.main,
      '&:hover': {
        backgroundColor: theme.palette.success.dark,
      },
    },
    fixedWidthButton: {
      color: 'white',
      width: theme.spacing(18),
      marginLeft: theme.spacing(2),
      padding: theme.spacing(0.5),
    },
    profileButton: {
      width: theme.spacing(18),
      marginLeft: theme.spacing(2),
      padding: theme.spacing(0.5),
      borderColor: theme.palette.iconBorder,
    },
    iconButton: {
      borderColor: theme.palette.iconBorder,
      minWidth: 0,
      marginLeft: theme.spacing(2),
      width: theme.spacing(5),
      height: theme.spacing(5),
      padding: 0,
      [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
      },
    },
    tabIndicator: {
      backgroundColor: theme.palette.indicator,
      width: theme.spacing(1),
    },
    tab: {
      '& .Mui-selected': {
        color: theme.palette.indicator,
      },
    },
  }),
  {
    name: 'HookGlobalStyles',
    index: 2,
  }
)

export default useStyles
