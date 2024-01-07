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
  type IconButtonProps,
  Stack,
  Typography
} from '@mui/material'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import { type DataSources, type StatusList } from '.';

export type StatusControllerProps = {
  statusList: StatusList | null;
  onChange: (status: Status) => void;
};

export type Status = Record<DataSources, Record<string, boolean>>;

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

export const StatusController = ({
  statusList,
  onChange,
}: StatusControllerProps) => {
  const [state, setState] = useState<Status | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!statusList) return;
    const newState: Status = {} as Status;
    newState.能登地震孤立地域情報まとめ =
      statusList.能登地震孤立地域情報まとめ.reduce((acc, status) => {
        const show = ["孤立・要支援", "状況不明"].some((e) =>
          status.includes(e)
        );
        return { ...acc, [status]: show };
      }, {});
    newState["令和6年能登半島地震 各機関活動状況"] = { "1月6日23時時点": true };
    newState["R6能登半島地震応急給水拠点"] = { 応急給水拠点1月7日: false };
    newState.Google = { 交通情報: false };
    setState(newState);
    onChange(newState);
  }, [statusList]);

  const handleChange = (key: DataSources, status: string, checked: boolean) => {
    const newState: Status = { ...state };
    newState[key][status] = checked;
    setState(newState);
    onChange(newState);
  };

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
            <Stack gap={3}>
              {!statusList || !state
                ? null
                : (Object.keys(statusList) as (keyof StatusList)[]).map(
                    (key) => {
                      const status = statusList[key];
                      return (
                        <Stack key={key}>
                          <Typography fontWeight={600}>{key}</Typography>
                          <Stack>
                            {status.map((s) => {
                              return (
                                <FormControlLabel
                                  key={s}
                                  control={
                                    <Checkbox
                                      size="small"
                                      name={s}
                                      onChange={(event) => {
                                        handleChange(
                                          key,
                                          s,
                                          event.target.checked
                                        );
                                      }}
                                      checked={state[key][s]}
                                    />
                                  }
                                  label={s}
                                />
                              );
                            })}
                          </Stack>
                        </Stack>
                      );
                    }
                  )}
            </Stack>
          </FormGroup>
        </CardContent>
      </Collapse>
    </Card>
  )
}
