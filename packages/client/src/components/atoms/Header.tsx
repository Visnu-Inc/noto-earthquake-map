import {
  AppBar,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link } from './Link'

export function Header() {
  return (
    <AppBar position="relative" >
      <Container maxWidth="xl">
        <Toolbar sx={{ display: "flex" }} disableGutters>
          <Link to="/" sx={{ textDecoration: 'none' }}>
            <Typography component="div" sx={{ flexGrow: 1, wordBreak:"auto-phrase", fontSize:16 }}>
              令和6年能登半島地震 <wbr/>孤立地域及び支援情報まとめ
            </Typography>
          </Link>
          <Stack>
            <Link to="/data">
              <Typography fontSize={10} sx={{ minWidth: '64px' }}>更新元データ</Typography>
            </Link>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
