import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  CheckCircle,
  BarChart,
  Logout,
  Today,
  AccessTime,
  Refresh,
  Cancel,
  HourglassEmpty,
  CalendarMonth,
  EventNote,
  DateRange,
  Groups,
  Hotel,
  Business,
  Schedule,
  MeetingRoom,
} from "@mui/icons-material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../components/MiniDrawer";
import { useThemeContext } from "../context/ThemeContext";
import { getDashboardData } from "../utilities/apiUtils/apiHelper";

// ─── Constants ───────────────────────────────────────────────
const PERIOD_OPTIONS = [
  { value: "today", label: "Today", icon: <Today fontSize="small" /> },
  {
    value: "yesterday",
    label: "Yesterday",
    icon: <EventNote fontSize="small" />,
  },
  { value: "last7days", label: "7 Days", icon: <DateRange fontSize="small" /> },
  {
    value: "last30days",
    label: "30 Days",
    icon: <CalendarMonth fontSize="small" />,
  },
  {
    value: "thisMonth",
    label: "This Month",
    icon: <CalendarMonth fontSize="small" />,
  },
  {
    value: "lastMonth",
    label: "Last Month",
    icon: <CalendarMonth fontSize="small" />,
  },
  {
    value: "thisYear",
    label: "This Year",
    icon: <DateRange fontSize="small" />,
  },
];

const CHART_COLORS = {
  total: "#3b82f6",
  approved: "#22c55e",
  pending: "#f59e0b",
  rejected: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  pink: "#ec4899",
};

const PIE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

// ─── StatCard Component ──────────────────────────────────────
const StatCard = ({ title, value, icon, color, subtitle }) => {
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: isDark
            ? `0 12px 40px ${color}30`
            : `0 12px 40px ${color}25`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        }}
      />
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.68rem",
                mb: 0.8,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
                mb: 0.3,
              }}
            >
              {value ?? 0}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color,
              width: 48,
              height: 48,
              borderRadius: 2.5,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── ChartCard Wrapper ───────────────────────────────────────
const ChartCard = ({
  title,
  icon,
  iconColor,
  children,
  height = 300,
  description,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Avatar
          sx={{
            bgcolor: alpha(iconColor, 0.1),
            color: iconColor,
            mr: 1.5,
            width: 36,
            height: 36,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ width: "100%", height, mt: 1 }}>{children}</Box>
    </Paper>
  );
};

// ─── Custom Recharts Tooltip ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: 3, minWidth: 140 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, mb: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Box
          key={i}
          sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
        >
          <Typography
            variant="caption"
            sx={{ color: entry.color, fontWeight: 600 }}
          >
            {entry.name}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

