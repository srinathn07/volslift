/** Plate calculator for barbell exercises. Also exports calcPlates for unit tests. */

export interface PlateGroup {
  plate: number;
  count: number;
}

const STANDARD_PLATES = [45, 35, 25, 10, 5, 2.5];
const BAR_WEIGHT      = 45;

/** Pure function: returns plates per side for a given target weight. */
export function calcPlates(targetWeight: number, barWeight = BAR_WEIGHT): PlateGroup[] {
  const perSide = (targetWeight - barWeight) / 2;
  if (perSide <= 0) return [];

  const result: PlateGroup[] = [];
  let remaining = perSide;

  for (const plate of STANDARD_PLATES) {
    const count = Math.floor(remaining / plate + 1e-9); // tolerance for floats
    if (count > 0) {
      result.push({ plate, count });
      remaining -= count * plate;
    }
  }

  return result;
}

interface Props {
  weight: number;
}

export default function PlateCalc({ weight }: Props) {
  const groups = calcPlates(weight);
  if (groups.length === 0) return null;

  const label = groups.map(g => `${g.count}×${g.plate}`).join('  ');

  return (
    <p
      style={{
        fontSize:    'var(--text-13)',
        color:       'var(--ink-muted)',
        paddingTop:  8,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      Plates per side: {label}
    </p>
  );
}
