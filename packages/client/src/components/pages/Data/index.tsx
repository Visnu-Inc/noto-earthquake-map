import { Link as MuiLink, Stack, Box, Typography } from "@mui/material";
import { Layout } from "../../Layout";
import { Link } from "../../atoms/Link";

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
            能登地震孤立地域情報まとめ（更新停止）
          </MuiLink>
        </Box>
        <Box sx={{ mt: 1 }}>
          <MuiLink
            color="inherit"
            href="https://www.google.com/maps/d/u/0/viewer?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30&ll=36.665837067784196%2C137.52761999999998&z=8"
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
            R6能登半島地震応急給水拠点（日別）
          </MuiLink>
        </Box>
        <Box sx={{ mt: 1 }}>
          <MuiLink
            color="inherit"
            href="https://www.google.com/maps/d/u/0/viewer?fbclid=IwAR2YMn-qVvwSYGqXHK7k16OdcPLKOL6nbhwFF6TfnhSKcK1l6cNJLqC-v5c&mid=1daKlXPEULq91w-PUMHZ9KSfwZTMRQxU&ll=34.88624511297351%2C138.58368814941406&z=10"
            target="_blank"
          >
            R6能登半島地震応急給水拠点（最新）
          </MuiLink>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Link to="/">地図に戻る</Link>
        </Box>
      </Stack>
    </Layout>
  );
}
