import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  Button,
  Box,
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
  CheckCircleOutline,
  BarChart,
  Logout,
  Today,
  AccessTime,
  Refresh,
  HighlightOff,
  HourglassEmpty,
  CalendarMonth,
  EventNote,
  DateRange,
  GroupsOutlined,
  HotelOutlined,
  BusinessOutlined,
  Schedule,
  MeetingRoomOutlined,
  InsertChartOutlined,
} from "@mui/icons-material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../components/MiniDrawer";
import { StatCard, BRAND_GRADIENT } from "../components/ui";
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

// Chart colors validated for CVD separation + contrast on each mode's card surface.
// Status trio = request state; single-series charts use the brand color.
const getChartColors = (isDark) =>
  isDark
    ? { approved: "#15803d", pending: "#d97706", rejected: "#b91c1c", series: "#6366f1" }
    : { approved: "#15803d", pending: "#f59e0b", rejected: "#dc2626", series: "#4f46e5" };

// ─── ChartCard Wrapper ───────────────────────────────────────
const ChartCard = ({ title, icon, iconColor, children, height = 300, description, legend }) => (
  <Paper sx={{ p: { xs: 2, sm: 2.5 }, height: "100%", display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          color: iconColor,
          bgcolor: alpha(iconColor, 0.12),
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.3 }}>{title}</Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4 }}>
            {description}
          </Typography>
        )}
      </Box>
      {legend && (
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1.5, flexWrap: "wrap", pt: 0.5 }}>
          {legend.map((l) => (
            <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: l.color }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {l.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
    {legend && (
      <Box sx={{ display: { xs: "flex", sm: "none" }, gap: 1.5, mb: 1 }}>
        {legend.map((l) => (
          <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: l.color }} />
            <Typography variant="caption" color="text.secondary">{l.label}</Typography>
          </Box>
        ))}
      </Box>
    )}
    <Box sx={{ width: "100%", height, mt: "auto" }}>{children}</Box>
  </Paper>
);

const truncateLabel = (v) => (typeof v === "string" && v.length > 28 ? `${v.slice(0, 27)}…` : v);

const EmptyChart = ({ text }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 1,
      height: "100%",
      borderRadius: 2,
      border: "1px dashed",
      borderColor: "divider",
      color: "text.disabled",
    }}
  >
    <InsertChartOutlined />
    <Typography variant="body2">{text}</Typography>
  </Box>
);

