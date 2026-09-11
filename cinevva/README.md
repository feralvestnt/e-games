# Castalla Current — Compatibility Package

This replaces the previous Castalla terrain/castle packages.

Use `castalla_current.glb` first. It contains the hill and current castle already merged in one GLB with transforms baked into the geometry.

Why this package is simpler:
- no parent transforms;
- no offsets that Cinevva must interpret;
- no versioned asset names;
- no external textures;
- no dependency between files;
- meters and Y-up;
- terrain and castle are already aligned.

Optional separated assets:
- `terrain.glb`
- `castle.glb`

If separated assets are used, both must be imported with identity transforms:
position 0,0,0
rotation 0,0,0
scale 1,1,1

Do not keep older Castalla GLBs in the same repository if Cinevva is selecting files automatically.
