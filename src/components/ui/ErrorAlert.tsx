"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  AlertProps,
  Snackbar,
  SnackbarProps,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ErrorType } from "../../../lib/errors";

interface ErrorAlertProps {
  message: string;
  type?: ErrorType;
  onClose?: () => void;
  autoHideDuration?: number | null; // null means no auto-hide
  severity?: AlertProps["severity"];
  variant?: AlertProps["variant"];
  action?: React.ReactNode;
  showInline?: boolean; // Whether to show as inline alert instead of snackbar
}

/**
 * A component for displaying error messages consistently
 * Can be displayed as a snackbar (default) or inline alert
 */
export default function ErrorAlert({
  message,
  type = ErrorType.UNKNOWN_ERROR,
  onClose,
  autoHideDuration = 6000, // 6 seconds by default
  severity = "error",
  variant = "filled",
  action,
  showInline = false,
}: ErrorAlertProps) {
  const [open, setOpen] = useState(true);

  // Map error types to appropriate severity if not explicitly provided
  useEffect(() => {
    if (severity === "error") {
      switch (type) {
        case ErrorType.VALIDATION_ERROR:
        case ErrorType.INPUT_ERROR:
          severity = "warning";
          break;
        case ErrorType.NETWORK_ERROR:
        case ErrorType.RATE_LIMIT_ERROR:
          severity = "info";
          break;
        // All other types remain as 'error'
      }
    }
  }, [type]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Create action buttons with close by default
  const actionButtons = (
    <>
      {action}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  // If inline, return a regular Alert
  if (showInline) {
    return (
      <Alert
        severity={severity}
        variant={variant}
        onClose={handleClose}
        action={actionButtons}
        sx={{ mb: 2 }}
      >
        <Box>
          {type && (
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                display: "block",
                fontWeight: "bold",
                mb: 0.5,
              }}
            >
              {type.replace("_", " ")}
            </Typography>
          )}
          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
    );
  }

  // Otherwise return a Snackbar with Alert
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant={variant}
        sx={{ width: "100%" }}
        action={actionButtons}
      >
        <Box>
          {type && (
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                display: "block",
                fontWeight: "bold",
                mb: 0.5,
              }}
            >
              {type.replace("_", " ")}
            </Typography>
          )}
          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}