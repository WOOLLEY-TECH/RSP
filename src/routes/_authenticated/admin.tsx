import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { sql } from "@/lib/neon";
import { logActivity } from "@/lib/activity";
import { clearSession } from "@/lib/session";
import { party } from "@/lib/party";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  PartyPopper,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — Birthday RSVP" },
      {
        name: "description",
        content: "Track RSVPs, attendance, analytics and total expected guests.",
      },
      { property: "og:title", content: "Organizer Dashboard — Birthday RSVP" },
      {
        property: "og:description",
        content: "Private analytical dashboard for the party organizer.",
      },
    ],
  }),
  component: AdminPage,
});

type Rsvp = {
  id: string;
  full_name: string;
  phone_number: string;
  attending: boolean;
  attending_days: string[];
  additional_guests: number;
  guest_names: string[];
  created_at: string;
};

type ActivityLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

const field =
  "w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-primary";

const breakdownChartConfig = {
  attending: { label: "Attending", color: "var(--chart-1)" },
  declining: { label: "Not attending", color: "var(--chart-3)" },
} satisfies ChartConfig;

const dayChartConfig = {
  people: { label: "People", color: "var(--chart-2)" },
} satisfies ChartConfig;

const trendChartConfig = {
  total: { label: "Cumulative RSVPs", color: "var(--chart-1)" },
  signups: { label: "New RSVPs", color: "var(--chart-4)" },
} satisfies ChartConfig;

