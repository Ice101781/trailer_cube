//check for browser support of WebGL
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  };


//refer to HTML tags
  function $( id ) {
    return document.getElementById( id );
  };


//some global vars
  var clock = new THREE.Clock();

  var width = window.innerWidth;
  var height = window.innerHeight;

  var container = document.getElementById("container");
    
  //verify that document.body is non-null before appending container
    if(document.body != null) {
      document.body.appendChild(container);
    };

  var scene = new THREE.Scene(), 
      camera = new THREE.PerspectiveCamera(45, (width/height), 0.01, 100),
      controls = new THREE.OrbitControls(camera, container),
      renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
      
  //verify that container is non-null before appending renderer, setting attributes, and printing 'loading...' text
    if(container != null) {    
      container.appendChild(renderer.domElement);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000);
      $( "loading" ).style.display = "block";   
    };

  var projector = new THREE.Projector(),
      raycaster = new THREE.Raycaster(),
      mouse = { x: 0, y:0 };

//listen for events
  window.addEventListener('mousedown', on_mouse_down, false);
  window.addEventListener('resize', on_window_resize, false);


function cube_move() {
  var axis = new THREE.Vector3(),
      tangent = new THREE.Vector3(),
      up = new THREE.Vector3(0, 1, 0),
      num_points = 100,
      radians;

  var cube_path = new THREE.SplineCurve3([trailer_cube.position, camera.position]); 

  if (spline_counter <= 0.1) {
    trailer_cube.position.copy( cube_path.getPointAt(spline_counter) );
    tangent = cube_path.getTangentAt(spline_counter).normalize();
    axis.crossVectors(up, tangent).normalize();
    radians = Math.acos( up.dot(tangent) );
    trailer_cube.quaternion.setFromAxisAngle(axis, radians);
    spline_counter += 0.01;
  };

  //adjust the controls so that the camera always shoots the cube
    controls.target = trailer_cube.position;
};


function on_mouse_down(e) {  
  //prevent OrbitControls functionality
    e.preventDefault();

  mouse.x = ( e.clientX / width ) * 2 - 1;
  mouse.y = - ( e.clientY / height ) * 2 + 1;

  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
    vector.unproject(camera);    
  
  raycaster.set(camera.position, vector.sub( camera.position ).normalize());
  
  var intersects = raycaster.intersectObjects(scene.children, true);  
    if(intersects.length > 0) {
      if (intersects[0].object == trailer_cube) {
        cube_click = true;
      };
    };
  
  //console.log(intersects);
};


function on_window_resize(e) {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = (width/height);
};


//global vars needed for the scene
  var delta, elapsed,
      load_mesh, load_light, 
      trailer_cube, video, video_image, video_image_context, video_texture, video_screen,
      load_time = 5,
      first_load = true,
      cube_click = false,
      spline_counter = 0;

init();
animate();
console.log(trailer_cube.geometry.vertices);


function load_screen_mesh() {
  //the golden ratio
    var g_phi = (1+Math.sqrt(5))/2;
     
  //vertices
    var v1  = new THREE.Vector3(     0,         0,      2*g_phi^2   ),
        v11 = new THREE.Vector3(   g_phi^2,   g_phi^2,    g_phi^2   ),
        v13 = new THREE.Vector3( -(g_phi^2),  g_phi^2,    g_phi^2   ),
        v16 = new THREE.Vector3( -(g_phi^2), -(g_phi^2),  g_phi^2   ),
        v18 = new THREE.Vector3(  (g_phi^2), -(g_phi^2),  g_phi^2   ),
        v26 = new THREE.Vector3(  2*g_phi^2,     0,         0       ),
        v29 = new THREE.Vector3(     0,       2*g_phi^2,    0       ),
        v32 = new THREE.Vector3( -2*g_phi^2,     0,         0       ),
        v35 = new THREE.Vector3(     0,      -2*g_phi^2,    0       ),
        v45 = new THREE.Vector3(   g_phi^2,   g_phi^2,   -g_phi^2   ),
        v47 = new THREE.Vector3(  -g_phi^2,   g_phi^2,   -g_phi^2   ),
        v50 = new THREE.Vector3(  -g_phi^2,  -g_phi^2,   -g_phi^2   ),
        v52 = new THREE.Vector3(   g_phi^2,  -g_phi^2,   -g_phi^2   ),
        v62 = new THREE.Vector3(     0,          0,    -2*g_phi^2   );

  //faces
    var faces = [ 
                  [v11, v1, v29],  [v11, v1, v26],  [v11, v26, v29], [v13, v1, v29],  [v13, v1, v32],  [v13, v29, v32],
                  [v16, v1, v32],  [v16, v1, v35],  [v16, v35, v32], [v18, v1, v26],  [v18, v1, v35],  [v18, v26, v35],
                  [v45, v26, v29], [v45, v29, v62], [v45, v26, v62], [v52, v26, v35], [v52, v26, v62], [v52, v35, v62],
                  [v47, v29, v32], [v47, v29, v62], [v47, v32, v62], [v50, v32, v62], [v50, v35, v62], [v50, v32, v35] 
                ];
      
  //create the geometry 
    var load_geo = new THREE.Geometry();

      for(i=0; i<faces.length; i++) {
        var triangle_geo = new THREE.Geometry();
      
        for(j=0; j<3; j++) {
         triangle_geo.vertices.push(faces[i][j]);
        };
      
        triangle_geo.faces.push( new THREE.Face3( 0, 1, 2 ) );

        load_geo.merge(triangle_geo);
      };

    var load_mat = new THREE.MeshBasicMaterial( {color: 0x4B32AF, wireframe: true} );

    load_mesh = new THREE.Mesh(load_geo, load_mat);
      scene.add(load_mesh);
};


