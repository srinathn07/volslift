-- =============================================================================
-- VolsLift — seed data
-- Paste into the Supabase dashboard SQL editor AFTER the migration.
-- Equipment inventory is PLACEHOLDER pending a physical TRECS survey.
-- Schema is frozen; this data is NOT frozen and can be replaced.
-- =============================================================================

-- ─── Exercises (76 rows) ─────────────────────────────────────────────────────
-- Columns: id, name, pattern, primary_mover, synergists,
--          equipment_class, stability_demand, unilateral, axial_load,
--          rom_profile, skill_floor, default_rest_seconds, is_unit_bound

INSERT INTO public.exercises VALUES
-- HORIZONTAL PUSH ─────────────────────────────────────────────────────────────
('barbell-bench-press',        'Barbell Bench Press',        'horiz_push','pecs',         ARRAY['triceps','anterior_delt'],             'barbell',    2,false,false,'mid',   2,180,true),
('dumbbell-bench-press',       'Dumbbell Bench Press',       'horiz_push','pecs',         ARRAY['triceps','anterior_delt'],             'dumbbell',   3,false,false,'mid',   1,150,false),
('incline-barbell-press',      'Incline Barbell Press',      'horiz_push','upper_pecs',   ARRAY['anterior_delt','triceps'],             'barbell',    2,false,false,'mid',   3,180,true),
('incline-dumbbell-press',     'Incline Dumbbell Press',     'horiz_push','upper_pecs',   ARRAY['anterior_delt','triceps'],             'dumbbell',   3,false,false,'mid',   2,150,false),
('pushup',                     'Push-up',                    'horiz_push','pecs',         ARRAY['triceps','anterior_delt'],             'bodyweight', 2,false,false,'mid',   1, 90,false),
('machine-chest-press',        'Machine Chest Press',        'horiz_push','pecs',         ARRAY['triceps','anterior_delt'],             'machine',    1,false,false,'mid',   1,120,true),
('dip',                        'Dip',                        'horiz_push','lower_pecs',   ARRAY['triceps','anterior_delt'],             'bodyweight', 3,false,false,'mid',   2,120,false),
('cable-chest-press',          'Cable Chest Press',          'horiz_push','pecs',         ARRAY['triceps','anterior_delt'],             'cable',      3,false,false,'mid',   2,120,true),

-- VERTICAL PUSH ───────────────────────────────────────────────────────────────
('barbell-overhead-press',     'Barbell Overhead Press',     'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps','upper_traps'],'barbell',    2,false,true, 'mid',   3,180,true),
('dumbbell-shoulder-press',    'Dumbbell Shoulder Press',    'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps'],             'dumbbell',   3,false,false,'mid',   2,150,false),
('seated-dumbbell-press',      'Seated Dumbbell Press',      'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps'],             'dumbbell',   2,false,false,'mid',   1,150,false),
('machine-shoulder-press',     'Machine Shoulder Press',     'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps'],             'machine',    1,false,false,'mid',   1,120,true),
('arnold-press',               'Arnold Press',               'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps'],             'dumbbell',   3,false,false,'long',  3,150,false),
('barbell-push-press',         'Barbell Push Press',         'vert_push', 'anterior_delt',ARRAY['lateral_delt','triceps','glutes'],    'barbell',    2,false,true, 'mid',   4,180,true),
('landmine-press',             'Landmine Press',             'vert_push', 'anterior_delt',ARRAY['pecs','triceps'],                     'barbell',    3,false,false,'mid',   2,120,true),