const sizeChartConfig = {
  count: { label: "RSVPs", color: "var(--chart-5)" },
} satisfies ChartConfig;

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [editing, setEditing] = useState<Rsvp | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "guests" | "activity">("overview");
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [accessLogged, setAccessLogged] = useState(false);

  useEffect(() => {
    if (!accessLogged) {
      logActivity({ action: "admin_access", entityType: "admin" });
      setAccessLogged(true);
    }
  }, [accessLogged]);

  const { data, isLoading } = useQuery({
    queryKey: ["rsvps"],
    queryFn: async () => {
      const rows = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;
      return rows as Rsvp[];
    },
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activity_log"],
    queryFn: async () => {
      const rows = await sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 200`;
      return rows as ActivityLog[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await sql`DELETE FROM rsvps WHERE id = ${id}`;
      await logActivity({ action: "rsvp_deleted", entityType: "rsvp", entityId: id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsvps"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });

  const save = useMutation({
    mutationFn: async (r: Rsvp) => {
      await sql`
        UPDATE rsvps
        SET full_name = ${r.full_name},
            phone_number = ${r.phone_number},
            attending = ${r.attending},
            attending_days = ${r.attending_days},
            additional_guests = ${r.guest_names.length},
            guest_names = ${r.guest_names},
            updated_at = NOW()
        WHERE id = ${r.id}
      `;
      await logActivity({
        action: "rsvp_updated",
        entityType: "rsvp",
        entityId: r.id,
        details: {
          fullName: r.full_name,
          attending: r.attending,
          attendingDays: r.attending_days,
          guests: r.guest_names.length,
        },
      });
    },
    onSuccess: () => {
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["rsvps"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });

  const all = useMemo(() => data ?? [], [data]);
  const attending = useMemo(() => all.filter((r) => r.attending), [all]);
  const declining = all.length - attending.length;
  const totalPeople = useMemo(
    () => attending.reduce((sum, r) => sum + 1 + r.guest_names.length, 0),
    [attending],
  );
  const avgGuests = attending.length ? totalPeople / attending.length : 0;
  const responseRate = all.length > 0 ? Math.round((attending.length / all.length) * 100) : 0;

  const dayStats = useMemo(
    () =>
      party.events.map((event) => {
        const dayRsvps = attending.filter((r) => r.attending_days?.includes(event.day));
        return {
          day: event.day,
          short: event.day.slice(0, 3),
          people: dayRsvps.reduce((sum, r) => sum + 1 + r.guest_names.length, 0),
          rsvps: dayRsvps.length,
        };
      }),
    [attending],
  );

  const breakdownData = useMemo(
    () => [
      { name: "attending", value: attending.length },
      { name: "declining", value: declining },
    ],
    [attending.length, declining],
  );

  const trendData = useMemo(() => {
    const sorted = [...all].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const map = new Map<string, { signups: number; label: string }>();
    for (const r of sorted) {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const existing = map.get(key);
      if (existing) {
        existing.signups += 1;
      } else {
        map.set(key, {
          signups: 1,
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        });
      }
    }
    let cumulative = 0;
    return [...map.entries()].map(([, v]) => {
      cumulative += v.signups;
      return { label: v.label, signups: v.signups, total: cumulative };
    });
  }, [all]);

  const sizeData = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, i) => ({
      label: i === 5 ? "5+" : `${i}`,
      count: 0,
    }));
    for (const r of attending) {
      const idx = Math.min(r.guest_names.length, 5);
      buckets[idx]!.count += 1;
    }
    return buckets;
  }, [attending]);

  const rows = (data ?? []).filter((r) => {
    const q = search.trim().toLowerCase();
    const matches =
      !q || r.full_name.toLowerCase().includes(q) || r.phone_number.toLowerCase().includes(q);
    const f = filter === "all" || (filter === "yes" ? r.attending : !r.attending);
    return matches && f;
  });

  const filteredActivities = (activities ?? []).filter((a) => {
    const q = activitySearch.trim().toLowerCase();
    const matches =
      !q ||
      a.action.toLowerCase().includes(q) ||
      a.entity_type.toLowerCase().includes(q) ||
      (a.entity_id && a.entity_id.toLowerCase().includes(q)) ||
      JSON.stringify(a.details).toLowerCase().includes(q);
    const f = activityFilter === "all" || a.action === activityFilter;
    return matches && f;
  });

  const actionTypes = [...new Set(activities?.map((a) => a.action) ?? [])].sort();
  const recentActivities = (activities ?? []).slice(0, 6);

  const updateEditingField = useCallback(<K extends keyof Rsvp>(field: K, value: Rsvp[K]) => {
    setEditing((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  const updateGuestName = useCallback((index: number, value: string) => {
    setEditing((prev) => {
      if (!prev) return null;
      const newGuests = [...prev.guest_names];
      newGuests[index] = value;
      return { ...prev, guest_names: newGuests };
    });
  }, []);

  const removeGuestName = useCallback((index: number) => {
    setEditing((prev) => {
      if (!prev) return null;
      return { ...prev, guest_names: prev.guest_names.filter((_, idx) => idx !== index) };
    });
  }, []);

  const addGuestName = useCallback(() => {
    setEditing((prev) => (prev ? { ...prev, guest_names: [...prev.guest_names, ""] } : null));
  }, []);

  const tabTitle =
    activeTab === "overview" ? "Dashboard" : activeTab === "guests" ? "Guest List" : "Activity Log";

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h1 className="truncate font-display text-2xl font-bold">{tabTitle}</h1>
          <button
            onClick={() => {
              logActivity({ action: "user_logout", entityType: "auth" });
              clearSession();
              qc.clear();
              navigate({ to: "/auth" });
            }}
            className="shrink-0 rounded-2xl border border-input px-4 py-2 text-sm"
          >
            Sign out
          </button>
        </header>

        <div className="mt-6 border-b border-border">
          <nav className="flex gap-1" role="tablist">
            {(["overview", "guests", "activity"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-t-2xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "guests"
                    ? `Guest List (${all.length})`
                    : `Activity (${activities?.length ?? 0})`}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" && (
          <>
            {!isLoading && all.length === 0 && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <p className="text-muted-foreground">
                  No RSVPs recorded yet — charts will populate as guests respond.
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <KpiCard
                icon={Users}
                label="Total RSVPs"
                value={all.length}
                sub="responses received"
              />
              <KpiCard
                icon={UserCheck}
                label="Attending"
                value={attending.length}
                sub={`${responseRate}% of responses`}
              />
              <KpiCard
                icon={UserX}
                label="Not attending"
                value={declining}
                sub={`${all.length - attending.length} declined`}
              />
              <KpiCard
                icon={PartyPopper}
                label="People coming"
                value={totalPeople}
                highlight
                sub="total guests confirmed"
              />
              <KpiCard
                icon={Users}
                label="Avg. party size"
                value={Number(avgGuests.toFixed(1))}
                sub="guests per RSVP"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Card className="rounded-3xl shadow-card lg:col-span-1">
                <CardHeader>
                  <CardTitle>Response breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative h-60 w-full">
                    <ChartContainer
                      config={breakdownChartConfig}
                      className="absolute inset-0 h-full w-full"
                      style={{ aspectRatio: "auto" }}
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel hideIndicator />}
                        />
                        <Pie
                          data={breakdownData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          strokeWidth={0}
                        >
                          <Cell fill="var(--color-attending)" />
                          <Cell fill="var(--color-declining)" />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{all.length}</span>
                      <span className="text-xs text-muted-foreground">total</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-5 text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-sm"
                        style={{ backgroundColor: "var(--chart-1)" }}
                      />
                      Attending ({attending.length})
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-sm"
                        style={{ backgroundColor: "var(--chart-3)" }}
                      />
                      Declined ({declining})
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Attendance by event day</CardTitle>
                  <CardDescription>Number of people confirmed for each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={dayChartConfig}
                    className="h-64 w-full"
                    style={{ aspectRatio: "auto" }}
                  >
                    <BarChart data={dayStats} barSize={48}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={13}
                        fontWeight={600}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={28}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="people" fill="var(--color-people)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Card className="rounded-3xl shadow-card">
                <CardHeader>
                  <CardTitle>RSVP trend</CardTitle>
                  <CardDescription>Cumulative responses over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ChartContainer
                      config={trendChartConfig}
                      className="h-64 w-full"
                      style={{ aspectRatio: "auto" }}
                    >
                      <AreaChart data={trendData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          width={28}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={4}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          fill="var(--color-total)"
                          fillOpacity={0.15}
                          stroke="var(--color-total)"
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                      No data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-card">
                <CardHeader>
                  <CardTitle>Party size distribution</CardTitle>
                  <CardDescription>Number of extra guests per attending RSVP</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={sizeChartConfig}
                    className="h-64 w-full"
                    style={{ aspectRatio: "auto" }}
                  >
                    <BarChart data={sizeData} barSize={48}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={28}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent nameKey="count" />}
                      />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {recentActivities.length > 0 && (
              <Card className="mt-5 rounded-3xl shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="size-5 text-primary" />
                      Recent activity
                    </CardTitle>
                    <CardDescription>Latest changes across the dashboard</CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className="inline-flex items-center gap-1 rounded-full border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                  >
                    View all <ChevronRight className="size-3.5" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border rounded-2xl border border-border">
                    {recentActivities.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                          <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {a.action.replace(/_/g, " ")}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {a.entity_type}
                          </span>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {timeAgo(a.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "guests" && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <KpiCard icon={Users} label="RSVPs" value={all.length} />
              <KpiCard icon={UserCheck} label="Attending" value={attending.length} />
              <KpiCard icon={UserX} label="Not attending" value={declining} />
              <KpiCard icon={PartyPopper} label="People coming" value={totalPeople} highlight />
              <KpiCard icon={Users} label="Avg. party size" value={Number(avgGuests.toFixed(1))} />
            </div>

            <div className="mt-5 space-y-3">
              <input
                className={field}
                placeholder="Search by name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                {(["all", "yes", "no"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-4 py-2 text-sm ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-card text-muted-foreground"
                    }`}
                  >
                    {f === "all" ? "All" : f === "yes" ? "Attending" : "Not attending"}
                  </button>
                ))}
              </div>
            </div>

            {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

            <div className="mt-4 space-y-3">
              {rows.map((r) => (
                <article key={r.id} className="rounded-3xl bg-card p-5 shadow-card">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{r.full_name}</h2>
                      <p className="text-sm text-muted-foreground">{r.phone_number}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        r.attending
                          ? "bg-primary-soft text-accent-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r.attending ? "Attending" : "Not attending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Extra guests: {r.guest_names.length} · Total:{" "}
                    {r.attending ? 1 + r.guest_names.length : 0}
                  </p>
                  {r.guest_names.length > 0 && (
                    <p className="mt-1 text-sm">With: {r.guest_names.join(", ")}</p>
                  )}
                  {r.attending && r.attending_days && r.attending_days.length > 0 && (
                    <p className="mt-1 text-sm text-primary">Days: {r.attending_days.join(", ")}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setEditing(r)}
                      className="rounded-2xl border border-input px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${r.full_name}'s RSVP?`)) remove.mutate(r.id);
                      }}
                      className="rounded-2xl border border-input px-4 py-2 text-sm text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {!isLoading && rows.length === 0 && (
                <p className="text-sm text-muted-foreground">No RSVPs to show yet.</p>
              )}
            </div>
          </>
        )}

        {activeTab === "activity" && (
          <div className="mt-4 space-y-3">
            <input
              className={field}
              placeholder="Search activity (action, entity, details...)"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActivityFilter("all")}
                className={`rounded-full px-4 py-2 text-sm ${
                  activityFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-card text-muted-foreground"
                }`}
              >
                All
              </button>
              {actionTypes.map((action) => (
                <button
                  key={action}
                  onClick={() => setActivityFilter(action)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activityFilter === action
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-card text-muted-foreground"
                  }`}
                >
                  {action.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {activitiesLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredActivities.map((a) => (
                <article key={a.id} className="rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-accent-foreground">
                          {a.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">{a.entity_type}</span>
                        {a.entity_id && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {a.entity_id.slice(0, 8)}…
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                      {Object.keys(a.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Details
                          </summary>
                          <pre className="mt-1 text-[10px] text-muted-foreground bg-background p-2 rounded overflow-x-auto">
                            {JSON.stringify(a.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    {a.user_id && (
                      <span className="shrink-0 text-xs text-muted-foreground font-mono">
                        {a.user_id.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                </article>
              ))}
              {!activitiesLoading && filteredActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">No activity to show.</p>
              )}
            </div>
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-end bg-ink/50 p-4 sm:items-center">
            <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-bold">Edit RSVP</h2>
              <div className="mt-4 space-y-3">
                <input
                  className={field}
                  value={editing.full_name}
                  onChange={(e) => updateEditingField("full_name", e.target.value)}
                />
                <input
                  className={field}
                  value={editing.phone_number}
                  onChange={(e) => updateEditingField("phone_number", e.target.value)}
                />
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.attending}
                    onChange={(e) => updateEditingField("attending", e.target.checked)}
                  />
                  Attending
                </label>
                {editing.attending && (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Days attending</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {["Friday", "Saturday", "Sunday"].map((day) => (
                        <label key={day} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editing.attending_days?.includes(day) ?? false}
                            onChange={(e) => {
                              const current = editing.attending_days ?? [];
                              const next = e.target.checked
                                ? [...current, day]
                                : current.filter((d) => d !== day);
                              updateEditingField("attending_days", next);
                            }}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional guests</p>
                  {editing.guest_names.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={field}
                        value={g}
                        onChange={(e) => updateGuestName(i, e.target.value)}
                      />
                      <button
                        onClick={() => removeGuestName(i)}
                        className="shrink-0 rounded-2xl border border-input px-3 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addGuestName}
                    className="rounded-2xl bg-primary-soft px-4 py-2 text-sm text-accent-foreground"
                  >
                    + Add guest
                  </button>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() =>
                    save.mutate({
                      ...editing,
                      guest_names: editing.guest_names.map((g) => g.trim()).filter(Boolean),
                    })
                  }
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-2xl border border-input px-4 py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-5 transition-shadow ${
        highlight
          ? "bg-hero-gradient text-primary-foreground shadow-lg"
          : "bg-card shadow-card hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs uppercase tracking-wide ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        <div
          className={`grid size-8 place-items-center rounded-xl ${highlight ? "bg-primary-foreground/20" : "bg-primary/10"}`}
        >
          <Icon className={`size-4 ${highlight ? "text-primary-foreground" : "text-primary"}`} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums leading-none">{value}</p>
      {sub && (
        <p
          className={`mt-1.5 text-xs ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
