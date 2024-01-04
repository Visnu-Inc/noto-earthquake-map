import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material'

export type StatusControllerProps = {
  statusList: string[]
  onChange: (status: Record<string, boolean>) => void
}

export const StatusController = ({ statusList, onChange }: StatusControllerProps) => {
  const [state, setState] = useState({})

  useEffect(() => {
    const newState = statusList.reduce((acc, status) => {
      return { ...acc, [status]: true }
    }, {})
    setState(newState)
  }, [statusList])

  const handleChange = (event) => {
    const newState = { ...state, [event.target.name]: event.target.checked }
    setState(newState)
    onChange(newState)
  }

  return (
    <Card sx={{ position: 'absolute', top: 64 + 16, right: 16, maxWidth: 480 }}>
      <CardContent>
      <FormGroup>
        {statusList.map((status) => {
          return (
            <FormControlLabel
              key={status}
              control={<Checkbox defaultChecked size="small" name={status} onChange={handleChange} />}
              label={status}
            />
          )
        })}
      </FormGroup>
      </CardContent>
    </Card>
  )
}
