# Castalla Cinevva Native

This is the clean replacement package.

Delete all previous Castalla terrain/castle files from the repository before using this package.

## Repository structure

Castalla/
├── terrain/
│   ├── heightmap_16bit.png
│   ├── heightmap_preview.png
│   ├── terrain.json
│   └── terrain_reference.glb
├── castle/
│   ├── castle.glb
│   └── placement.json
├── config/
│   ├── world.json
│   └── validation.json
├── docs/
│   └── CINEVVA_IMPORT.txt
├── manifest.json
└── README.md

## Primary workflow

1. Build terrain from the 16-bit heightmap.
2. Apply the exact dimensions in terrain.json.
3. Load castle.glb at identity transform.
4. Never use automatic ground placement for the castle.
5. Validate terrain/castle contact before adding anything else.

The heightmap is the primary terrain source.
The GLB terrain file exists only as a visual reference / fallback.
