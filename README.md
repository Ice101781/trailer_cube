<a href="http://trailer-cube.herokuapp.com/">trailer_cube</a>
===

&nbsp; This project is a <a href="https://github.com/rails/rails">Ruby on Rails</a>-based application hosted on <a href="http://www.heroku.com">Heroku</a>. It has a dependency on <a href="https://github.com/mrdoob/three.js/">Three.js</a>. All media are stored on <a href="https://aws.amazon.com/s3/">Amazon's S3 Web Service</a>, are copyright of their respective owners, and have been presented only for instructional purposes.

&nbsp; The entirety of the user interface, with the exception of the header and footer, is rendered in 3D and contained within a single `<div>` element. In the load screen below, the icon and progress bar are geometric objects that share the same "space". The camera is set closest to the user, followed by the progress bar, and finally the icon. The approach is unconventional yet the experience is still familiar.

<br>
<img width="" alt="load screen" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVY0s3VUhFT2xYSnM">
<br>

&nbsp; Once the necessary media have loaded, the progress bar and icon are removed from the scene and the camera is repositioned before a grid of images in the space. Mouse over any one of these and a transparent panel containing information about the trailer is displayed on either the top or bottom-half of the screen, depending on the location of the image. As the cursor is shifted around the grid, the panel updates with the relevant info. Move the cursor beyond the edges of the grid and the panel disappears.

<br>
<img width="" alt="main page" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVRnhaT2IxdUlZWVU">
<br>

&nbsp; Select an image to lock on a trailer, and the other images will darken to highlight the choice. Click the title to view the film's page on <a href="http://www.rottentomatoes.com">Rotten Tomatoes</a>, or any other purple text to link to <a href="http://www.imdb.com">IMDB</a> content. Click the purple horizontal rule to exit the current selection, or the image again to position the camera in front and play the trailer.

<br>
<img width="" alt="trailer selected" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVd1NTSU1HUS1yZ1U">
<br>

&nbsp; Move the cursor to the bottom of the screen to reveal the video controls. Again, user interaction is intuitive here. Click the arrow button on the far right at any time to stop playback and return to the grid.

<br>
<img width="" alt="trailer playing" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVSjBsa0ZVV1kyUWc">
<br>

***
Concept Graphics

<br>
<img width="" alt="concept 1" src="https://drive.google.com/uc?export=download&id=1eOxtnVcCLissfZgLC22dz9Qx3ZraDVaa">
<br>

<br>
<img width="" alt="concept 2" src="https://drive.google.com/uc?export=download&id=1cClUGameSgHpin7_5a25RMR2_wniFdSU">
