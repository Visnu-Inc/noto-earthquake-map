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
  statusList: StatusMap | null;
  onChange: (status: StatusMap) => void;
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
  statusList,
  onChange,
}: StatusControllerProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: DataSources, status: string, checked: boolean) => {
    statusList[key][status].checked = checked
    onChange({ ...statusList });
  };

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
              {!statusList
                ? null
                : Object.keys(statusList).map((key) => {
                      const status = statusList[key];
                      return (
                        <Status
                          key={key}
                          dataSource={key}
                          status={status}
                          onChange={handleChange}
                        />
                      );
                    }
                  )
              }
            </Stack>
          </FormGroup>
        </CardContent>
      </Collapse>
    </Card>
  );
};

type StatusProps = {
  dataSource: string
  status: StatusData
  onChange: (dataSource: string, key: string, checked: boolean) => void
}

function Status(props: StatusProps) {
  return (
    <Stack>
      <Typography fontWeight={600}>{props.dataSource}</Typography>
      <Stack>
        {Object.entries(props.status).map(([key, val]) => {
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
