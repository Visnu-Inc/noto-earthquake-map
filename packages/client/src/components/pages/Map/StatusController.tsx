import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import {
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Typography,
  type IconButtonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import type { DataSources, StatusMap, StatusData } from "./types";

export type StatusControllerProps = {
  能登地震孤立地域情報まとめ: StatusData | null;
  各機関活動状況: StatusData | null;
  応急給水拠点: StatusData | null;
  google: StatusData;
  onChange能登地震孤立地域情報まとめ: (data: StatusData) => void;
  onChange各機関活動状況: (data: StatusData) => void;
  onChange応急給水拠点: (data: StatusData) => void;
  onChangeGoogle: (data:StatusData) => void;
};

type StatusState = Record<string, boolean>

export type StateMap = Record<DataSources, StatusState>;

const Expand = styled((props: IconButtonProps & { expand: boolean }) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const StatusController = ({
  能登地震孤立地域情報まとめ,
  各機関活動状況,
  応急給水拠点,
  google,
  onChange能登地震孤立地域情報まとめ,
  onChange各機関活動状況,
  onChange応急給水拠点,
  onChangeGoogle,
}: StatusControllerProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ position: "absolute", top: 64 + 16, right: 0, maxWidth: 480 }}>
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
      <Collapse
        in={expanded}
        orientation="horizontal"
        timeout="auto"
        unmountOnExit
      >
        <CardContent sx={{ visibility: expanded ? "visible" : "hidden" }}>
          <FormGroup>
            <Stack gap={3}>
              <Status
                title="能登地震孤立地域情報まとめ（更新停止）"
                dataSource="能登地震孤立地域情報まとめ"
                status={能登地震孤立地域情報まとめ}
                onChange={(key, status, checked) => {
                  能登地震孤立地域情報まとめ[status].checked = checked
                  onChange能登地震孤立地域情報まとめ({ ...能登地震孤立地域情報まとめ })
                }}
              />
              <Status
                dataSource="各機関活動状況"
                status={各機関活動状況}
                onChange={(key, status, checked) => {
                  各機関活動状況[status].checked = checked
                  onChange各機関活動状況({ ...各機関活動状況 })
                }}
              />
              <Status
                dataSource="応急給水拠点"
                status={応急給水拠点}
                onChange={(key, status, checked) => {
                  応急給水拠点[status].checked = checked
                  onChange応急給水拠点({ ...応急給水拠点 })
                }}
              />
              <Status
                dataSource="Google"
                status={google}
                onChange={(key, status, checked) => {
                  google[status].checked = checked
                  onChangeGoogle({ ...google })
                }}
              />
            </Stack>
          </FormGroup>
        </CardContent>
      </Collapse>
    </Card>
  );
};

type StatusProps = {
  title?: string
  dataSource: DataSources
  status: StatusData | null
  onChange: (dataSource: DataSources, key: string, checked: boolean) => void
}

function Status(props: StatusProps) {
  return (
    <Stack>
      <Typography fontWeight={600}>{props.title ?? props.dataSource}</Typography>
      <Stack>
        {props.status && Object.entries(props.status).map(([key, val]) => {
          return (
            <StatusElem
              key={key}
              statusKey={key}
              label={val.label}
              status={val}
              onChange={(k, checked) => {
                props.onChange(
                  props.dataSource,
                  k,
                  checked
                )
              }}
            />
          )
        })}
      </Stack>
    </Stack>
  )
}

type StatueElemProps = {
  statusKey: string
  label: string
  status: StatusData[string]
  onChange: (statusKey: string, checked: boolean) => void
}

function StatusElem(props: StatueElemProps) {
  const name = props.status.layer?.getMetadata()?.name ?? props.label

  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          name={props.label}
          onChange={(event) => {
            props.onChange(
              props.statusKey,
              event.target.checked
            );
          }}
          checked={props.status.checked}
        />
      }
      label={name}
    />
  )
}
