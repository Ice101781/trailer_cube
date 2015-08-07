/*KNOWN BUGS:
  1) this web app is optimized for the Google Chrome(c) browser, so some functionality/features may be lost when
     using other browsers.

  ***FIXED 07/18/15 @ 1:00am************************************************************************************
  2) when playing the first video of a given user session, the pause button will need to be pressed twice 
     in order to function correctly, unless another playback button is initially pressed.
  **************************************************************************************************************

  3) sometimes when exiting a video the camera will position itself above the cube, shooting downward. 
     this behavior seems to occur randomly.

  4) sometimes when playing a video the following console error will appear: "Uncaught IndexSizeError: Failed to execute
     'end' on 'TimeRanges': The index provided (0) is greater than or equal to the maximum bound (0)". the error doesn't 
     seem to affect playback much.
*/

window.onload = function() {

//some global vars, append verifications, etc.
  var clock = new THREE.Clock(), container = $("container"), width = window.innerWidth, height = window.innerHeight;
    
  if(document.body != null) {append(container, document.body)};

  var scene    = new THREE.Scene(), 
      camera   = new THREE.PerspectiveCamera(48.5, 16/9, 0.01, 100),
      cam_home = new THREE.Vector3(-0.45, 0.60, .85),
      cam_load = new THREE.Vector3(60*Math.sin(0)*Math.cos(0), 60*Math.sin(0)*Math.sin(0), 60*Math.cos(0)),
      controls = new THREE.OrbitControls(camera, container),
      renderer = new THREE.WebGLRenderer({antialias: false, alpha: false});

  if(container != null) {renderer.setSize(width, height); renderer.setClearColor(0x000000); append(renderer.domElement, container)};
      
  var mouse      = {x: 0, y:0},
      dimensions = [1280, 720],
      geoms_and_texts = [ video_screen_geometry         = new THREE.PlaneBufferGeometry(.1600, .09000, 1, 1),
                          video_controls_bkgnd_geometry = new THREE.PlaneBufferGeometry(.1575, .00500, 1, 1), 
                          button_geometry               = new THREE.PlaneBufferGeometry(.0072, .00405, 1, 1),
                          timeline_bkgnd_geometry       = new THREE.PlaneBufferGeometry(.0920, .00050, 1, 1),
                          load_progress_geometry        = new THREE.PlaneBufferGeometry(.0001, .35000, 1, 1),
                          video_progress_geometry       = new THREE.PlaneBufferGeometry(.0001, .00050, 1, 1),
                          trailer_info_geometry         = new THREE.PlaneBufferGeometry(.1600, .09000, 1, 1),
                          trailer_info                  = new THREEx.DynamicTexture(dimensions[0], dimensions[1]),
                          trailer_time_length           = new THREEx.DynamicTexture(dimensions[0], dimensions[1]),
                          trailer_time_progress         = new THREEx.DynamicTexture(dimensions[0], dimensions[1]) ];

      for(i=7; i<geoms_and_texts.length; i++) {geoms_and_texts[i].context.font = "500px Corbel"};
      
  var restart_button_material          = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/restart_button.png')}),
      rewind_button_material           = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/rewind_button.png')}),
      play_button_material             = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/play_button.png')}),
      pause_button_material            = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/pause_button.png')}),
      fastforward_button_material      = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/fastforward_button.png')}),
      enter_fullscreen_button_material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/enter_fullscreen_button.png')}),
      exit_fullscreen_button_material  = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/exit_fullscreen_button.png')}),
      exit_button_material             = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('public_assets/exit_button.png')}),
      video_controls_bkgnd_material    = new THREE.MeshBasicMaterial({color: 0x000000}),
      timeline_bkgnd_material          = new THREE.MeshBasicMaterial({color: 0x261958}),
      load_progress_material           = new THREE.MeshBasicMaterial({color: 0x00FF00}),
      timeline_progress_material       = new THREE.MeshBasicMaterial({color: 0x4B32AF}),
      buffer_progress_material         = new THREE.MeshBasicMaterial({color: 0x9999CC}),
      trailer_info_material            = new THREE.MeshBasicMaterial({map: trailer_info.texture, color: 0xFFFFFF}),
      trailer_time_length_material     = new THREE.MeshBasicMaterial({map: trailer_time_length.texture, color: 0x4B32AF}),
      trailer_time_progress_material   = new THREE.MeshBasicMaterial({map: trailer_time_progress.texture, color: 0x4B32AF});
   
  var load_progress = new THREE.Mesh(load_progress_geometry, load_progress_material);
      load_progress.position.set(-10, -25, 0);

  var trailer_info_mesh = new THREE.Mesh(trailer_info_geometry, trailer_info_material), 

      video_controls = new THREE.Object3D(),
      video_controls_meshes = [ restart_button             = new THREE.Mesh(button_geometry, restart_button_material),
                                rewind_button              = new THREE.Mesh(button_geometry, rewind_button_material),
                                play_button                = new THREE.Mesh(button_geometry, play_button_material),
                                pause_button               = new THREE.Mesh(button_geometry, pause_button_material),
                                fastforward_button         = new THREE.Mesh(button_geometry, fastforward_button_material),
                                enter_fullscreen_button    = new THREE.Mesh(button_geometry, enter_fullscreen_button_material),
                                exit_fullscreen_button     = new THREE.Mesh(button_geometry, exit_fullscreen_button_material),
                                exit_button                = new THREE.Mesh(button_geometry, exit_button_material),
                                video_controls_bkgnd       = new THREE.Mesh(video_controls_bkgnd_geometry, video_controls_bkgnd_material),
                                timeline_bkgnd             = new THREE.Mesh(timeline_bkgnd_geometry, timeline_bkgnd_material),
                                timeline_progress          = new THREE.Mesh(video_progress_geometry, timeline_progress_material),
                                buffer_progress            = new THREE.Mesh(video_progress_geometry, buffer_progress_material),
                                trailer_time_length_mesh   = new THREE.Mesh(button_geometry, trailer_time_length_material),
                                trailer_time_progress_mesh = new THREE.Mesh(button_geometry, trailer_time_progress_material) ];
      
      for(i=0; i<video_controls_meshes.length; i++) {video_controls.add(video_controls_meshes[i])};


  var videos = [], video_images = [], video_image_contexts = [], video_textures = [], video_screen_materials = [], 
      video_screens = [];

  for(h=0; h<titles.length; h++) {
    videos[h] = create("video");
    video_images[h] = create("canvas");
    video_image_contexts[h] = video_images[h].getContext('2d');
    video_textures[h] = new THREE.Texture(video_images[h]);
    video_screen_materials[h] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("/public_assets/t_c.png"), overdraw: true});
    video_screens[h] = new THREE.Mesh(video_screen_geometry, video_screen_materials[h]);
  };
    
  //generate positions for the video screens - NEED TO FIX THIS! // // // // // // // // // // // // // // // // // // // //
    var locations = [];

    for(i=0; i<titles.length; i++) {locations[i] = [(-.42+(i*.17)), .455, .51]};
  // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //


