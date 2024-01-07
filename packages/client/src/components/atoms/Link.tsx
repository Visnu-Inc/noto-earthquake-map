import {
  Link as MuiLink,
  type LinkProps as MuiLinkProps,
} from '@mui/material';
import { Link as RouterLink, type LinkProps } from 'react-router-dom'

export function Link(props: LinkProps & MuiLinkProps) {
  return (
    <MuiLink
      color="inherit"
      fontSize={11}
      component={RouterLink}
      {...props}
    >{props.children}</MuiLink>
  )
}
