# World sailing destinations

Free sailing includes ten real regions alongside the original four practice waters. The cover uses a Natural Earth world map with geographic pins; selecting a pin changes the actual simulation location. Browsing does not initialize WebGL. When a browser cannot create a WebGL context, the simulator offers a live canvas chart with the same physics, controls, terrain, and traffic.

## Geographic reconstruction

`scripts/build-world-destinations.py` downloads public Mapzen/AWS Terrarium elevation tiles (zoom 12) and OpenStreetMap coastline extracts. Regional grids contain 267–385 rows and 304–385 columns, with approximately 39–83 m sample spacing, real metre units, and north aligned with negative Z. Coastline masks preserve islands, inlets, the Santorini caldera, and Bora Bora's lagoon. Sandy Spit has a separate vector shoreline because the regional grid cannot resolve such a small cay; its low relief is interpreted from reference imagery.

The compressed delta/RLE grid decodes losslessly. `src/world/data/terrain-manifest.json` records bounds, tile IDs, sample spacing and SHA-256 hashes of the signed-decimetre grids. Rendering and grounding use the same triangle interpolation. The map and plotter use contours from that terrain. Dataset boundaries are finite; beyond them, the depth sampler extends the nearest boundary values rather than inventing an abrupt drop at a clipped mainland edge.

Bathymetry is **modeled**, blending coarse offshore DEM depths with a distance-from-shore ramp. Reef detail, tides, coastal soundings, and submerged obstructions are not surveyed navigation data. DEMs also have source errors and cannot reproduce individual rocks or sharp peaks exactly. Building layouts, roads, vehicles, trees, harbor fixtures, and wildlife are stylized interpretations at geographic settlement locations, not exact architectural reconstructions. Harbor and bungalow collision fixtures share their rendered positions.

## Reference-guided scenery

Research inspected online descriptions and lead photographs; downloaded photographs remain in `/tmp/sail-destination-research` and are not redistributed. Preview images shipped by the application are generated from the terrain. The scenery interpretation is recorded in `src/world/destination-character.js`.

| Destination | Distinguishing features | Reading and image references |
| --- | --- | --- |
| British Virgin Islands | Sandy Spit's small white sand ring, low central foliage, sparse palms, turquoise shelf, green volcanic ridges; small Great Harbour and larger Road Town | [User's Sandy Spit photograph](https://journeyable.org/wp-content/uploads/2024/01/Aerial-view-of-Catamaran-at-Sandy-Spit-British-Virgin-Islands-1.jpg), [Sandy Spit](https://en.wikipedia.org/wiki/Sandy_Spit), [Jost Van Dyke](https://en.wikipedia.org/wiki/Jost_Van_Dyke) |
| Tobago Cays | Five small cays, coral-lagoon colors, low vegetation, sparse settlement on nearby Mayreau, small wharf and turtle sightings | [Tobago Cays](https://en.wikipedia.org/wiki/Tobago_Cays), [Mayreau](https://en.wikipedia.org/wiki/Mayreau) |
| Exumas | Long limestone cays, pale shallow banks, scrub, pastel Staniel Cay waterfront, small marina and Big Major Cay beach pigs | [Exuma](https://en.wikipedia.org/wiki/Exuma), [Staniel Cay](https://en.wikipedia.org/wiki/Staniel_Cay), [Bahamas tourism](https://www.bahamas.com/islands/the-exumas) |
| Dalmatian Coast | Indented pine islands, limestone shores, dense Hvar stone town, terracotta roofs, fortress and a busy harbor | [Hvar](https://en.wikipedia.org/wiki/Hvar_(town)), [Pakleni Islands](https://en.wikipedia.org/wiki/Pakleni_Islands) |
| Santorini | Flooded caldera, dry volcanic slopes, dark deep water, dense white Oia/Fira terraces, blue-domed accents, small coastal landing | [Santorini](https://en.wikipedia.org/wiki/Santorini), [Oia](https://en.wikipedia.org/wiki/Oia%2C_Greece) |
| Geirangerfjord | Winding glacial fjord, tall gray cliffs, conifers, high snow line, seven waterfall streams, small timber village and cool overcast light | [Geirangerfjord](https://en.wikipedia.org/wiki/Geirangerfjord), [Geiranger](https://en.wikipedia.org/wiki/Geiranger), [Seven Sisters](https://en.wikipedia.org/wiki/Seven_Sisters_Waterfall) |
| Seychelles | Granite coastal boulders, palms and broadleaf forest, warm sand, small Creole settlements, limited road traffic and giant tortoises | [La Digue](https://en.wikipedia.org/wiki/La_Digue), [Praslin](https://en.wikipedia.org/wiki/Praslin), [Anse Source d'Argent](https://en.wikipedia.org/wiki/Anse_Source_d%27Argent) |
| Whitsundays | Drowned continental ridges, eucalyptus forms, Whitehaven's white silica beach, broad turquoise water, larger Hamilton Island marina | [Whitsunday Islands](https://en.wikipedia.org/wiki/Whitsunday_Islands), [Whitehaven Beach](https://en.wikipedia.org/wiki/Whitehaven_Beach) |
| Bora Bora | Volcanic core, low outer motus, enclosed lagoon, palms, Vaitape settlement and thatched overwater bungalows | [Bora Bora](https://en.wikipedia.org/wiki/Bora_Bora), [Vaitape](https://en.wikipedia.org/wiki/Vaitape) |
| Bay of Islands | Drowned river valleys, branching wooded headlands, green broadleaf vegetation, weatherboard waterfronts, moderate harbor traffic and dolphins | [Bay of Islands](https://en.wikipedia.org/wiki/Bay_of_Islands), [Russell](https://en.wikipedia.org/wiki/Russell%2C_New_Zealand) |

Sandy Spit remains uninhabited, with no road, building, pier or artificial mooring. Settlements and traffic vary in density rather than repeating the same village at every island. Wildlife sightings are illustrative, not measurements of current animal populations.

## Attribution and regeneration

- Terrain: [Mapzen/AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/), [source attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md). Includes USGS SRTM/GMTED2010, NOAA ETOPO1, Copernicus EU-DEM, © Kartverket, © Commonwealth of Australia (Geoscience Australia) 2017, and Copyright 2011 Crown copyright Land Information New Zealand and the New Zealand Government. Source-specific credits appear on the application's terrain sources page.
- Coastlines: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL 1.0. Bundled `*-coastline.json` extracts retain source identification; derived coastline data is available under ODbL.
- Overview map: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), public domain, 1:110m land polygons.
- Research: English Wikipedia descriptions and Wikimedia lead imagery; the source pages identify individual photograph credits and licenses. No reference photographs are bundled.

Regenerate with `uv run --with pillow --with numpy --with scipy --with scikit-image --with shapely python scripts/build-world-destinations.py`. Downloads are cached in `/tmp/sail-world-terrain-tiles`. `node scripts/capture-world-scenery.mjs` captures every live scene from the development server on port 5199. `node --test tests/world-destinations.test.js` verifies terrain hashes, triangle/physics agreement, safe starts, grounded settlements, bounded scenery and landmark topology.
