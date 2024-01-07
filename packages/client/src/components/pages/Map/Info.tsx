import type { InfoJsonType } from '../../../types'
import {
  Card,
  CardHeader,
  CardContent,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export type InfoProps = {
 info: InfoJsonType | null
 show: boolean
 onClose: () => void
}

export const Info = ({ info, show, onClose }: InfoProps) => {
  if (!info || !show) return <></>

  return (
    <Card sx={{ position: 'absolute', bottom: 0, maxWidth: 480 }}>
      <CardHeader
        title={info.市町村 + info.市町村2 + info.市町村3}
        action={
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      <CardContent>
        <dl>
          <dt>状態</dt>
          <dd>{info.状態}</dd>
          <dt>状況</dt>
          <dd>{info.状況}</dd>
          <dt>対応状況</dt>
          <dd>{info.対応状況}</dd>
          <dt>情報源</dt>
          <dd style={{ wordBreak: 'break-all' }}><a href={info.情報源} target='_blank'>{info.情報源}</a></dd>
          <dt>緯度経度（想定）</dt>
          <dd>
            <p style={{ margin: 0 }}>lat: {info.location.lat}</p>
            <p style={{ margin: 0 }}>lng: {info.location.lng}</p>
            <a href={`https://www.google.com/maps?q=${info.location.lat},${info.location.lng}`} target='_blank'>Google Mapで開く</a>
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}