// ─── Custom Recharts Tooltip ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ px: 1.5, py: 1.25, borderRadius: 2, boxShadow: 8, minWidth: 150 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.75, display: "block" }}>
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: entry.color, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: "text.secondary", flex: 1, textTransform: "capitalize" }}>
            {entry.name}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
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
  const allStats = [
    {
      title: "Total Visitors",
      value: cards.totalVisitors,
      icon: <GroupsOutlined />,
      color: "#6366f1",
      subtitle: "All visitor requests",
    },
    {
      title: "Pending Requests",
      value: cards.pendingRequests,
      icon: <HourglassEmpty />,
      color: "#f59e0b",
      subtitle: "Awaiting approval",
    },
    {
      title: "Approved Requests",
      value: cards.approvedRequests,
      icon: <CheckCircleOutline />,
      color: "#16a34a",
      subtitle: `${cards.approvalRate ?? 0}% approval rate`,
    },
    {
      title: "Rejected Requests",
      value: cards.rejectedRequests,
      icon: <HighlightOff />,
      color: "#ef4444",
      subtitle: `${cards.rejectionRate ?? 0}% rejection rate`,
    },
    {
      title: "Guest House Alloc.",
      value: cards.guestHouseAllocations,
      icon: <HotelOutlined />,
      color: "#06b6d4",
      subtitle: `${cards.totalGuestHouses ?? 0} guest houses`,
    },
    {
      title: "Total Offices",
      value: cards.totalOffices,
      icon: <BusinessOutlined />,
      color: "#ec4899",
      subtitle: "Registered offices",
    },
  ];

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
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const colors = getChartColors(isDark);

  const chartAxisStyle = {
    fontSize: 11,
    fill: isDark ? "#a1a1aa" : "#71717a",
  };

  const gridStroke = isDark ? "#27272a" : "#ececee";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(24,24,27,0.04)";

  const todaySummary = cards.todaySummary;

  const smallChartHeight = 200;

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
            component="h1"
            sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.9rem" }, letterSpacing: "-0.03em", lineHeight: 1.2 }}
          >
            {getGreeting()}, {username} 👋
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Visitor management overview
            </Typography>
            {dateRange.from && dateRange.to && (
              <Chip
                icon={<DateRange sx={{ fontSize: 14 }} />}
                label={`${dateRange.from} — ${dateRange.to}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, bgcolor: "background.paper" }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh data">
            <span>
              <IconButton
                onClick={() => fetchDashboard(period)}
                disabled={loading}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  width: 38,
                  height: 38,
                  "&:hover": { bgcolor: "background.paper", color: "primary.main" },
                  "& svg": {
                    fontSize: 20,
                    animation: loading ? "spin 0.9s linear infinite" : "none",
                  },
                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                }}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{ bgcolor: "background.paper", height: 38 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* ─── Period Filter ─── */}
      <Box
        sx={{
          mb: 3,
          overflowX: "auto",
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          aria-label="Period"
          sx={{
            p: 0.5,
            gap: 0.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: "divider",
            bgcolor: isDark ? "#1c1c20" : "#f4f4f5",
            "& .MuiToggleButton-root": {
              border: "0 !important",
              borderRadius: "8px !important",
              m: "0 !important",
              px: 1.75,
              py: 0.6,
              fontSize: "0.8125rem",
              whiteSpace: "nowrap",
              color: "text.secondary",
              gap: 0.75,
              "& svg": { fontSize: 16 },
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              "&.Mui-selected": {
                bgcolor: "background.paper",
                color: "primary.main",
                boxShadow: 2,
                "&:hover": { bgcolor: "background.paper" },
              },
            },
          }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {!isMobile && opt.icon}
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
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
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 4,
            color: "#fff",
            background: BRAND_GRADIENT,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 16px 40px -16px rgba(99,102,241,0.6)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: { xs: 2, md: 3 },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 85% -20%, rgba(255,255,255,0.28), transparent 45%), radial-gradient(circle at 0% 120%, rgba(255,255,255,0.12), transparent 40%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 190, position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Today />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>Today's Summary</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Live snapshot of today's requests
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: 1.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            {[
              { label: "Total", val: todaySummary.total, color: "#c7d2fe" },
              { label: "Pending", val: todaySummary.pending, color: "#fcd34d" },
              { label: "Approved", val: todaySummary.approved, color: "#86efac" },
              { label: "Rejected", val: todaySummary.rejected, color: "#fca5a5" },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  px: 2,
                  py: 1.25,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    {s.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.2, mt: 0.25 }}>
                  {s.val ?? 0}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ─── Stat Cards ─── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, md: 4, lg: 2 }}>
                <Card sx={{ p: 2.5 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Card>
              </Grid>
            ))
          : allStats.map((card) => (
              <Grid key={card.title} size={{ xs: 6, md: 4, lg: 2 }}>
                <StatCard {...card} />
              </Grid>
            ))}
      </Grid>

      {/* ─── Charts ─── */}
      <Grid container spacing={2}>
        {/* Monthly Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {loading ? (
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="Monthly Trend"
              description={graphs.monthlyVisitorTrend?.description}
              icon={<BarChart />}
              iconColor="#8b5cf6"
              height={300}
              legend={[
                { label: "Approved", color: colors.approved },
                { label: "Pending", color: colors.pending },
                { label: "Rejected", color: colors.rejected },
              ]}
            >
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={monthlyTrendData}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    barGap={2}
                    barCategoryGap="22%"
                  >
                    <CartesianGrid vertical={false} stroke={gridStroke} />
                    <XAxis
                      dataKey="month"
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={{ stroke: gridStroke }}
                      tickMargin={8}
                    />
                    <YAxis
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar dataKey="Approved" fill={colors.approved} radius={[4, 4, 0, 0]} maxBarSize={14} />
                    <Bar dataKey="Pending" fill={colors.pending} radius={[4, 4, 0, 0]} maxBarSize={14} />
                    <Bar dataKey="Rejected" fill={colors.rejected} radius={[4, 4, 0, 0]} maxBarSize={14} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No monthly data" />
              )}
            </ChartCard>
          )}
        </Grid>

        {/* By Office */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="By Office"
              description={graphs.officeWiseVisitors?.description}
              icon={<MeetingRoomOutlined />}
              iconColor="#3b82f6"
              height={300}
            >
              {officeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={officeData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke={gridStroke} />
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
                      tick={chartAxisStyle}
                      tickFormatter={truncateLabel}
                      tickLine={false}
                      axisLine={false}
                      width={110}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar dataKey="visitors" fill={colors.series} radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No office data" />
              )}
            </ChartCard>
          )}
        </Grid>

        {/* By Department */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="By Department"
              description={graphs.departmentWiseVisitors?.description}
              icon={<BusinessOutlined />}
              iconColor="#ec4899"
              height={smallChartHeight}
            >
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke={gridStroke} />
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
                      tick={chartAxisStyle}
                      tickFormatter={truncateLabel}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar dataKey="visitors" fill={colors.series} radius={[0, 4, 4, 0]} maxBarSize={18} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No department data" />
              )}
            </ChartCard>
          )}
        </Grid>

        {/* By Day of Week */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="By Day of Week"
              description={graphs.dayOfWeekDistribution?.description}
              icon={<Schedule />}
              iconColor="#f59e0b"
              height={smallChartHeight}
            >
              {dayOfWeekData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={dayOfWeekData}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke={gridStroke} />
                    <XAxis
                      dataKey="day"
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={{ stroke: gridStroke }}
                    />
                    <YAxis
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar dataKey="count" fill={colors.series} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No data" />
              )}
            </ChartCard>
          )}
        </Grid>

        {/* Avg Visit Duration */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="Avg Visit Duration"
              description={graphs.avgVisitDuration?.description}
              icon={<AccessTime />}
              iconColor="#8b5cf6"
              height={smallChartHeight}
            >
              {avgDurationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={avgDurationData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke={gridStroke} />
                    <XAxis
                      type="number"
                      tick={chartAxisStyle}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="department"
                      tick={chartAxisStyle}
                      tickFormatter={truncateLabel}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar
                      dataKey="days"
                      name="Avg Days"
                      fill={colors.series}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={18}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No duration data" />
              )}
            </ChartCard>
          )}
        </Grid>

        {/* Guest House Utilization */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={290} sx={{ borderRadius: 3 }} />
          ) : (
            <ChartCard
              title="Guest House Utilization"
              description={graphs.guestHouseUtilization?.description}
              icon={<HotelOutlined />}
              iconColor="#22c55e"
              height={smallChartHeight}
            >
              {guestHouseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={guestHouseData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke={gridStroke} />
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
                      tick={chartAxisStyle}
                      tickFormatter={truncateLabel}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                    <Bar dataKey="bookings" fill={colors.series} radius={[0, 4, 4, 0]} maxBarSize={18} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="No guest house data" />
              )}
            </ChartCard>
          )}
        </Grid>
      </Grid>
    </MiniDrawer>
  );
};

export default Dashboard;
