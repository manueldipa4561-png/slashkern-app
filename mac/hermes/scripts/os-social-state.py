"""What he has really published, no AI. The feed reader (a Claude task on his Mac, his signed-in Chrome, read-only) puts every real post into
os/organizer/content.json as a `posted` item with the id feed-<platform>-<code>. This script reads the posted items and writes os/social-state.json:
where the series stands (the last "Day N" posted, done or not), the posts since, today's count, the latest posts, and how old the last feed check is
(the task feed-checked, note "checked=<UTC ISO time>"). It also keeps one OS task, sync-social, with that line in it.
Prints ONLY when the feed check is older than 36 hours, once every 12 hours: the OS is blind until the accounts are read again.
Usage: python3 os-social-state.py   Test: python3 -I -B hermes/tools/test_os_social_state.py"""
import fcntl, json, os, re, sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

DAY = re.compile(r"(?i)\bday\s+(\d{1,2})(?:\s*/\s*(\d{1,2}))?")
CHECKED = re.compile(r"checked=(\S+)")
STALE_H = 36
ALERT_EVERY_H = 12
RECENT = 12
try:
    ROME = ZoneInfo("Europe/Rome")
except Exception:  # tzdata missing in the container
    ROME = timezone(timedelta(hours=1))  # ponytail: an hour off in summer; install tzdata if that ever shows


def paths():
    work = os.environ.get("HERMES_WORKSPACE", "/opt/data/workspace")
    return work + "/os/organizer", work + "/os/social-state.json"


def read_json(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def write_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        f.write(data)
    os.replace(tmp, path)
    os.chmod(path, 0o644)


def when(it):
    return str(it.get("published_at") or it.get("date") or "")


def build(content, tasks, now):
    posted = sorted(((i, it) for i, it in enumerate(content) if isinstance(it, dict) and it.get("status") == "posted"), key=lambda p: (when(p[1]), p[0]))
    items = [it for _, it in posted]
    days = []
    for it in items:
        m = DAY.search(str(it.get("title", ""))) if it.get("pillar") in ("series", "", None) else None
        if m:
            days.append((int(m.group(1)), int(m.group(2) or 30), it))
    top = max(days, key=lambda d: d[0]) if days else None
    series = {"last_day": top[0] if top else None, "total": top[1] if top else 30, "last_day_date": when(top[2]) if top else None,
              "done": bool(top and top[0] >= top[1])}
    is_day = lambda it: any(d[2] is it for d in days)
    since = [it for it in items if not is_day(it) and (not top or when(it) >= series["last_day_date"])]
    today = now.astimezone(ROME).strftime("%Y-%m-%d")
    week = (now.astimezone(ROME) - timedelta(days=6)).strftime("%Y-%m-%d")
    recent = [{"date": when(it), "platform": it.get("platform", ""), "title": str(it.get("title", ""))[:80], "link": it.get("link", "")} for it in reversed(items)][:RECENT]
    platforms = {}
    for it in items:
        p = platforms.setdefault(it.get("platform") or "?", {"posts": 0, "last": ""})
        p["posts"] += 1
        p["last"] = max(p["last"], when(it))
    task = next((t for t in tasks if isinstance(t, dict) and t.get("id") == "feed-checked"), {})
    m = CHECKED.search(str(task.get("note", "")))
    try:
        checked = datetime.fromisoformat(m.group(1).replace("Z", "+00:00")) if m else None
    except ValueError:
        checked = None
    age = round((now - checked).total_seconds() / 3600, 1) if checked else None
    return {"updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "series": series,
            "posts": {"total": len(items), "since_series": len(since) if top else len(items), "today": sum(1 for it in items if when(it) == today),
                      "last7": sum(1 for it in items if when(it) >= week), "last": recent[0] if recent else None},
            "recent": recent, "platforms": platforms,
            "feed": {"checked": checked.strftime("%Y-%m-%dT%H:%M:%SZ") if checked else None, "age_hours": age, "stale": age is None or age > STALE_H}}


def line(st):
    s, p, f = st["series"], st["posts"], st["feed"]
    bits = ["last post %s on %s" % (p["last"]["title"][:36], p["last"]["date"]) if p["last"] else "no posts seen yet"]
    if s["last_day"] is None:
        bits.append("no Day post seen")
    elif s["done"]:
        bits += ["series finished (Day %d on %s)" % (s["last_day"], s["last_day_date"]), "%d posts since" % p["since_series"]]
    else:
        bits.append("series at Day %d/%d (%s)" % (s["last_day"], s["total"], s["last_day_date"]))
    bits.append("feed never checked" if f["age_hours"] is None else "feed checked %d h ago" % round(f["age_hours"]))
    return ("Social: " + " · ".join(bits))[:200]


def os_task(org, today, st):
    f = org + "/tasks.json"
    if not os.path.exists(f):
        return
    with open(org + "/.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)  # the same lock the OS dashboard takes before it writes
        items = read_json(f, None)
        if not isinstance(items, list):
            return
        old = next((t for t in items if t.get("id") == "sync-social"), {})
        notes = "\n".join("%s %s %s" % (r["date"], r["platform"], r["title"]) for r in st["recent"][:8])
        task = {"id": "sync-social", "title": line(st), "project": "p-manuel", "due": today, "status": "todo", "top": False, "prio": 3,
                "created": old.get("created", today), "note": notes[:600]}
        write_atomic(f, json.dumps([t for t in items if t.get("id") != "sync-social"] + [task], ensure_ascii=False, indent=1))


def run(now):
    org, out = paths()
    st = build(read_json(org + "/content.json", []), read_json(org + "/tasks.json", []), now)
    old = read_json(out, {}).get("feed", {})
    alerted = old.get("alerted") if st["feed"]["stale"] else None
    say = ""
    if st["feed"]["stale"] and (not alerted or now - datetime.fromisoformat(alerted.replace("Z", "+00:00")) >= timedelta(hours=ALERT_EVERY_H)):
        alerted = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        age = st["feed"]["age_hours"]
        say = ("The OS has not read your social accounts for %s (last check: %s). The reader runs while the Claude app is open on your Mac: open it, or press "
               "Run now on the task social-feed-sync. Until then Day numbers and what is posted may be out of date."
               % ("a long time" if age is None else "%d hours" % round(age), st["feed"]["checked"] or "never"))
    if alerted:
        st["feed"]["alerted"] = alerted
    os.makedirs(os.path.dirname(out), exist_ok=True)
    write_atomic(out, json.dumps(st, indent=1, ensure_ascii=False))
    os_task(org, now.astimezone(ROME).strftime("%Y-%m-%d"), st)
    return say


if __name__ == "__main__":
    msg = run(datetime.now(timezone.utc))
    if msg:
        print(msg)
