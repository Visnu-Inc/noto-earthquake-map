import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import {
  Card,
  CardContent,
  CardActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Collapse,
  IconButton,
  type IconButtonProps
} from '@mui/material'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'

export type StatusControllerProps = {
  statusList: string[]
  onChange: (status: Record<string, boolean>) => void
}

const Expand = styled((props: IconButtonProps & { expand: boolean }) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

export const StatusController = ({ statusList, onChange }: StatusControllerProps) => {
  const [state, setState] = useState({})
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const newState = statusList.reduce((acc, status) => {
      const show = ['孤立・要支援'].some((e) => status.includes(e))
      return { ...acc, [status]: show }
    }, {})
    setState(newState)
    onChange(newState)
  }, [statusList])

  const handleChange = (event) => {
    const newState = { ...state, [event.target.name]: event.target.checked }
    setState(newState)
    onChange(newState)
  }

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <Card sx={{ position: 'absolute', top: 64 + 16, right: 0, maxWidth: 480 }}>
      <CardActions disableSpacing>
        <Expand
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <KeyboardDoubleArrowLeftIcon />
        </Expand>
      </CardActions>
      <Collapse in={expanded} orientation="horizontal" timeout="auto" unmountOnExit>
        <CardContent sx={{ visibility: expanded ? 'visible' : 'hidden' }}>
          <FormGroup>
            {statusList.map((status) => {
              return (
                <FormControlLabel
                  key={status}
                  control={<Checkbox size="small" name={status} onChange={handleChange} checked={state[status]} />}
                  label={status}
                />
              )
            })}
          </FormGroup>
        </CardContent>
      </Collapse>
    </Card>
  )
}
