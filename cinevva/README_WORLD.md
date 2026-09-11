# CASTALLA — CINEVVA TERRAIN PACKAGE

## Purpose
This package establishes the terrain coordinate system for the future historical Castalla scene.
The castle and medieval village are intentionally NOT included yet.

## Authoritative files
- `Castalla_Hill_Reference_Yup.glb` — primary terrain model
- `world.json` — authoritative coordinate, transform and placement rules
- `Castalla_Hill_Heightmap_16bit.png` — optional heightmap reference
- `Castalla_Hill_Preview.png` — quick visual reference
- `Castalla_Hill_Metadata.json` — terrain metadata

## Coordinate convention
- Units: meters
- X: East/West, positive East
- Y: Up
- Z: North/South, positive North
- Terrain transform: position `[0,0,0]`, rotation `[0,0,0]`, scale `[1,1,1]`

## Important
Do NOT ask the AI to guess where the future castle belongs.

The future castle model should be built/registered against THIS SAME coordinate system.
The preferred final workflow is:

1. Load terrain at `[0,0,0]`
2. Build/register the historical castle against it
3. Export the castle GLB while preserving this world origin
4. Load castle at `[0,0,0]`
5. Both models should align without manual placement

## Current terrain reference anchors
Highest terrain vertex:
`[22.222, 105.0, 4.444]`

Stable summit reference centroid:
`[15.068, 102.832, 4.092]`

These are model-derived references only. They are NOT claimed to be the final archaeological castle origin.

## What Cinevva may do now
- Import the terrain
- Apply physically plausible materials without changing geometry
- Add lighting / sky / atmospheric effects
- Add non-destructive vegetation prototypes
- Create a player camera to inspect the terrain

## What Cinevva must NOT do yet
- Generate or place a castle
- Generate or place the medieval village
- Flatten or reshape the hill
- Rescale the model
- Rotate the terrain
- Invent roads, walls or historical structures

## Fidelity note
This is a game-reference reconstruction rather than survey-grade LiDAR/DEM.
For the final historically faithful version, the terrain should later be refined/replaced with official DEM/LiDAR data while keeping this coordinate contract.
