import Link from "next/link";
import { Suspense } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { getTemplates, getTemplateWithItems } from "@/lib/queries";
import { WEEKLY_SCHEDULE } from "@/lib/schedule";

export const dynamic = "force-dynamic";

const CARDIO_OPTIONS = [
  { name: "Incline treadmill walk", time: "30–60 min" },
  { name: "Stair machine", time: "20–40 min" },
  { name: "Outdoor hill walk", time: "30–75 min" },
  { name: "Easy hike", time: "45–90 min" },
];

const DAILY_MOBILITY = [
  { name: "Knee-to-wall ankle rocks", dose: "2 × 10–15/side" },
  { name: "Straight-knee calf stretch", dose: "2 × 45–60 sec/side" },
  { name: "Bent-knee soleus stretch", dose: "2 × 45–60 sec/side" },
  { name: "Tibialis raises", dose: "2–3 × 15–25" },
  { name: "Slow calf raises (deep bottom pause)", dose: "2–3 × 8–12" },
];

const PROTEIN_TARGETS = [
  { meal: "Breakfast", goal: "25–35 g" },
  { meal: "Lunch", goal: "30–40 g" },
  { meal: "Dinner", goal: "30–40 g" },
  { meal: "Snack/shake", goal: "20–30 g" },
];

const ADJUSTMENTS = [
  { result: "Weight not increasing", change: "Add one daily snack" },
  { result: "Weight increasing 0.15–0.3 kg/week", change: "Keep going" },
  { result: "Weight increasing > 0.5 kg/week", change: "Remove one carb/fat serving" },
  { result: "Lifts improving and weight slowly rising", change: "Perfect" },
  { result: "Belly growing fast and lifts not improving", change: "Too many calories or poor training effort" },
];