// ─── Dashboard Component ─────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const username = localStorage.getItem("username") || "User";
  const isDark = mode === "dark";

  const [period, setPeriod] = useState("last30days");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardData(selectedPeriod);
      // response shape: { success, message, data: { dateRange, cards, graphs } }
      setDashboardData(response?.data || response);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.message ||
          err?.errorDescription ||
          "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(period);
  }, [period, fetchDashboard]);

  const handlePeriodChange = (_, newPeriod) => {
    if (newPeriod !== null) setPeriod(newPeriod);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/");
  };

  const cards = dashboardData?.cards || {};
  const graphs = dashboardData?.graphs || {};
  const dateRange = dashboardData?.dateRange || {};

  // ── Stat Cards ──
  const primaryStats = [
    {
      title: "Total Visitors",
      value: cards.totalVisitors,
      icon: <Groups fontSize="large" />,
      color: "#3b82f6",
      subtitle: "All visitor requests",
    },
    {
      title: "Pending Requests",
      value: cards.pendingRequests,
      icon: <HourglassEmpty fontSize="large" />,
      color: "#f59e0b",
      subtitle: "Awaiting approval",
    },
    {
      title: "Approved Requests",
      value: cards.approvedRequests,
      icon: <CheckCircle fontSize="large" />,
      color: "#22c55e",
      subtitle: `${cards.approvalRate ?? 0}% approval rate`,
    },
    {
      title: "Rejected Requests",
      value: cards.rejectedRequests,
      icon: <Cancel fontSize="large" />,
      color: "#ef4444",
      subtitle: `${cards.rejectionRate ?? 0}% rejection rate`,
    },
  ];

  const secondaryStats = [
    {
      title: "Guest House Alloc.",
      value: cards.guestHouseAllocations,
      icon: <Hotel fontSize="large" />,
      color: "#06b6d4",
      subtitle: `${cards.totalGuestHouses ?? 0} guest houses`,
    },
    {
      title: "Total Offices",
      value: cards.totalOffices,
      icon: <Business fontSize="large" />,
      color: "#ec4899",
      subtitle: "Registered offices",
    },
  ];

  // Combine all stats into a single array for single-line display
  const allStats = [...primaryStats, ...secondaryStats];

  // ── Chart Data ──
  const monthlyTrendData = useMemo(() => {
    const raw = graphs.monthlyVisitorTrend?.data || [];
    return raw.map((d) => ({
      month: d.month,
      Total: d.total,
      Approved: d.APPROVED,
      Pending: d.PENDING,
      Rejected: d.REJECTED,
    }));
  }, [graphs.monthlyVisitorTrend]);

  const departmentData = useMemo(() => {
    return (graphs.departmentWiseVisitors?.data || []).map((d) => ({
      name: d.department,
      visitors: d.visitorCount,
    }));
  }, [graphs.departmentWiseVisitors]);

  const dayOfWeekData = useMemo(() => {
    return (graphs.dayOfWeekDistribution?.data || []).map((d) => ({
      day: d.day?.slice(0, 3),
      count: d.count,
    }));
  }, [graphs.dayOfWeekDistribution]);

  const avgDurationData = useMemo(() => {
    return (graphs.avgVisitDuration?.data || []).map((d) => ({
      department: d.department,
      days: d.avgDurationDays,
      visitors: d.totalVisitors,
    }));
  }, [graphs.avgVisitDuration]);

  const officeData = useMemo(() => {
    return (graphs.officeWiseVisitors?.data || []).map((d) => ({
      name: d.officeName,
      visitors: d.visitorCount,
    }));
  }, [graphs.officeWiseVisitors]);

  const guestHouseData = useMemo(() => {
    return (graphs.guestHouseUtilization?.data || []).map((d) => ({
      name: d.guestHouseName,
      bookings: d.bookingCount,
    }));
  }, [graphs.guestHouseUtilization]);

  // ── Helpers ──
  const getPeriodLabel = () =>
    PERIOD_OPTIONS.find((o) => o.value === period)?.label || period;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderSkeletons = (count = 4) =>
    Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={50} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      </Grid>
    ));

  const chartAxisStyle = {
    fontSize: 11,
    fill: isDark ? "#94a3b8" : "#64748b",
  };

  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const todaySummary = cards.todaySummary;

  return (
    <MiniDrawer>
      {/* ─── Header ─── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: 800, mb: 0.3 }}
          >
            {getGreeting()}, {username} 👋
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Visitor management overview
            </Typography>
            {dateRange.from && dateRange.to && (
              <Chip
                icon={<DateRange sx={{ fontSize: 14 }} />}
                label={`${dateRange.from} — ${dateRange.to}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, fontSize: "0.72rem" }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={() => fetchDashboard(period)}
              color="primary"
              disabled={loading}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<Logout />}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* ─── Period Filter ─── */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
          <CalendarMonth fontSize="small" color="primary" />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Period:
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          sx={{
            flexWrap: "wrap",
            gap: 0.5,
            "& .MuiToggleButton-root": {
              borderRadius: "10px !important",
              border: "1px solid",
              borderColor: isDark
                ? "rgba(255,255,255,0.12) !important"
                : "rgba(0,0,0,0.12) !important",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 2,
              py: 0.6,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                borderColor: "primary.main !important",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {!isMobile && (
                <Box sx={{ mr: 0.5, display: "flex" }}>{opt.icon}</Box>
              )}
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchDashboard(period)}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ─── Today Summary Banner ─── */}
      {todaySummary && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.10))"
              : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))",
            border: "1px solid",
            borderColor: isDark
              ? "rgba(59,130,246,0.2)"
              : "rgba(59,130,246,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Today sx={{ color: "#3b82f6" }} />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Today's Summary
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          {[
            { label: "Total", val: todaySummary.total, color: "#3b82f6" },
            { label: "Pending", val: todaySummary.pending, color: "#f59e0b" },
            { label: "Approved", val: todaySummary.approved, color: "#22c55e" },
            { label: "Rejected", val: todaySummary.rejected, color: "#ef4444" },
          ].map((s) => (
            <Box
              key={s.label}
              sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: s.color,
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, color: "text.secondary" }}
              >
                {s.label}:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {s.val ?? 0}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* ─── All Stat Cards (6 in one row) ─── */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {loading
          ? renderSkeletons(6)
          : allStats.map((card, i) => (
              <Grid
                item
                key={i}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    md: "calc(16.666% - 9px)",
                  },
                  flexBasis: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    md: "calc(16.666% - 9px)",
                  },
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              >
                <StatCard {...card} />
              </Grid>
            ))}
      </Grid>

      {/* ─── All Charts in Single Row ─── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Monthly Trend */}
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="Monthly Trend"
              description={graphs.monthlyVisitorTrend?.description}
              icon={<BarChart fontSize="small" />}
              iconColor="#8b5cf6"
              height={350}
            >
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={monthlyTrendData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="month"
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar
                      dataKey="Approved"
                      fill={CHART_COLORS.approved}
                      radius={[3, 3, 0, 0]}
                      barSize={16}
                    />
                    <Bar
                      dataKey="Pending"
                      fill={CHART_COLORS.pending}
                      radius={[3, 3, 0, 0]}
                      barSize={16}
                    />
                    <Bar
                      dataKey="Rejected"
                      fill={CHART_COLORS.rejected}
                      radius={[3, 3, 0, 0]}
                      barSize={16}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography color="text.disabled">No monthly data</Typography>
                </Box>
              )}
            </ChartCard>
          )}
        </Grid>

        {/* By Department + By Day of Week (Stacked) */}
        <Grid item xs={12} sm={6} md={3}>
          <Grid container spacing={2} direction="column">
            {/* By Department - Top */}
            <Grid item xs={12}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={165}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <ChartCard
                  title="By Department"
                  description={graphs.departmentWiseVisitors?.description}
                  icon={<Business fontSize="small" />}
                  iconColor="#ec4899"
                  height={165}
                >
                  {departmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={departmentData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridStroke}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={chartAxisStyle}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ ...chartAxisStyle, fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          width={70}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="visitors"
                          fill="#ec4899"
                          radius={[0, 6, 6, 0]}
                          barSize={14}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography color="text.disabled">
                        No department data
                      </Typography>
                    </Box>
                  )}
                </ChartCard>
              )}
            </Grid>

            {/* By Day of Week - Bottom */}
            <Grid item xs={12}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={165}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <ChartCard
                  title="By Day of Week"
                  description={graphs.dayOfWeekDistribution?.description}
                  icon={<Schedule fontSize="small" />}
                  iconColor="#f59e0b"
                  height={165}
                >
                  {dayOfWeekData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={dayOfWeekData}
                        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridStroke}
                        />
                        <XAxis
                          dataKey="day"
                          tick={chartAxisStyle}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={chartAxisStyle}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={20}>
                          {dayOfWeekData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography color="text.disabled">No data</Typography>
                    </Box>
                  )}
                </ChartCard>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* By Office */}
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="By Office"
              description={graphs.officeWiseVisitors?.description}
              icon={<MeetingRoom fontSize="small" />}
              iconColor="#3b82f6"
              height={350}
            >
              {officeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={officeData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="name"
                      tick={{ ...chartAxisStyle, fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="visitors"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography color="text.disabled">No office data</Typography>
                </Box>
              )}
            </ChartCard>
          )}
        </Grid>

        {/* Avg Duration + Guest House (Stacked) */}
        <Grid item xs={12} sm={6} md={3}>
          <Grid container spacing={2} direction="column">
            {/* Avg Visit Duration - Top */}
            <Grid item xs={12}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={165}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <ChartCard
                  title="Avg Visit Duration"
                  description={graphs.avgVisitDuration?.description}
                  icon={<AccessTime fontSize="small" />}
                  iconColor="#8b5cf6"
                  height={165}
                >
                  {avgDurationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={avgDurationData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridStroke}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={chartAxisStyle}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="department"
                          tick={{ ...chartAxisStyle, fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          width={70}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="days"
                          name="Avg Days"
                          fill="#8b5cf6"
                          radius={[0, 6, 6, 0]}
                          barSize={14}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography color="text.disabled">
                        No duration data
                      </Typography>
                    </Box>
                  )}
                </ChartCard>
              )}
            </Grid>

            {/* Guest House Utilization - Bottom */}
            <Grid item xs={12}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={165}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <ChartCard
                  title="Guest House Utilization"
                  description={graphs.guestHouseUtilization?.description}
                  icon={<Hotel fontSize="small" />}
                  iconColor="#22c55e"
                  height={165}
                >
                  {guestHouseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={guestHouseData}
                        margin={{ top: 5, right: 10, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridStroke}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ ...chartAxisStyle, fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                          angle={-20}
                          textAnchor="end"
                          height={35}
                        />
                        <YAxis
                          tick={chartAxisStyle}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="bookings"
                          fill="#22c55e"
                          radius={[6, 6, 0, 0]}
                          barSize={20}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography color="text.disabled">
                        No guest house data
                      </Typography>
                    </Box>
                  )}
                </ChartCard>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MiniDrawer>
  );
};

export default Dashboard;
