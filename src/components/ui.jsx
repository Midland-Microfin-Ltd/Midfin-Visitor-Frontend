import React from "react";
import { Box, Card, Typography, TextField, InputAdornment } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Search as SearchIcon } from "@mui/icons-material";

export const BRAND_GRADIENT = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a855f7 100%)";

export const IconTile = ({ children, size = 44, sx }) => (
  <Box
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: 3,
      display: "grid",
      placeItems: "center",
      color: "#fff",
      background: BRAND_GRADIENT,
      boxShadow: "0 8px 20px -6px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
      "& svg": { fontSize: size * 0.5 },
      ...sx,
    }}
  >
    {children}
  </Box>
);

export const PageHeader = ({ title, subtitle, icon, actions }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: 2,
      mb: 3,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
      {icon && <IconTile>{icon}</IconTile>}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700, fontSize: { xs: "1.35rem", sm: "1.6rem" }, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>}
  </Box>
);

export const SearchField = ({ sx, ...props }) => (
  <TextField
    size="small"
    variant="outlined"
    {...props}
    sx={{
      width: { xs: "100%", sm: 340 },
      "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
      ...sx,
    }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </InputAdornment>
        ),
      },
    }}
  />
);

// shadcn-style segmented tabs: pass to <Tabs sx={segmentedTabsSx}>
export const segmentedTabsSx = {
  minHeight: 0,
  p: 0.5,
  borderRadius: 2.5,
  border: 1,
  borderColor: "divider",
  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1c1c20" : "#f4f4f5"),
  maxWidth: "100%",
  "& .MuiTabs-indicator": { display: "none" },
  "& .MuiTabs-flexContainer": { gap: 0.5 },
  "& .MuiTab-root": {
    minHeight: 34,
    py: 0.75,
    px: 2,
    borderRadius: 2,
    color: "text.secondary",
    transition: "color .15s ease, background-color .15s ease, box-shadow .15s ease",
    "&:hover": { color: "text.primary" },
  },
  "& .MuiTab-root.Mui-selected": {
    color: "text.primary",
    bgcolor: "background.paper",
    boxShadow: 2,
  },
  "& .MuiTab-iconWrapper": { fontSize: 18 },
};

export const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card
    sx={{
      p: 2.5,
      height: "100%",
      position: "relative",
      overflow: "hidden",
      transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 6,
        borderColor: alpha(color, 0.45),
      },
    }}
  >
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: -48,
        right: -48,
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(color, 0.16)} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, pt: 0.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          color,
          bgcolor: alpha(color, 0.12),
          "& svg": { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography
      sx={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, mt: 1 }}
    >
      {value ?? 0}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
        {subtitle}
      </Typography>
    )}
  </Card>
);

export const EmptyState = ({ icon, title, description }) => (
  <Box sx={{ py: 7, px: 2, textAlign: "center" }}>
    <Box
      sx={{
        mx: "auto",
        mb: 1.5,
        width: 48,
        height: 48,
        borderRadius: 3,
        display: "grid",
        placeItems: "center",
        bgcolor: "action.hover",
        color: "text.secondary",
        border: 1,
        borderColor: "divider",
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {description}
      </Typography>
    )}
  </Box>
);
