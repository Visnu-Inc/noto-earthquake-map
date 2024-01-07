import {
  Link as MuiLink,
  Stack,
  Box,
  Typography,
} from '@mui/material'
import { Layout } from '../../Layout'
import { Link } from '../../atoms/Link'

export default function Data() {
  return (
    <Layout>
      <Stack sx={{ p: 1 }}>
        <Typography>更新元データ</Typography>
        <Box sx={{ mt: 1 }}>
          <MuiLink
            color="inherit"
            href="https://docs.google.com/spreadsheets/d/1Wa3EltKUwq2-d8W8s6QlJ7TIEC83kc8131xuX9q_5OI/edit?pli=1#gid=0"
            target="_blank"
          >
            能登地震孤立地域情報まとめ
          </MuiLink>
        </Box>
        <Box sx={{ mt: 1 }}>
          <MuiLink
              color="inherit"
              href="https://www.google.com/maps/d/u/0/edit?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30&usp=sharing"
              target="_blank"
            >
              令和6年能登半島地震　各機関活動状況
            </MuiLink>
        </Box>
        <Box sx={{ mt: 1 }}>
          <MuiLink
            color="inherit"
            href="https://www.google.com/maps/d/u/0/viewer?mid=17UWU-Rmje_Ul31o7w4fQlbgF3NN-954&ll=36.94456041479502%2C137.06082638258303&z=10"
            target="_blank"
          >
          R6能登半島地震応急給水拠点
          </MuiLink>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Link to="/">地図に戻る</Link>
        </Box>
      </Stack>
    </Layout>
  );
}
