import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";
import {
  createGuardSession,
  getGuardVisitors,
  getOffice,
  guardCheckIn,
  guardCheckOut,
} from "../../utilities/apiUtils/apiHelper";
import {
  removeFromLocalStorage,
  retrieveObjectFromLocalStorage,
  storeObjectInLocalStorage,
} from "../../utilities/localStorageUtils";

const SESSION_KEY = "guardSession";

const STATUS_CHIP = {
  INSIDE: { label: "Inside", color: "success" },
  OVERDUE: { label: "Overdue", color: "error" },
  NOT_ARRIVED: { label: "Not arrived", color: "default" },
  CHECKED_OUT: { label: "Checked out", color: "info" },
};

// IST is a fixed +05:30, so this is the same calendar day the server puts in the session's issuedFor.
const istDate = (ms = Date.now()) => new Date(ms + 330 * 60000).toISOString().slice(0, 10);
const istTime = (value) =>
  new Date(value).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
const todayTime = (value) => (value && istDate(new Date(value).getTime()) === istDate() ? istTime(value) : null);
const expectedLabel = (value) => {
  if (!value) return "not given";
  const time = todayTime(value);
  if (time) return time;
  const day = new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
  return `${day}, ${istTime(value)}`;
};
const errorText = (err) => err?.errorDescription || "Something went wrong. Please try again.";

// A session is only good on the IST day it was issued for; the server enforces the same.
const loadSession = () => {
  try {
    const session = retrieveObjectFromLocalStorage(SESSION_KEY);
    return session?.token && session.issuedFor === istDate() ? session : null;
  } catch {
    return null;
  }
};

