/*
  APM analysis: per-player actions-per-minute breakdown.

  The high-level parser tracks every countable action per player and buckets
  them into 60-second intervals (player.actions.timed).  This example prints
  a summary table and a per-minute timeline for each player.

  Action categories returned by the parser:
    rightclick   — right-click move / attack orders
    basic        — building placement, train unit, research
    buildtrain   — build / train orders (subset of basic)
    ability      — spell / active ability usage
    item         — item usage
    select       — unit selection changes
    subgroup     — sub-group selection within a control group
    selecthotkey — press an existing control group hotkey
    assigngroup  — ctrl+number to assign a control group
    esc          — escape key presses
*/
import W3GReplay from "w3gjs";

async function main() {
  const parser = new W3GReplay();
  const result = await parser.parse("test/replays/126/999.w3g");

  const gameDurationMin = result.duration / 60000;

  for (const player of result.players) {
    const a = player.actions;
    const totalActions =
      a.rightclick +
      a.basic +
      a.ability +
      a.item +
      a.select +
      a.subgroup +
      a.selecthotkey +
      a.assigngroup +
      a.esc;

    console.log(`\n${"─".repeat(60)}`);
    console.log(
      `Player: ${player.name}  (${player.race}, Team ${player.teamid})`,
    );
    console.log(`${"─".repeat(60)}`);
    console.log(`  Overall APM : ${player.apm}`);
    console.log(`  Total actions: ${totalActions}`);
    console.log();
    console.log("  Action breakdown:");
    console.log(`    Right-click  : ${a.rightclick}`);
    console.log(`    Basic / build: ${a.basic}`);
    console.log(`    Ability      : ${a.ability}`);
    console.log(`    Item         : ${a.item}`);
    console.log(`    Select       : ${a.select}`);
    console.log(`    Sub-group    : ${a.subgroup}`);
    console.log(`    Hotkey press : ${a.selecthotkey}`);
    console.log(`    Hotkey assign: ${a.assigngroup}`);
    console.log(`    ESC          : ${a.esc}`);

    console.log();
    console.log("  Control group usage (hotkey → assigned / used):");
    for (const [key, { assigned, used }] of Object.entries(
      player.groupHotkeys,
    )) {
      if (assigned > 0 || used > 0) {
        console.log(`    Group ${key}: assigned ${assigned}×, used ${used}×`);
      }
    }

    console.log();
    console.log("  APM per minute:");
    a.timed.forEach((count, i) => {
      const bar = "█".repeat(Math.round(count / 10));
      console.log(
        `    min ${String(i + 1).padStart(2)}: ${String(count).padStart(4)} ${bar}`,
      );
    });
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Game duration: ${gameDurationMin.toFixed(1)} min`);
}

main();