-- HORIZONTAL PULL ─────────────────────────────────────────────────────────────
('barbell-row',                'Barbell Row',                'horiz_pull','lats',         ARRAY['rhomboids','biceps','rear_delt'],      'barbell',    2,false,false,'mid',   3,180,true),
('dumbbell-row',               'Dumbbell Row',               'horiz_pull','lats',         ARRAY['rhomboids','biceps','rear_delt'],      'dumbbell',   2,true, false,'mid',   1,120,false),
('cable-seated-row',           'Seated Cable Row',           'horiz_pull','lats',         ARRAY['rhomboids','biceps','rear_delt'],      'cable',      1,false,false,'mid',   1,120,true),
('machine-row',                'Machine Row',                'horiz_pull','lats',         ARRAY['rhomboids','biceps'],                 'machine',    1,false,false,'mid',   1,120,true),
('t-bar-row',                  'T-Bar Row',                  'horiz_pull','lats',         ARRAY['rhomboids','biceps','rear_delt'],      'barbell',    2,false,false,'mid',   3,180,true),
('chest-supported-row',        'Chest-Supported Row',        'horiz_pull','rhomboids',    ARRAY['lats','biceps','rear_delt'],           'machine',    1,false,false,'mid',   1,120,true),
('cable-face-pull',            'Cable Face Pull',            'horiz_pull','rear_delt',    ARRAY['rhomboids','rotator_cuff'],           'cable',      2,false,false,'short', 2, 90,true),
('inverted-row',               'Inverted Row',               'horiz_pull','lats',         ARRAY['rhomboids','biceps'],                 'bodyweight', 2,false,false,'mid',   2, 90,false),

-- VERTICAL PULL ───────────────────────────────────────────────────────────────
('pullup',                     'Pull-up',                    'vert_pull', 'lats',         ARRAY['biceps','rear_delt','rhomboids'],      'bodyweight', 3,false,false,'long',  3,150,false),
('chinup',                     'Chin-up',                    'vert_pull', 'lats',         ARRAY['biceps','rear_delt'],                 'bodyweight', 3,false,false,'long',  2,150,false),
('lat-pulldown',               'Lat Pulldown',               'vert_pull', 'lats',         ARRAY['biceps','rear_delt'],                 'cable',      1,false,false,'long',  1,120,true),
('machine-lat-pulldown',       'Machine Lat Pulldown',       'vert_pull', 'lats',         ARRAY['biceps'],                            'machine',    1,false,false,'long',  1,120,true),
('neutral-grip-pullup',        'Neutral-Grip Pull-up',       'vert_pull', 'lats',         ARRAY['biceps','brachialis'],                'bodyweight', 3,false,false,'long',  2,150,false),
('assisted-pullup',            'Assisted Pull-up',           'vert_pull', 'lats',         ARRAY['biceps','rear_delt'],                 'machine',    2,false,false,'long',  1,120,true),
('single-arm-pulldown',        'Single-Arm Pulldown',        'vert_pull', 'lats',         ARRAY['biceps'],                            'cable',      2,true, false,'long',  2, 90,true),

-- SQUAT ───────────────────────────────────────────────────────────────────────
('barbell-back-squat',         'Barbell Back Squat',         'squat',     'quads',        ARRAY['glutes','hamstrings','adductors'],    'barbell',    2,false,true, 'long',  4,240,true),
('barbell-front-squat',        'Barbell Front Squat',        'squat',     'quads',        ARRAY['glutes','upper_back'],               'barbell',    3,false,true, 'long',  5,240,true),
('goblet-squat',               'Goblet Squat',               'squat',     'quads',        ARRAY['glutes','adductors'],                'dumbbell',   3,false,false,'long',  1,120,false),
('leg-press',                  'Leg Press',                  'squat',     'quads',        ARRAY['glutes','hamstrings'],               'machine',    1,false,false,'long',  1,180,true),
('hack-squat',                 'Hack Squat Machine',         'squat',     'quads',        ARRAY['glutes','hamstrings'],               'machine',    1,false,false,'long',  2,180,true),
('safety-bar-squat',           'Safety Bar Squat',           'squat',     'quads',        ARRAY['glutes','hamstrings'],               'barbell',    2,false,true, 'long',  3,240,true),
('dumbbell-squat',             'Dumbbell Squat',             'squat',     'quads',        ARRAY['glutes','adductors'],                'dumbbell',   3,false,false,'long',  1,120,false),
('box-squat',                  'Box Squat',                  'squat',     'quads',        ARRAY['glutes','hamstrings'],               'barbell',    2,false,true, 'mid',   3,240,true),

