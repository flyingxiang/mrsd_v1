# Multi-resolution selective distinction (version one)
This is a student project aiming to make the best use of a map space for pining icons or photos on the map. This should allow a maximum use of space and avoid overlap of icons a.s.a.p. More icons will show up as the map zooms in.

## Technologies
-   OpenLayers library is used to interact with base maps.
-   Map tiles and aerial image tiles are served from the free MapQuest-OSM source.
-   MRSD structure and algorithm is implemented from scratch based on a Quadtree structure.

## Limitations
-   Currently, client-side technology is used as a proof-of-concept.
-   Points are loaded from local files and then fed into client javascript. For larger datasets, this can take long! or even crash the client.
-   The building of the mrsd structure is done on client side (js code). This makes it difficult to adapt to a real web environment.
-   Parameters controlling the size of icons/photos and the overlapping factor are not exposed as UI elements.