function load_screen() {
  load_screen_mesh(); 
 
  camera.position.z = 30;
    
  //add a light to the load scene
    load_light = new THREE.AmbientLight(0xFFFFFF);
      scene.add(load_light);
};


function init() {
  load_screen();

  //load the objects in the homepage scene

    //add the cube
      var trailer_cube_geo = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
           
      var trailer_cube_mat = new THREE.MeshBasicMaterial(
        {
          color: 0x4B32AF,
          wireframe: true,          
          //normalMap: THREE.ImageUtils.loadTexture("public_assets/cube_normal.jpg"),
        }
      );

      trailer_cube = new THREE.Mesh(trailer_cube_geo, trailer_cube_mat); 
        trailer_cube.visible = false;
        scene.add(trailer_cube);        
        //the cube's spherical coordinates parameters
          var trailer_cube_r = 0;
          var trailer_cube_theta = 0;
          var trailer_cube_phi = 0;
        //set the cube's position at page load
          trailer_cube.position.setX(trailer_cube_r*Math.sin(trailer_cube_theta)*Math.cos(trailer_cube_phi));
          trailer_cube.position.setY(trailer_cube_r*Math.sin(trailer_cube_theta)*Math.sin(trailer_cube_phi));
          trailer_cube.position.setZ(trailer_cube_r*Math.cos(trailer_cube_theta));

    //add a light to the home page
      homepage_light = new THREE.PointLight(0xFFFFFF);
        homepage_light.visible = false;
        scene.add(homepage_light);
        //the homepage light's spherical coordinates parameters
          var homepage_light_r = 10;
          var homepage_light_theta = Math.PI/4;
          var homepage_light_phi = Math.PI/2;
        //set the homepage light's position at page load
          homepage_light.position.setX(homepage_light_r*Math.sin(homepage_light_theta)*Math.cos(homepage_light_phi));
          homepage_light.position.setY(homepage_light_r*Math.sin(homepage_light_theta)*Math.sin(homepage_light_phi));
          homepage_light.position.setZ(homepage_light_r*Math.cos(homepage_light_theta));

    //add trailers to the homepage
      video = document.createElement( 'video' );
        video.src = "hd_trailers/furious7.mp4";
        video.load();

      video_image = document.createElement( 'canvas' );
        video_image.width = 1280;
        video_image.height = 720;

      video_image_context = video_image.getContext( '2d' );
        video_image_context.fillStyle = '0#000000';
        video_image_context.fillRect(0, 0, video_image.width, video_image.height);

      video_texture = new THREE.Texture( video_image );
        video_texture.minFilter = THREE.LinearFilter;
        video_texture.magFilter = THREE.LinearFilter;

      var video_screen_geometry = new THREE.PlaneBufferGeometry(.2, .112360, 4, 4);

      var video_screen_material = new THREE.MeshBasicMaterial(
        {
          map: video_texture,
          overdraw: true,  
        } 
      );

      video_screen = new THREE.Mesh(video_screen_geometry, video_screen_material);
        video_screen.visible = false;
        scene.add(video_screen);
        video_screen.position.set(.25, .25, .5);
};


function loaded() {  
  scene.remove(load_mesh); 
  scene.remove(load_light);

  //the camera's spherical coordinates parameters
    var cam_r = 2;
    var cam_theta = 0;
    var cam_phi = 0;
  //set the camera's position at page load
    camera.position.setX(cam_r*Math.sin(cam_theta)*Math.cos(cam_phi));
    camera.position.setY(cam_r*Math.sin(cam_theta)*Math.sin(cam_phi));
    camera.position.setZ(cam_r*Math.cos(cam_theta));

  //camera rotation
    //controls.autoRotate = true;
    //controls.autoRotateSpeed = 0.125;

  $( "loading" ).style.display = "none";
  trailer_cube.visible = true;
  homepage_light.visible = true;
  video_screen.visible = true;
  video.play();
};


function render() {
  delta = clock.getDelta();
  elapsed = clock.getElapsedTime();

  controls.update(delta);

  renderer.render(scene, camera);
  
  if (elapsed >= load_time && first_load == true) {
    loaded();
    first_load = false;
  };

  if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
      
    video_image_context.drawImage( video, 0, 0 );
    
    if ( video_texture ) { 
      video_texture.needsUpdate = true;
    };
  
  };

  //console.log(variable name(s) here);
};


function animate() {
  //loading screen mesh's rotation
    if (elapsed < load_time) {
      load_mesh.rotation.x += 2*Math.PI/300;
      load_mesh.rotation.y += 2*Math.PI/300;
      //load_mesh.rotation.z += 2*Math.PI/300;
      //load_mesh.scale.x += Math.cos(elapsed)/150;
      //load_mesh.scale.y += Math.cos(elapsed)/150;
      //load_mesh.scale.z += Math.cos(elapsed)/150;
    };

  //cube movement
    if(cube_click == false) {
      //the cube's rotation
        //trailer_cube.rotation.y -= (2*Math.PI)/2000;
    }
    else {
      cube_move();
    };  

  requestAnimationFrame(animate);
  render();   
};