-- HINGE ───────────────────────────────────────────────────────────────────────
('barbell-deadlift',           'Barbell Deadlift',           'hinge',     'hamstrings',   ARRAY['glutes','lats','traps','erectors'],   'barbell',    2,false,false,'long',  4,300,true),
('romanian-deadlift',          'Romanian Deadlift',          'hinge',     'hamstrings',   ARRAY['glutes','erectors'],                 'barbell',    2,false,false,'long',  3,180,true),
('dumbbell-romanian-deadlift', 'DB Romanian Deadlift',       'hinge',     'hamstrings',   ARRAY['glutes','erectors'],                 'dumbbell',   3,false,false,'long',  2,150,false),
('barbell-hip-thrust',         'Barbell Hip Thrust',         'hinge',     'glutes',       ARRAY['hamstrings','adductors'],            'barbell',    2,false,false,'short', 2,180,true),
('dumbbell-hip-thrust',        'Dumbbell Hip Thrust',        'hinge',     'glutes',       ARRAY['hamstrings'],                        'dumbbell',   3,false,false,'short', 1,150,false),
('cable-pull-through',         'Cable Pull-Through',         'hinge',     'glutes',       ARRAY['hamstrings','erectors'],             'cable',      2,false,false,'mid',   2,120,true),
('good-morning',               'Good Morning',               'hinge',     'erectors',     ARRAY['hamstrings','glutes'],               'barbell',    2,false,true, 'long',  4,180,true),
('single-leg-rdl',             'Single-Leg RDL',             'hinge',     'hamstrings',   ARRAY['glutes','erectors'],                 'dumbbell',   4,true, false,'long',  3,120,false),

