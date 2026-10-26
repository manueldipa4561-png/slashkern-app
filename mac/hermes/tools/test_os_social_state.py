"""Tests of the social state (os-social-state.py): the series position from the posted items, posts since the series, today and last 7 days,
the stale-feed alert (once per 12 hours), the OS task line. Made-up content, no network.
Run: python3 -I -B hermes/tools/test_os_social_state.py"""
import importlib.util, json, os, tempfile, unittest
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = importlib.util.spec_from_file_location("social_state", os.path.join(HERE, "..", "scripts", "os-social-state.py"))
S = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(S)

NOW = datetime(2026, 10, 26, 15, 30, tzinfo=timezone.utc)  # 16:30 in Rome


def post(code, day, title, **kw):
    return {"id": "feed-ig-" + code, "platform": "Instagram", "title": title, "status": "posted", "date": day, "published_at": day,
            "link": "https://www.instagram.com/p/%s/" % code, "pillar": "", "src": "feed", **kw}


FEED = [post("a29", "2026-10-20", "Day 29/30 · STAFF", pillar="series"), post("a30", "2026-10-21", "Day 30/30 · NEXT", pillar="series"),
        post("b1", "2026-10-21", "Reel: AGENTS"), post("b2", "2026-10-25", "Reel: PIPE"), post("b3", "2026-10-26", "Reel: PITSTOP"),
        post("b4", "2026-10-26", "Reel: STATION")]


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        os.environ["HERMES_WORKSPACE"] = self.tmp.name
        os.makedirs(self.tmp.name + "/os/organizer")

    def put(self, name, data):
        with open(self.tmp.name + "/os/organizer/" + name + ".json", "w") as f:
            json.dump(data, f)

    def checked(self, hours_ago):
        t = (NOW - timedelta(hours=hours_ago)).strftime("%Y-%m-%dT%H:%M:%SZ")
        return {"id": "feed-checked", "title": "feed", "status": "done", "note": "checked=" + t + " ig=ok"}

    def state(self):
        with open(self.tmp.name + "/os/social-state.json") as f:
            return json.load(f)

    def tasks(self):
        with open(self.tmp.name + "/os/organizer/tasks.json") as f:
            return {t["id"]: t for t in json.load(f)}


class StateTest(Base):
    def test_a_finished_series_and_the_posts_since(self):
        self.put("content", FEED + [{"id": "i1", "status": "idea", "title": "Day 21: ONE TAKE", "platform": "Instagram"}])
        self.put("tasks", [self.checked(2)])
        self.assertEqual(S.run(NOW), "")
        st = self.state()
        self.assertEqual(st["series"], {"last_day": 30, "total": 30, "last_day_date": "2026-10-21", "done": True})
        self.assertEqual(st["posts"]["since_series"], 4)
        self.assertEqual(st["posts"]["today"], 2)
        self.assertEqual(st["posts"]["last"]["title"], "Reel: STATION")
        self.assertEqual([r["title"] for r in st["recent"][:2]], ["Reel: STATION", "Reel: PITSTOP"])
        self.assertEqual(st["platforms"]["Instagram"], {"posts": 6, "last": "2026-10-26"})
        self.assertFalse(st["feed"]["stale"])
        self.assertEqual(st["feed"]["age_hours"], 2.0)

    def test_an_unfinished_series_and_ideas_are_not_posts(self):
        self.put("content", [post("a20", "2026-10-19", "Day 20/30 · DONE", pillar="series"), {"id": "i1", "status": "drafted", "title": "Day 21: ONE TAKE"}])
        self.put("tasks", [self.checked(1)])
        S.run(NOW)
        st = self.state()
        self.assertEqual((st["series"]["last_day"], st["series"]["done"]), (20, False))
        self.assertEqual(st["posts"]["total"], 1)
        self.assertIn("series at Day 20/30 (2026-10-19)", self.tasks()["sync-social"]["title"])

    def test_a_day_word_in_a_non_series_post_is_not_a_series_day(self):
        self.put("content", [post("x1", "2026-10-22", "Founder day 3 in Milan", pillar="founder")])
        self.put("tasks", [self.checked(1)])
        S.run(NOW)
        self.assertIsNone(self.state()["series"]["last_day"])

    def test_the_os_task_line(self):
        self.put("content", FEED)
        self.put("tasks", [self.checked(3), {"id": "t1", "title": "keep me", "status": "todo"}])
        S.run(NOW)
        t = self.tasks()
        self.assertEqual(t["sync-social"]["title"], "Social: last post Reel: STATION on 2026-10-26 · series finished (Day 30 on 2026-10-21) · 4 posts since · feed checked 3 h ago")
        self.assertFalse(t["sync-social"]["top"])
        self.assertIn("t1", t)
        self.assertIn("2026-10-26 Instagram Reel: STATION", t["sync-social"]["note"])

    def test_no_files_at_all_still_works(self):
        msg = S.run(NOW)
        self.assertIn("has not read your social accounts", msg)
        self.assertIsNone(self.state()["posts"]["last"])


class StaleTest(Base):
    def test_a_stale_feed_alerts_once_per_twelve_hours(self):
        self.put("content", FEED)
        self.put("tasks", [self.checked(40)])
        first = S.run(NOW)
        self.assertIn("has not read your social accounts for 40 hours", first)
        self.assertEqual(S.run(NOW + timedelta(hours=1)), "")
        self.assertIn("social accounts", S.run(NOW + timedelta(hours=13)))

    def test_a_fresh_feed_never_alerts_and_clears_the_memory_of_an_alert(self):
        self.put("content", FEED)
        self.put("tasks", [self.checked(40)])
        S.run(NOW)
        self.put("tasks", [self.checked(1)])
        self.assertEqual(S.run(NOW + timedelta(hours=2)), "")
        self.assertNotIn("alerted", self.state()["feed"])


if __name__ == "__main__":
    unittest.main(verbosity=1)