function PinScreen({ onLogin, notice }) {
  const [offices, setOffices] = useState([]);
  const [officesFailed, setOfficesFailed] = useState(false);
  const [officeId, setOfficeId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(notice);
  const [lockedOut, setLockedOut] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadOffices = useCallback(() => {
    getOffice()
      .then((res) => {
        setOffices(res.data || []);
        setOfficesFailed(false);
      })
      .catch(() => setOfficesFailed(true));
  }, []);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await createGuardSession({ officeId, pin });
      onLogin({ ...res.data, officeName: offices.find((o) => o.id === officeId)?.name });
    } catch (err) {
      setPin("");
      setLockedOut(err?.status === 429);
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper component="form" onSubmit={submit} sx={{ p: 3, width: "100%", maxWidth: 380 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <ShieldIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Gate check-in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose your office and enter today's PIN
              </Typography>
            </Box>
          </Stack>

          {officesFailed && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadOffices}>
                  Retry
                </Button>
              }
            >
              Couldn't load offices. Check the connection.
            </Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel id="guard-office-label">Office</InputLabel>
            <Select
              labelId="guard-office-label"
              label="Office"
              value={officeId}
              onChange={(e) => setOfficeId(e.target.value)}
            >
              {offices.map((office) => (
                <MenuItem key={office.id} value={office.id}>
                  {office.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="6-digit PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoComplete="off"
            required
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 6 }}
          />

          {error && <Alert severity={lockedOut ? "warning" : "error"}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={busy || !officeId || pin.length !== 6}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {busy ? "Checking…" : "Unlock"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

function VisitorCard({ visitor, onCheckIn, onCheckOut }) {
  const inTime = todayTime(visitor.actualInTime);
  const outTime = visitor.status === "CHECKED_OUT" ? todayTime(visitor.actualOutTime) : null;
  const canCheckIn = visitor.status === "NOT_ARRIVED" || visitor.status === "CHECKED_OUT";
  const details = [
    visitor.purpose,
    visitor.personToMeet && `meeting ${visitor.personToMeet}`,
    visitor.department,
  ].filter(Boolean);

  return (
    <Card variant="outlined" sx={{ opacity: visitor.pending ? 0.7 : 1 }}>
      <CardContent sx={{ display: "flex", gap: 1.5, pb: 1 }}>
        <Avatar src={visitor.selfieUrl || undefined} alt={visitor.name} sx={{ width: 56, height: 56 }}>
          {visitor.name?.[0]}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography fontWeight={600} sx={{ wordBreak: "break-word" }}>
              {visitor.name}
            </Typography>
            <Chip size="small" {...STATUS_CHIP[visitor.status]} />
          </Stack>
          {visitor.phoneNo && (
            <Typography
              variant="body2"
              component="a"
              href={`tel:${visitor.phoneNo}`}
              color="text.secondary"
              sx={{ textDecoration: "none" }}
            >
              {visitor.phoneNo}
            </Typography>
          )}
          <Typography variant="body2">{details.join(" · ")}</Typography>
          <Typography variant="body2" color="text.secondary">
            Expected out {expectedLabel(visitor.expectedOutTime)}
            {inTime && ` · In ${inTime}`}
            {outTime && ` · Out ${outTime}`}
          </Typography>
          {visitor.numberOfVisitors > 1 && (
            <Chip
              size="small"
              variant="outlined"
              icon={<GroupsIcon />}
              label={`Group of ${visitor.numberOfVisitors}`}
              sx={{ mt: 0.75 }}
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        {canCheckIn ? (
          <Button fullWidth size="large" variant="contained" disabled={visitor.pending} onClick={onCheckIn}>
            {visitor.pending ? "Saving…" : visitor.status === "CHECKED_OUT" ? "Check in again" : "Check in"}
          </Button>
        ) : (
          <Button
            fullWidth
            size="large"
            variant="outlined"
            color="error"
            disabled={visitor.pending}
            onClick={onCheckOut}
          >
            {visitor.pending ? "Saving…" : "Check out"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

function VisitorList({ session, onLogout, onExpired }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [confirmOut, setConfirmOut] = useState(null);
  const [failure, setFailure] = useState(null);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  const load = useCallback(async () => {
    if (session.issuedFor !== istDate()) return onExpired();
    setLoading(true);
    try {
      const res = await getGuardVisitors(session.token);
      setVisitors(res.data.visitors);
      setLastUpdated(new Date());
      setLoadError("");
    } catch (err) {
      if (err?.status === 401) return onExpired();
      setLoadError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [session, onExpired]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when the phone wakes up; track connectivity for the offline banner.
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    const onWake = () => document.visibilityState === "visible" && load();
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [load]);

  const replace = (row) => setVisitors((list) => list.map((v) => (v.id === row.id ? row : v)));

  // Optimistic: the row changes at once and rolls back if the server doesn't confirm. A failure always stays
  // on screen with a retry, so the guard never walks away thinking an unsaved checkout was recorded.
  const act = async (visitor, action) => {
    const checkingIn = action === "checkin";
    replace({ ...visitor, pending: true, status: checkingIn ? "INSIDE" : "CHECKED_OUT" });
    setFailure(null);
    try {
      const res = await (checkingIn ? guardCheckIn : guardCheckOut)(session.token, visitor.id);
      replace(res.data);
      setToast(`${visitor.name} ${checkingIn ? "checked in" : "checked out"}`);
    } catch (err) {
      replace(visitor);
      if (err?.status === 401) return onExpired();
      setFailure({
        message: `${checkingIn ? "Check-in" : "Check-out"} for ${visitor.name} was NOT recorded. ${errorText(err)}`,
        retry: () => act(visitor, action),
      });
    }
  };

  const query = search.trim().toLowerCase();
  const shown = visitors.filter(
    (v) =>
      (showDone || v.status !== "CHECKED_OUT" || v.pending) &&
      (!query || v.name.toLowerCase().includes(query) || (v.phoneNo || "").includes(query))
  );
  const count = (status) => visitors.filter((v) => v.status === status).length;

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", pb: 12 }}>
      <Paper square elevation={2} sx={{ position: "sticky", top: 0, zIndex: 10, p: 2, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {session.officeName || `Office ${session.officeId}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {count("INSIDE") + count("OVERDUE")} inside · {count("OVERDUE")} overdue · {count("NOT_ARRIVED")}{" "}
              expected
            </Typography>
          </Box>
          <IconButton aria-label="Refresh" onClick={load} disabled={loading}>
            {loading ? <CircularProgress size={22} /> : <RefreshIcon />}
          </IconButton>
          <Button size="small" color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Stack>
        <TextField
          fullWidth
          size="small"
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={<Switch size="small" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />}
          label={<Typography variant="body2">Show checked out ({count("CHECKED_OUT")})</Typography>}
          sx={{ mt: 0.5 }}
        />
      </Paper>

      <Stack spacing={1.5} sx={{ p: 2 }}>
        {!online && (
          <Alert severity="warning" icon={<WifiOffIcon />}>
            You're offline. Check-ins and check-outs can't be saved until the connection is back.
          </Alert>
        )}
        {loadError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={load}>
                Retry
              </Button>
            }
          >
            Couldn't refresh the list. {loadError}
            {lastUpdated && ` Showing the list from ${istTime(lastUpdated)}.`}
          </Alert>
        )}
        {!loading && !loadError && shown.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
            {query ? "No visitor matches your search." : "No visitors expected right now."}
          </Typography>
        )}
        {shown.map((visitor) => (
          <VisitorCard
            key={visitor.id}
            visitor={visitor}
            onCheckIn={() => act(visitor, "checkin")}
            onCheckOut={() => setConfirmOut(visitor)}
          />
        ))}
      </Stack>

      {/* One stray tap must not check out someone still on site. */}
      <Dialog open={Boolean(confirmOut)} onClose={() => setConfirmOut(null)} fullWidth maxWidth="xs">
        <DialogTitle>Check out this visitor?</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Avatar
            src={confirmOut?.selfieUrl || undefined}
            alt={confirmOut?.name}
            sx={{ width: 120, height: 120, mx: "auto", mb: 1.5, fontSize: 40 }}
          >
            {confirmOut?.name?.[0]}
          </Avatar>
          <Typography variant="h6">{confirmOut?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {confirmOut?.phoneNo}
          </Typography>
          {confirmOut?.numberOfVisitors > 1 && (
            <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
              The whole group of {confirmOut.numberOfVisitors} is checked out together.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOut(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              const visitor = confirmOut;
              setConfirmOut(null);
              act(visitor, "checkout");
            }}
          >
            Check out
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(failure)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setFailure(null)}
          action={
            <Button color="inherit" size="small" onClick={() => failure?.retry()}>
              Retry
            </Button>
          }
        >
          {failure?.message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(toast) && !failure}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function GuardPage() {
  const [session, setSession] = useState(loadSession);
  const [notice, setNotice] = useState("");

  const login = (next) => {
    storeObjectInLocalStorage(SESSION_KEY, next);
    setNotice("");
    setSession(next);
  };
  const logout = useCallback((message = "") => {
    removeFromLocalStorage(SESSION_KEY);
    setNotice(message);
    setSession(null);
  }, []);
  const expired = useCallback(() => logout("Your session has ended. Enter today's PIN again."), [logout]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {session ? (
        <VisitorList session={session} onLogout={() => logout()} onExpired={expired} />
      ) : (
        <PinScreen onLogin={login} notice={notice} />
      )}
    </Box>
  );
}