-- LUNGE ───────────────────────────────────────────────────────────────────────
('barbell-walking-lunge',      'Barbell Walking Lunge',      'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'barbell',    3,true, true, 'long',  3,180,true),
('dumbbell-walking-lunge',     'Dumbbell Walking Lunge',     'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'dumbbell',   3,true, false,'long',  2,150,false),
('barbell-reverse-lunge',      'Barbell Reverse Lunge',      'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'barbell',    3,true, true, 'long',  3,180,true),
('dumbbell-reverse-lunge',     'Dumbbell Reverse Lunge',     'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'dumbbell',   3,true, false,'long',  2,150,false),
('barbell-split-squat',        'Barbell Split Squat',        'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'barbell',    2,true, true, 'long',  3,180,true),
('bulgarian-split-squat',      'Bulgarian Split Squat',      'lunge',     'quads',        ARRAY['glutes','hamstrings'],               'dumbbell',   4,true, false,'long',  3,150,false),

-- CARRY ───────────────────────────────────────────────────────────────────────
('dumbbell-farmers-carry',     'Farmer''s Carry',            'carry',     'traps',        ARRAY['forearms','core','glutes'],          'dumbbell',   3,false,false,'short', 1, 90,false),
('suitcase-carry',             'Suitcase Carry',             'carry',     'obliques',     ARRAY['traps','forearms','core'],           'dumbbell',   4,true, false,'short', 2, 90,false),
('overhead-carry',             'Overhead Carry',             'carry',     'anterior_delt',ARRAY['core','triceps'],                   'dumbbell',   5,true, true, 'short', 3, 90,false),
('trap-bar-carry',             'Trap Bar Carry',             'carry',     'traps',        ARRAY['forearms','core','glutes'],          'barbell',    2,false,false,'short', 2, 90,true),

-- ISOLATION ───────────────────────────────────────────────────────────────────
('barbell-bicep-curl',         'Barbell Curl',               'isolation', 'biceps',       ARRAY['brachialis','brachioradialis'],       'barbell',    1,false,false,'long',  1, 90,true),
('ez-bar-curl',                'EZ-Bar Curl',                'isolation', 'biceps',       ARRAY['brachialis','brachioradialis'],       'barbell',    1,false,false,'long',  1, 90,true),
('dumbbell-bicep-curl',        'Dumbbell Curl',              'isolation', 'biceps',       ARRAY['brachialis'],                        'dumbbell',   2,true, false,'long',  1, 90,false),
('cable-bicep-curl',           'Cable Curl',                 'isolation', 'biceps',       ARRAY['brachialis'],                        'cable',      2,false,false,'long',  1, 90,true),
('hammer-curl',                'Hammer Curl',                'isolation', 'brachialis',   ARRAY['biceps','brachioradialis'],           'dumbbell',   2,true, false,'long',  1, 90,false),
('preacher-curl-machine',      'Preacher Curl Machine',      'isolation', 'biceps',       ARRAY['brachialis'],                        'machine',    1,false,false,'long',  1, 90,true),
('tricep-pushdown',            'Tricep Pushdown',            'isolation', 'triceps',      ARRAY[]::text[],                            'cable',      1,false,false,'short', 1, 90,true),
('overhead-tricep-extension',  'Overhead Tricep Extension',  'isolation', 'triceps',      ARRAY[]::text[],                            'cable',      2,false,false,'long',  1, 90,true),
('skull-crusher',              'Skull Crusher',              'isolation', 'triceps',      ARRAY[]::text[],                            'barbell',    1,false,false,'long',  2, 90,true),
('dumbbell-tricep-kickback',   'Tricep Kickback',            'isolation', 'triceps',      ARRAY[]::text[],                            'dumbbell',   2,true, false,'short', 1, 90,false),
('lateral-raise',              'Lateral Raise',              'isolation', 'lateral_delt', ARRAY[]::text[],                            'dumbbell',   2,false,false,'short', 1, 90,false),
('cable-lateral-raise',        'Cable Lateral Raise',        'isolation', 'lateral_delt', ARRAY[]::text[],                            'cable',      2,true, false,'short', 1, 90,true),
('rear-delt-fly',              'Rear Delt Fly',              'isolation', 'rear_delt',    ARRAY['rhomboids'],                         'dumbbell',   2,false,false,'short', 1, 90,false),
('pec-deck',                   'Pec Deck Fly',               'isolation', 'pecs',         ARRAY[]::text[],                            'machine',    1,false,false,'short', 1, 90,true),
('cable-fly',                  'Cable Fly',                  'isolation', 'pecs',         ARRAY[]::text[],                            'cable',      2,false,false,'mid',   2, 90,true),
('leg-extension',              'Leg Extension',              'isolation', 'quads',        ARRAY[]::text[],                            'machine',    1,false,false,'short', 1, 90,true),
('leg-curl',                   'Lying Leg Curl',             'isolation', 'hamstrings',   ARRAY[]::text[],                            'machine',    1,false,false,'short', 1, 90,true),
('seated-calf-raise',          'Seated Calf Raise',          'isolation', 'soleus',       ARRAY['calves'],                            'machine',    1,false,false,'short', 1, 90,true),
('cable-crunch',               'Cable Crunch',               'isolation', 'abs',          ARRAY['obliques'],                          'cable',      2,false,false,'short', 1, 90,true)
ON CONFLICT (id) DO NOTHING;

-- ─── Equipment units — PLACEHOLDER pending TRECS physical survey ──────────────
-- Columns: id, name, zone, kind, walk_seconds_from_entrance
-- Zone legend: free_weights | cable_area | machine_area

INSERT INTO public.equipment_units VALUES
-- Power racks (free_weights zone)
('power-rack-1',  'Power Rack 1',           'free_weights', 'rack',          55),
('power-rack-2',  'Power Rack 2',           'free_weights', 'rack',          55),
('power-rack-3',  'Power Rack 3',           'free_weights', 'rack',          60),
('power-rack-4',  'Power Rack 4',           'free_weights', 'rack',          60),
('power-rack-5',  'Power Rack 5',           'free_weights', 'rack',          65),
('power-rack-6',  'Power Rack 6',           'free_weights', 'rack',          65),

-- Dedicated bench press benches (free_weights zone)
('bench-press-1', 'Bench Press 1',          'free_weights', 'bench',         50),
('bench-press-2', 'Bench Press 2',          'free_weights', 'bench',         50),
('bench-press-3', 'Bench Press 3',          'free_weights', 'bench',         52),
('bench-press-4', 'Bench Press 4',          'free_weights', 'bench',         52),

-- Platforms for deadlifts (free_weights zone)
('platform-1',    'Platform 1',             'free_weights', 'platform',      70),
('platform-2',    'Platform 2',             'free_weights', 'platform',      70),

-- Dumbbell area (one logical unit representing the whole rack wall)
('dumbbell-area', 'Dumbbell Area',          'free_weights', 'dumbbell_area', 45),

-- Cable towers (cable_area zone) — dual-stack towers
('cable-tower-1', 'Cable Tower 1',          'cable_area',   'cable',         50),
('cable-tower-2', 'Cable Tower 2',          'cable_area',   'cable',         50),
('cable-tower-3', 'Cable Tower 3',          'cable_area',   'cable',         55),
('cable-tower-4', 'Cable Tower 4',          'cable_area',   'cable',         55),

-- Machines (machine_area zone)
('leg-press-1',           'Leg Press 1',            'machine_area', 'machine', 80),
('leg-press-2',           'Leg Press 2',            'machine_area', 'machine', 80),
('hack-squat-machine',    'Hack Squat Machine',     'machine_area', 'machine', 85),
('lat-pulldown-1',        'Lat Pulldown 1',         'machine_area', 'machine', 70),
('lat-pulldown-2',        'Lat Pulldown 2',         'machine_area', 'machine', 70),
('machine-row-1',         'Seated Row Machine',     'machine_area', 'machine', 75),
('chest-press-machine-1', 'Chest Press Machine 1',  'machine_area', 'machine', 65),
('chest-press-machine-2', 'Chest Press Machine 2',  'machine_area', 'machine', 65),
('shoulder-press-machine','Shoulder Press Machine', 'machine_area', 'machine', 72),
('pec-deck-machine',      'Pec Deck',               'machine_area', 'machine', 68),
('leg-extension-machine', 'Leg Extension Machine',  'machine_area', 'machine', 90),
('leg-curl-machine',      'Leg Curl Machine',       'machine_area', 'machine', 90),
('seated-calf-machine',   'Seated Calf Raise',      'machine_area', 'machine', 85),
('preacher-curl-machine', 'Preacher Curl Machine',  'machine_area', 'machine', 72),
('assisted-pullup-machine','Assisted Pull-up',      'machine_area', 'machine', 75),
('chest-supported-row-machine','Chest-Supported Row','machine_area','machine', 78),
('shoulder-press-machine-2','Shoulder Press Machine 2','machine_area','machine',73)
ON CONFLICT (id) DO NOTHING;

-- ─── exercise_equipment links ─────────────────────────────────────────────────
-- Barbell exercises → racks or benches or platforms
-- Cable exercises   → all cable towers
-- Machine exercises → their specific machine(s)
-- Dumbbell/bodyweight → not linked (is_unit_bound = false)

INSERT INTO public.exercise_equipment (exercise_id, equipment_unit_id) VALUES
-- Bench press movements → dedicated benches (can also use racks with a flat bench)
('barbell-bench-press',    'bench-press-1'),
('barbell-bench-press',    'bench-press-2'),
('barbell-bench-press',    'bench-press-3'),
('barbell-bench-press',    'bench-press-4'),
('incline-barbell-press',  'power-rack-1'),
('incline-barbell-press',  'power-rack-2'),
('incline-barbell-press',  'power-rack-3'),
('incline-barbell-press',  'power-rack-4'),
-- Overhead / squat movements → power racks
('barbell-overhead-press', 'power-rack-1'),
('barbell-overhead-press', 'power-rack-2'),
('barbell-overhead-press', 'power-rack-3'),
('barbell-overhead-press', 'power-rack-4'),
('barbell-overhead-press', 'power-rack-5'),
('barbell-overhead-press', 'power-rack-6'),
('barbell-push-press',     'power-rack-1'),
('barbell-push-press',     'power-rack-2'),
('barbell-push-press',     'power-rack-3'),
('barbell-push-press',     'power-rack-4'),
('barbell-push-press',     'power-rack-5'),
('barbell-push-press',     'power-rack-6'),
('landmine-press',         'power-rack-1'),
('landmine-press',         'power-rack-2'),
('barbell-back-squat',     'power-rack-1'),
('barbell-back-squat',     'power-rack-2'),
('barbell-back-squat',     'power-rack-3'),
('barbell-back-squat',     'power-rack-4'),
('barbell-back-squat',     'power-rack-5'),
('barbell-back-squat',     'power-rack-6'),
('barbell-front-squat',    'power-rack-1'),
('barbell-front-squat',    'power-rack-2'),
('barbell-front-squat',    'power-rack-3'),
('barbell-front-squat',    'power-rack-4'),
('barbell-front-squat',    'power-rack-5'),
('barbell-front-squat',    'power-rack-6'),
('safety-bar-squat',       'power-rack-1'),
('safety-bar-squat',       'power-rack-2'),
('safety-bar-squat',       'power-rack-3'),
('safety-bar-squat',       'power-rack-4'),
('box-squat',              'power-rack-1'),
('box-squat',              'power-rack-2'),
('box-squat',              'power-rack-3'),
('box-squat',              'power-rack-4'),
('barbell-walking-lunge',  'power-rack-1'),
('barbell-walking-lunge',  'power-rack-2'),
('barbell-reverse-lunge',  'power-rack-1'),
('barbell-reverse-lunge',  'power-rack-2'),
('barbell-split-squat',    'power-rack-1'),
('barbell-split-squat',    'power-rack-2'),
-- Deadlift / hinge → platforms + racks
('barbell-deadlift',       'platform-1'),
('barbell-deadlift',       'platform-2'),
('barbell-deadlift',       'power-rack-1'),
('barbell-deadlift',       'power-rack-2'),
('romanian-deadlift',      'platform-1'),
('romanian-deadlift',      'platform-2'),
('romanian-deadlift',      'power-rack-1'),
('romanian-deadlift',      'power-rack-2'),
('barbell-hip-thrust',     'bench-press-1'),
('barbell-hip-thrust',     'bench-press-2'),
('barbell-hip-thrust',     'bench-press-3'),
('barbell-hip-thrust',     'bench-press-4'),
('good-morning',           'power-rack-1'),
('good-morning',           'power-rack-2'),
('trap-bar-carry',         'platform-1'),
('trap-bar-carry',         'platform-2'),
-- Barbell rows / carry → racks or platforms
('barbell-row',            'power-rack-1'),
('barbell-row',            'power-rack-2'),
('barbell-row',            'platform-1'),
('barbell-row',            'platform-2'),
('t-bar-row',              'power-rack-1'),
('t-bar-row',              'power-rack-2'),
-- Barbell isolation → any rack or bench
('barbell-bicep-curl',     'power-rack-1'),
('barbell-bicep-curl',     'power-rack-2'),
('ez-bar-curl',            'power-rack-1'),
('ez-bar-curl',            'power-rack-2'),
('skull-crusher',          'bench-press-1'),
('skull-crusher',          'bench-press-2'),
-- Cable exercises → all cable towers
('cable-chest-press',      'cable-tower-1'),
('cable-chest-press',      'cable-tower-2'),
('cable-chest-press',      'cable-tower-3'),
('cable-chest-press',      'cable-tower-4'),
('cable-seated-row',       'cable-tower-1'),
('cable-seated-row',       'cable-tower-2'),
('cable-seated-row',       'cable-tower-3'),
('cable-seated-row',       'cable-tower-4'),
('cable-face-pull',        'cable-tower-1'),
('cable-face-pull',        'cable-tower-2'),
('cable-face-pull',        'cable-tower-3'),
('cable-face-pull',        'cable-tower-4'),
('lat-pulldown',           'cable-tower-1'),
('lat-pulldown',           'cable-tower-2'),
('lat-pulldown',           'cable-tower-3'),
('lat-pulldown',           'cable-tower-4'),
('single-arm-pulldown',    'cable-tower-1'),
('single-arm-pulldown',    'cable-tower-2'),
('single-arm-pulldown',    'cable-tower-3'),
('single-arm-pulldown',    'cable-tower-4'),
('cable-pull-through',     'cable-tower-1'),
('cable-pull-through',     'cable-tower-2'),
('cable-pull-through',     'cable-tower-3'),
('cable-pull-through',     'cable-tower-4'),
('cable-bicep-curl',       'cable-tower-1'),
('cable-bicep-curl',       'cable-tower-2'),
('cable-bicep-curl',       'cable-tower-3'),
('cable-bicep-curl',       'cable-tower-4'),
('tricep-pushdown',        'cable-tower-1'),
('tricep-pushdown',        'cable-tower-2'),
('tricep-pushdown',        'cable-tower-3'),
('tricep-pushdown',        'cable-tower-4'),
('overhead-tricep-extension','cable-tower-1'),
('overhead-tricep-extension','cable-tower-2'),
('overhead-tricep-extension','cable-tower-3'),
('overhead-tricep-extension','cable-tower-4'),
('cable-lateral-raise',    'cable-tower-1'),
('cable-lateral-raise',    'cable-tower-2'),
('cable-lateral-raise',    'cable-tower-3'),
('cable-lateral-raise',    'cable-tower-4'),
('cable-fly',              'cable-tower-1'),
('cable-fly',              'cable-tower-2'),
('cable-fly',              'cable-tower-3'),
('cable-fly',              'cable-tower-4'),
('cable-crunch',           'cable-tower-1'),
('cable-crunch',           'cable-tower-2'),
('cable-crunch',           'cable-tower-3'),
('cable-crunch',           'cable-tower-4'),
-- Machine exercises → specific machines
('machine-chest-press',   'chest-press-machine-1'),
('machine-chest-press',   'chest-press-machine-2'),
('machine-shoulder-press','shoulder-press-machine'),
('machine-shoulder-press','shoulder-press-machine-2'),
('machine-row',           'machine-row-1'),
('chest-supported-row',   'chest-supported-row-machine'),
('machine-lat-pulldown',  'lat-pulldown-1'),
('machine-lat-pulldown',  'lat-pulldown-2'),
('assisted-pullup',       'assisted-pullup-machine'),
('leg-press',             'leg-press-1'),
('leg-press',             'leg-press-2'),
('hack-squat',            'hack-squat-machine'),
('preacher-curl-machine', 'preacher-curl-machine'),
('pec-deck',              'pec-deck-machine'),
('leg-extension',         'leg-extension-machine'),
('leg-curl',              'leg-curl-machine'),
('seated-calf-raise',     'seated-calf-machine')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RLS VERIFICATION — paste and run this AFTER the seed to confirm all 10
-- tables have rowsecurity = true before marking C1 green.
-- =============================================================================
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ON' ELSE '✗ OFF — BLOCKER' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles','exercises','equipment_units','exercise_equipment',
    'equipment_events','sessions','session_plan_items','sets',
    'substitution_cache','equipment_reports','occupancy_history'
  )
ORDER BY tablename;