//listen for events
  window.addEventListener('resize',    on_resize,     false);
  window.addEventListener('mousemove', on_mouse_move, false);
  window.addEventListener('mousedown', on_mouse_down, false);

//user functions
  function on_resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = 16/9;
  };


  function on_mouse_move(event) { 
    event.preventDefault(); 
    mouse.x = (event.clientX/width)*2-1; 
    mouse.y = -(event.clientY/height)*2+1;
  };


  function on_mouse_down() {
    var mousedown_raycaster = new THREE.Raycaster(),
        mousedown_vector    = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    
    mousedown_vector.unproject(camera);    
    mousedown_raycaster.set(camera.position, mousedown_vector.sub(camera.position).normalize());
  
    var intersects = mousedown_raycaster.intersectObjects(scene.children, true);
    //console.log(intersects);

    if(intersects[0] == undefined) {return};
    
    var no_click_effect = [trailer_cube, 
                           video_controls_bkgnd, 
                           timeline_bkgnd, 
                           timeline_progress, 
                           buffer_progress, 
                           trailer_time_length_mesh, 
                           trailer_time_progress_mesh];
                            
    for(i=0; i<no_click_effect.length; i++) {if(intersects[0].object == no_click_effect[i]) {return}};
      
    if(intersects[0].object == restart_button) {
      videos[a].pause();
      videos[a].currentTime = 0;
      if(play_button.visible == true) {video_controls.remove(play_button); video_controls.add(pause_button)};
      videos[a].play();
      return;
    }
    else if(intersects[0].object == rewind_button) {
      videos[a].pause();
      videos[a].currentTime -= 5;
      if(play_button.visible == true) {video_controls.remove(play_button); video_controls.add(pause_button)};
      videos[a].play();
      return;
    }
    else if(intersects[0].object == play_button) {
      videos[a].play();
      video_controls.remove(play_button);
      video_controls.add(pause_button);
      return; 
    }
    else if(intersects[0].object == pause_button) {
      videos[a].pause();
      video_controls.remove(pause_button);
      video_controls.add(play_button);
      return;
    }
    else if(intersects[0].object == fastforward_button) {
      videos[a].pause();
      videos[a].currentTime += 5;
      if(play_button.visible == true) {video_controls.remove(play_button); video_controls.add(pause_button)};
      videos[a].play();
      return;
    }
    else if(intersects[0].object == enter_fullscreen_button) {
      container.webkitRequestFullscreen();
      return;        
    }
    else if(intersects[0].object == exit_fullscreen_button) {
      document.webkitExitFullscreen();
      return;
    }
    else if(intersects[0].object == exit_button) {
      if(play_button.visible == true) {video_controls.remove(play_button); video_controls.add(pause_button)};
      scene.remove(video_controls);    
      videos[a].pause();        
      videos[a].currentTime = 0;
      video_screen_materials[a].map = image_stills[a];      
      //remove this code once the cube has been tiled // // // // // // // // // // // // // // // // // // // // // // // //
      trailer_cube.visible = true;
      // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
      camera.position.set(locations[a][0], locations[a][1]+.1, locations[a][2]+controls.minDistance+.4);
      controls.target = new THREE.Vector3();
      controls.minDistance = 1;
      controls.enabled = true;
      return;
    };

    for(a=0; a<titles.length; a++) {if(intersects[0].object == video_screens[a]) {click = true; return a}};
  };


  function on_click() {
    if(video_controls.parent != scene) {
      //adjust minimum camera distance to target and toggle controls
        controls.minDistance = .1;
        controls.enabled = true ? false : null;
        //remove this code once the cube has been tiled // // // // // // // // // // // // // // // // // // // // // // //  
        trailer_cube.visible = false;
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
  
      //position the camera in front of the video screen that's been clicked
        controls.target = video_screens[a].position;
        camera.position.set(locations[a][0], locations[a][1], locations[a][2]+(controls.minDistance));

      //allow CORS, prepare and play the video
        videos[a].crossOrigin = '';
        video_images[a].width  = dimensions[0];
        video_images[a].height = dimensions[1];  
        video_image_contexts[a].fillStyle = '0#000000';
        video_image_contexts[a].fillRect(0, 0, video_images[a].width, video_images[a].height);
        video_screen_materials[a].map = video_textures[a];
        videos[a].src = media_sources[a][1];
        videos[a].load();
        videos[a].play();
     
      //set button, etc. locations and display video controls
        restart_button.position.set             (locations[a][0]+(0.0350), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        rewind_button.position.set              (locations[a][0]+(0.0430), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        pause_button.position.set               (locations[a][0]+(0.0510), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        play_button.position.set                (locations[a][0]+(0.0510), locations[a][1]-(0.0360), locations[a][2]+(0.00009));
        fastforward_button.position.set         (locations[a][0]+(0.0590), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        enter_fullscreen_button.position.set    (locations[a][0]+(0.0670), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        exit_fullscreen_button.position.set     (locations[a][0]+(0.0670), locations[a][1]-(0.0360), locations[a][2]+(0.00009));
        exit_button.position.set                (locations[a][0]+(0.0750), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        video_controls_bkgnd.position.set       (locations[a][0]-(0.0000), locations[a][1]-(0.0360), locations[a][2]+(0.00005));  
        timeline_bkgnd.position.set             (locations[a][0]-(0.0500)+.025, locations[a][1]-(0.0360), locations[a][2]+(0.00010));
        timeline_progress.position.set          (locations[a][0]-(0.0710)+.025, locations[a][1]-(0.0360), locations[a][2]+(0.00012));
        buffer_progress.position.set            (locations[a][0]-(0.0710)+.025, locations[a][1]-(0.0360), locations[a][2]+(0.00011));
        trailer_time_length_mesh.position.set   (locations[a][0]+(0.0250), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        trailer_time_progress_mesh.position.set (locations[a][0]-(0.0750), locations[a][1]-(0.0360), locations[a][2]+(0.0001));
        scene.add(video_controls);

      //listen for the end of the video
        videos[a].addEventListener('ended', function(event) {
          video_controls.remove(pause_button);
          video_controls.add(play_button);
          }, false
        );
    };
    
    //reset boolean value of 'click' variable
      click = true ? false : null;
  };


  function on_mouse_over() {
    var mouseover_raycaster = new THREE.Raycaster(),
        mouseover_vector    = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        
    mouseover_vector.unproject(camera);    
    mouseover_raycaster.set(camera.position, mouseover_vector.sub(camera.position).normalize());
  
    var intersects = mouseover_raycaster.intersectObjects(scene.children, true);
    //console.log(intersects);

    //logic for trailer info and video controls
      if(intersects[0] != undefined) {
      //LOGIC FOR TRAILER INFO -- NEED TO FINISH // // // // // // // // // // // // // // // // // // // // // // // //   
        for(i=0; i<titles.length; i++) {
          if(intersects[0].object == video_screens[i]) {
            trailer_info_mesh.position.set(camera.position.x, camera.position.y, camera.position.z-.1);
            scene.add(trailer_info_mesh);
          };
        };
      // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

        for(j=0; j<video_controls_meshes.length; j++) { 
          if(intersects[0].object == video_controls_meshes[j]) {
            video_controls.visible = true;
            return; 
          }
          else {
            video_controls.visible = false;
          };
        };  
      };
  };


  function loadmesh_animation() {
    if(rhombic_dodecahedron.parent == scene) { 
      rhombic_dodecahedron.rotation.x += 2*Math.PI/600;
      rhombic_dodecahedron.rotation.z -= 2*Math.PI/600;
    };
  };


  function loadbar_progress() {
    if(load_progress.parent == scene) {
      load_progress.scale.x = (95.5*(loaded_images/media_sources.length)-load_progress.geometry.parameters.width)/(load_progress.geometry.parameters.width);
      load_progress.position.x = (-47.75)+(load_progress.scale.x*load_progress.geometry.parameters.width)/2;
    };
  };


  function images_loaded() {
    if(loaded_images == media_sources.length) {
      //remove the loading screen and go to home camera position
        scene.remove(rhombic_dodecahedron, load_progress);
        controls.minDistance = 1;
        controls.maxDistance = 3;
        camera.position.copy(cam_home);
        controls.enabled = true;
      
      //toggle object visibility
        if($("rhombic-info") != null) {$("rhombic-info").remove()};
        for(d=0; d<titles.length; d++) {video_screens[d].visible = true};
        //comment-out the following code when cube is fully tiled // // // // // // // // // // // // // // // // // // // //
        trailer_cube.visible = true;
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

      //reset count of loaded images
        loaded_images = null;
    };
  };


  function video_update() {
    if(videos[a] != undefined) {
      if(videos[a].readyState === videos[a].HAVE_ENOUGH_DATA) {video_image_contexts[a].drawImage(videos[a], 0, 0)};
    
      if(videos[a].readyState > 0) {
        trailer_time_length.clear('black');
        trailer_time_length.drawText(sec_to_string(Math.round(videos[a].duration)-Math.round(videos[a].currentTime)), undefined, 475, 'white');
        
        trailer_time_progress.clear('black');
        trailer_time_progress.drawText(sec_to_string(Math.round(videos[a].currentTime)), undefined, 475, 'white');
        
        timeline_progress.scale.x = ((timeline_bkgnd.geometry.parameters.width*(Math.round(videos[a].currentTime)/Math.round(videos[a].duration)))-timeline_progress.geometry.parameters.width)/(timeline_progress.geometry.parameters.width);
        timeline_progress.position.x = locations[a][0]-(0.0710)+((timeline_progress.scale.x*timeline_progress.geometry.parameters.width)/2);
        
        buffer_progress.scale.x = ((timeline_bkgnd.geometry.parameters.width*(Math.round(videos[a].buffered.end(0))/Math.round(videos[a].duration)))-buffer_progress.geometry.parameters.width)/(buffer_progress.geometry.parameters.width);
        buffer_progress.position.x = locations[a][0]-(0.0710)+((buffer_progress.scale.x*buffer_progress.geometry.parameters.width)/2);
      };
    
      if(video_textures[a]) {video_textures[a].needsUpdate = true};
    };
  };


  function fullscreen_check() {
    if(document.webkitIsFullScreen) {
      video_controls.remove(enter_fullscreen_button);
      video_controls.add(exit_fullscreen_button);
    }
    else {
      video_controls.remove(exit_fullscreen_button);
      video_controls.add(enter_fullscreen_button);
    };  
  };


//global vars needed for the scene
  var delta, elapsed, rhombic_dodecahedron, trailer_cube, image_stills = [], loaded_images = 0, click = false, a = 0;

function init() {
  controls.minDistance = 30;
  controls.maxDistance = 90;
  camera.position.copy(cam_load);
  controls.enabled = false;

  //non-ambient light source(s) needed for Lambert material
    var point_light_1 = new THREE.PointLight(0xFF0000);
        point_light_1.position.set(-175, 0, 0);
    
    var point_light_2 = new THREE.PointLight(0x00FF00);
        point_light_2.position.set(175, 0, 0);
    
    var point_light_3 = new THREE.PointLight(0x0000FF);
        point_light_3.position.set(0, 0, 175);

  //loading screen mesh, a rhombic dodecahedron
    //geometry
      var rhom_dodec_geo = new THREE.Geometry();
      //vertices
        rhom_dodec_geo.vertices = [ new THREE.Vector3( 2.04772293123743050, -4.09327412386437040, -5.74908146957292670),
                                    new THREE.Vector3( 7.02732984841516030,  1.40331541320251810, -1.62706516545639390),
                                    new THREE.Vector3( 4.22549114271519950, -1.62031854283173550,  5.78962800381778210),
                                    new THREE.Vector3( 0.75411577446253997,  7.11690807989861880, -1.66761169970125600),
                                    new THREE.Vector3(-0.75411577446252998, -7.11690807989862510,  1.66761169970125020),
                                    new THREE.Vector3(-4.22549114271518980,  1.62031854283173260, -5.78962800381778920),
                                    new THREE.Vector3( -2.0477229312374288,  4.09327412386436950,  5.74908146957292670),
                                    new THREE.Vector3(-7.02732984841515230, -1.40331541320252740,  1.62706516545639970),
                                    new THREE.Vector3( 6.27321407395262300, -5.71359266669610030,  0.04054653424485652),
                                    new THREE.Vector3( 2.80183870569996340,  3.02363395603425690, -7.41669316927418000),
                                    new THREE.Vector3( 4.97960691717773150,  5.49658953706689160,  4.12201630411653590),
                                    new THREE.Vector3(-2.80183870569996340, -3.02363395603425690,  7.41669316927418000),
                                    new THREE.Vector3(-4.97960691717773150, -5.49658953706689160, -4.12201630411653590),
                                    new THREE.Vector3(-6.27321407395262480,  5.71359266669610210, -0.04054653424485653) ];
      //faces 
        rhom_dodec_geo.faces.push(  new THREE.Face3( 8, 0, 9 ),     new THREE.Face3( 9, 1, 8 ),
                                    new THREE.Face3( 8, 1, 10 ),    new THREE.Face3( 10, 2, 8 ),  
                                    new THREE.Face3( 8, 2, 11 ),    new THREE.Face3( 11, 4, 8 ),
                                    new THREE.Face3( 8, 4, 12 ),    new THREE.Face3( 12, 0, 8 ),
                                    new THREE.Face3( 12, 5, 9 ),    new THREE.Face3( 9, 0, 12 ),
                                    new THREE.Face3( 13, 3, 9 ),    new THREE.Face3( 9, 5, 13 ),
                                    new THREE.Face3( 10, 1, 9 ),    new THREE.Face3( 9, 3, 10 ),
                                    new THREE.Face3( 10, 3, 13 ),   new THREE.Face3( 13, 6, 10 ),
                                    new THREE.Face3( 11, 2, 10 ),   new THREE.Face3( 10, 6, 11 ),
                                    new THREE.Face3( 11, 7, 12 ),   new THREE.Face3( 12, 4, 11 ),
                                    new THREE.Face3( 12, 7, 13 ),   new THREE.Face3( 13, 5, 12 ),
                                    new THREE.Face3( 13, 7, 11 ),   new THREE.Face3( 11, 6, 13 ) );
      //compute normals 
        rhom_dodec_geo.computeVertexNormals();
        rhom_dodec_geo.computeFaceNormals();
      
    //material and mesh
      var rhom_dodec_mat       = new THREE.MeshLambertMaterial({color: 0x4B32AF, wireframe: false, shading: THREE.FlatShading});
          rhombic_dodecahedron = new THREE.Mesh(rhom_dodec_geo, rhom_dodec_mat);
          //rhombic_dodecahedron.position.set(0, 0, 0);

  //the cube
    var trailer_cube_geo     = new THREE.BoxGeometry(1, 1, 1, 50, 50, 50),
        trailer_cube_mat     = new THREE.MeshBasicMaterial({color: 0x4B32AF, wireframe: true});
        trailer_cube         = new THREE.Mesh(trailer_cube_geo, trailer_cube_mat); 
        trailer_cube.visible = false;
        //trailer_cube.position.set(0, 0, 0);            
    
  //add objects to the scene
    scene.add(point_light_1, point_light_2, point_light_3, rhombic_dodecahedron, load_progress, trailer_cube);

  //add video screens to the cube
    for(b=0; b<titles.length; b++) {
      video_screens[b].visible = false;
      video_screens[b].position.set(locations[b][0], locations[b][1], locations[b][2]);
      scene.add(video_screens[b]);
    };

  //allow CORS, load the image stills
    THREE.ImageUtils.crossOrigin = '';

    for(c=0; c<media_sources.length; c++) {
      image_stills[c] = THREE.ImageUtils.loadTexture(media_sources[c][0], undefined, function() {loaded_images++});
      video_screen_materials[c].map = image_stills[c];  
    };
};


function render() {
  delta = clock.getDelta();
  
  //loading screen animation and image load progress 
    loadmesh_animation();
    loadbar_progress();

  //view homepage if all images have been loaded
    images_loaded();

  //click logic
    if(click == true) {on_click()};

  //update the video
    video_update();

  //check for mouse_over events
    on_mouse_over();

  //fullscreen button check
    fullscreen_check();    

  controls.update(delta);
  renderer.render(scene, camera);
  //console.log(variable name(s) here);
};


function animate() {
  requestAnimationFrame(animate);
  render();   
};


init();
animate();
//console.log(variable name(s) here);
};
