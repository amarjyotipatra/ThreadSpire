"use client";

import { IconButton, Menu, MenuItem } from "@mui/material";
import { LightMode, DarkMode, SettingsBrightness } from "@mui/icons-material";
import { useState } from "react";
import { useTheme } from "../providers/mui-theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    handleClose();
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "theme-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {theme === "light" && <LightMode fontSize="small" />}
        {theme === "dark" && <DarkMode fontSize="small" />}
        {theme === "system" && <SettingsBrightness fontSize="small" />}
      </IconButton>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "theme-button",
        }}
      >
        <MenuItem onClick={() => handleThemeChange("light")}>Light</MenuItem>
        <MenuItem onClick={() => handleThemeChange("dark")}>Dark</MenuItem>
        <MenuItem onClick={() => handleThemeChange("system")}>System</MenuItem>
      </Menu>
    </div>
  );
}