const PRIORITIES = [
  "Daily calf mobility",
  "Sleep 8–9 hours",
  "Complete 4 gym workouts/week",
  "Hit 100+ g protein/day",
  "Eat enough to slowly gain weight",
  "Do Wednesday hiking prep/cardio",
];

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Plan</h1>
        <p className="text-sm text-zinc-500">
          Lean bulk: build muscle, fix calves, prep for hiking. Target gain 0.15–0.3 kg/week.
        </p>
      </header>

      <Card>
        <CardTitle>Weekly schedule</CardTitle>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {WEEKLY_SCHEDULE.map((d) => (
              <tr key={d.day}>
                <td className="py-2 pr-3 font-medium">{d.day}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-300">
                  {d.templateId ? (
                    <Link
                      href={`/plan#tpl-${d.templateId}`}
                      className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
                    >
                      {d.plan}
                    </Link>
                  ) : (
                    d.plan
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-zinc-500">
          4 lifting days, 1 conditioning day, enough recovery.
        </p>
      </Card>

      <Card>
        <CardTitle>Warm-up before every gym session</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2">
            <Bullet />
            <span>
              <strong>3–5 min easy cardio</strong> — bike, treadmill, rower, or elliptical.
            </span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>
              <strong>Mobility/activation</strong> for the session: lower = bodyweight squats, glute bridges, lunges; upper = band pull-aparts, push-ups, light rows.
            </span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>
              <strong>Warm-up sets for the first big lift</strong>: empty bar × 10, light × 5, medium × 3, then working sets.
            </span>
          </li>
          <li className="flex gap-2">
            <Bullet />
            <span>Do not jump straight into heavy sets cold.</span>
          </li>
        </ul>
      </Card>

      <Suspense fallback={<PlanSkeleton />}>
        <TemplatesSection />
      </Suspense>

      <Card>
        <CardTitle>Wednesday — hiking prep / cardio</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Choose one:</p>
        <table className="mt-2 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {CARDIO_OPTIONS.map((c) => (
              <tr key={c.name}>
                <td className="py-2 pr-3">{c.name}</td>
                <td className="py-2 text-right tabular-nums text-zinc-500">{c.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-zinc-500">
          Moderate. Finish worked, not destroyed. Builds hiking stamina, feet, calves, knees, general conditioning.
        </p>
      </Card>

      <Card>
        <CardTitle>Daily calf/ankle mobility</CardTitle>
        <p className="mt-2 text-xs text-zinc-500">Every day, ideally same time.</p>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {DAILY_MOBILITY.map((m) => (
              <tr key={m.name}>
                <td className="py-2 pr-3">{m.name}</td>
                <td className="py-2 text-right tabular-nums text-zinc-500">{m.dose}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          <li>Stretches: mild/moderate discomfort okay. Sharp pain isn&apos;t.</li>
          <li>Calf raises: lower slowly, pause at bottom, come up controlled.</li>
          <li>Practice heel-to-toe walking — partly mobility, partly retraining the habit.</li>
          <li>Track knee-to-wall once/week — how far the big toe is from the wall while the knee touches and the heel stays down.</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>Diet — lean bulk</CardTitle>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Target <strong>2,650–2,850 kcal/day</strong>. No perfect tracking needed — this is the ballpark.
        </p>
        <p className="mt-3 text-sm font-medium">Protein: 100–125 g/day</p>
        <table className="mt-2 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {PROTEIN_TARGETS.map((p) => (
              <tr key={p.meal}>
                <td className="py-2 pr-3">{p.meal}</td>
                <td className="py-2 text-right tabular-nums text-zinc-500">{p.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-sm font-medium">No-tracking daily aim</p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2"><Bullet />3–4 protein servings</li>
          <li className="flex gap-2"><Bullet />3–5 carb servings</li>
          <li className="flex gap-2"><Bullet />2–3 fruit/vegetable servings</li>
          <li className="flex gap-2"><Bullet />2–3 fat servings</li>
          <li className="flex gap-2"><Bullet />1 extra snack if weight is not increasing</li>
        </ul>

        <p className="mt-4 text-sm font-medium">Hand portions</p>
        <table className="mt-2 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-3">Protein</td><td className="py-2 text-right text-zinc-500">1 palm</td></tr>
            <tr><td className="py-2 pr-3">Carbs</td><td className="py-2 text-right text-zinc-500">1 fist or cupped hand</td></tr>
            <tr><td className="py-2 pr-3">Fats</td><td className="py-2 text-right text-zinc-500">1 thumb</td></tr>
            <tr><td className="py-2 pr-3">Fruit/veg</td><td className="py-2 text-right text-zinc-500">1 fist</td></tr>
          </tbody>
        </table>

        <p className="mt-4 text-sm font-medium">Default main meal</p>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          1–2 palms protein · 1–2 fists carbs · 1 fist fruit/veg · 1 thumb fat.
        </p>

        <p className="mt-4 text-sm font-medium">Pre / post-workout</p>
        <ul className="mt-1 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2"><Bullet />Best: real meal with protein + carbs 1.5–2 h before training.</li>
          <li className="flex gap-2"><Bullet />Fast: banana + protein shake 30–60 min before.</li>
          <li className="flex gap-2"><Bullet />After: just eat a proper meal within a couple hours.</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>Meal ideas</CardTitle>
        <MealColumn
          title="Breakfast"
          items={[
            "Greek yogurt + oats/granola + banana + peanut butter",
            "3 eggs + toast/bagel + fruit",
            "Protein smoothie: milk, whey, banana, oats, peanut butter",
          ]}
        />
        <MealColumn
          title="Lunch"
          items={[
            "Chicken/rice bowl",
            "Beef/rice bowl",
            "Turkey/tuna/chicken sandwich + yogurt + fruit",
            "Pasta + meat sauce",
          ]}
        />
        <MealColumn
          title="Dinner"
          items={[
            "Rice + chicken/beef/salmon/tofu + vegetables",
            "Pasta + meat sauce",
            "Potatoes + meat/eggs + vegetables",
            "Burrito bowl",
          ]}
        />
        <MealColumn
          title="Snacks"
          items={[
            "Protein shake",
            "Greek yogurt",
            "Peanut butter toast",
            "Trail mix",
            "Cheese and crackers",
            "Milk",
            "Tuna sandwich",
            "Eggs",
            "Banana + protein shake",
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Weekly tracking</CardTitle>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-3">Body weight</td><td className="py-2 text-right text-zinc-500">3 mornings/week</td></tr>
            <tr><td className="py-2 pr-3">Gym lifts</td><td className="py-2 text-right text-zinc-500">Every workout</td></tr>
            <tr><td className="py-2 pr-3">Protein target</td><td className="py-2 text-right text-zinc-500">Daily rough check</td></tr>
            <tr><td className="py-2 pr-3">Progress photos</td><td className="py-2 text-right text-zinc-500">Every 4 weeks</td></tr>
            <tr><td className="py-2 pr-3">Knee-to-wall distance</td><td className="py-2 text-right text-zinc-500">Once/week</td></tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-zinc-500">Use weekly average body weight, not one random weigh-in.</p>
      </Card>

      <Card>
        <CardTitle>Adjustments</CardTitle>
        <p className="mt-1 text-xs text-zinc-500">Review every 2 weeks.</p>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ADJUSTMENTS.map((a) => (
              <tr key={a.result}>
                <td className="py-2 pr-3">{a.result}</td>
                <td className="py-2 text-right text-zinc-500">{a.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardTitle>Sleep</CardTitle>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Target <strong>8–9 hours/night</strong>. Bad sleep slows recovery, raises hunger, and stalls the calf/ankle work. As important as protein.
        </p>
      </Card>

      <Card>
        <CardTitle>Supplements (optional)</CardTitle>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-3">Whey protein</td><td className="py-2 text-right text-zinc-500">As needed — helps hit protein</td></tr>
            <tr><td className="py-2 pr-3">Creatine monohydrate</td><td className="py-2 text-right text-zinc-500">3–5 g/day</td></tr>
            <tr><td className="py-2 pr-3">Caffeine</td><td className="py-2 text-right text-zinc-500">1 coffee pre-workout</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-zinc-500">Skip creatine if a doctor advised against it or you have kidney issues.</p>
      </Card>

      <Card>
        <CardTitle>Priorities if life gets busy</CardTitle>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {PRIORITIES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Bullet() {
  return <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />;
}

function MealColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 first:mt-3">
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-1 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
        {items.map((s) => (
          <li key={s} className="flex gap-2">
            <Bullet />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function TemplatesSection() {
  const templates = await getTemplates();
  const lifting = templates.filter((t) => [1, 2, 3, 4].includes(t.id));
  const detailed = await Promise.all(lifting.map((t) => getTemplateWithItems(t.id)));
  return (
    <>
      {detailed.map(({ template, items }) => {
        if (!template) return null;
        const dayLabel = template.day_label ?? "";
        return (
          <Card key={template.id} id={`tpl-${template.id}`}>
            <div className="flex items-baseline justify-between">
              <CardTitle>
                {dayLabel} — {template.name}
              </CardTitle>
            </div>
            {template.warmup && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Warm-up
                </summary>
                <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {(template.warmup as string)
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                    .map((line: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <Bullet />
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>
              </details>
            )}
            <table className="mt-3 w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="py-1 pr-3 text-left">Exercise</th>
                  <th className="py-1 pr-3 text-right">Sets × reps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((it) => {
                  const ex = Array.isArray(it.exercise) ? it.exercise[0] : it.exercise;
                  return (
                    <tr key={it.id} className="align-top">
                      <td className="py-2 pr-3">
                        {ex ? (
                          <Link
                            href={`/exercise/${ex.id}`}
                            className="font-medium hover:underline"
                          >
                            {ex.name}
                          </Link>
                        ) : (
                          <span className="font-medium">—</span>
                        )}
                        {it.notes && (
                          <div className="mt-0.5 text-xs italic text-zinc-500">{it.notes}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-zinc-500">
                        {it.target_sets} × {it.target_reps_min}
                        {it.target_reps_max !== it.target_reps_min ? `–${it.target_reps_max}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        );
      })}
    </>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
        />
      ))}
    </div>
  );
}
