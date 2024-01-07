import { styled } from '@mui/material/styles'
import { Typography } from '@mui/material'

export function Footer() {
  return (
    <Wrap>
      <Typography component="span">© <a href="https://visnu.jp/" target="_blank">Visnu Inc.</a></Typography>
    </Wrap>
  )
}

const Wrap = styled('footer')`
  background: #2a2a2a;
  color: #fff;
  padding: 0 .4em;
  display: flex;
  flex-direction: column;
  span {
    flex: 1;
    text-align: right;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
`
