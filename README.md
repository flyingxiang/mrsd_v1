# Javascript implementation of multi-resolution selective distinction (version one)

######Authors
[Shaodong Wang (unclejimbo)](http://unclejimbo.github.io/)<br/>
[Xiang Zhang]() <tt>&lt;[xiang.zhang@whu.edu.cn](mailto:xiang.zhang@whu.edu.cn)&gt;</tt><br/>

## Brief introduction
This is a student project aiming to make the best use of a map space for pining icons or photos on the map. This should be able to allow a maximum use of the free space available and avoid overlap of icons a.s.a.p. More icons will show up as the map zooms in.

Here is the [live map](http://flyingxiang.github.io/mrsd_v1/index.html) of this implementation. Feel free to play around and feedbacks are welcomed;-)

## Snapshots
<p>
Raw data points before processing <br/>
<img src="https://raw.githubusercontent.com/flyingxiang/mrsd_v1/gh-pages/raw_data.jpg" title="raw data points before processing">
Selected points with symbols <br/>
<img src="https://raw.githubusercontent.com/flyingxiang/mrsd_v1/gh-pages/selected_data.jpg" title="selected points with symbols">
</p>

## Technologies
-   OpenLayers library is used to interact with base maps.
-   Map tiles and aerial image tiles are requested from the MapQuest/Mapbox tile servers.
-   MRSD structure and algorithm is implemented from scratch based on a Quadtree structure.

## Limitations
-   Currently, client-side technology is used as a proof-of-concept.
-   Points are loaded from local files and then fed into browser javascript. For larger datasets, this can take long! or even crash the browser.
-   The building of the mrsd structure is done on client side (js code). This makes it difficult to adapt to a real web environment.
-   Parameters controlling the size of icons/photos and the overlapping factor are not exposed as UI elements.
