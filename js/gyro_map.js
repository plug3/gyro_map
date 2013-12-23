window.onload = function() {
	var container = document.getElementById('container');

	var stats;

    var camera, scene, renderer;
    var geometry, material, mesh;
    var target = new THREE.Vector3();
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;

    var lon = 0, lat = 0;
    var phi = 0, theta = 0;

    var touchX, touchY;

    var degRad = Math.PI/180;
    var yaw, roll, pitch;
    var hlookat = 0;
    var vlookat = 0;
    var hasGyro = false;

    var currentId = "";
    var popContent = ["The best store in town", "Incredible food at very good price", "lorem ipsum", "ici on parle francais"];

    var plane = new THREE.Object3D();

    init();
    initStats();
    animate();

    function initStats() 
    {
        stats = new Stats();
        stats.setMode(1);

        // Align top left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '400px';
        stats.domElement.style.top = '0px';

        document.body.appendChild( stats.domElement );

    }

    function init() 
    {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, containerWidth / containerHeight, 1, 1000 );

        var sides = [
        {
            url: 'textures/cube/church/posx.jpg',
            position: [ -512, 0, 0 ],
            rotation: [ 0, Math.PI / 2, 0 ]
        },
        {
            url: 'textures/cube/church/negx.jpg',
            position: [ 512, 0, 0 ],
            rotation: [ 0, -Math.PI / 2, 0 ]
        },
        {
            url: 'textures/cube/church/posy.jpg',
            position: [ 0,  512, 0 ],
            rotation: [ Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'textures/cube/church/negy.jpg',
            position: [ 0, -512, 0 ],
            rotation: [ - Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'textures/cube/church/posz.jpg',
            position: [ 0, 0,  512 ],
            rotation: [ 0, Math.PI, 0 ]
        },
        {
            url: 'textures/cube/church/negz.jpg',
            position: [ 0, 0, -512 ],
            rotation: [ 0, 0, 0 ]
        }
        ];

        for ( var i = 0; i < sides.length; i ++ ) 
        {

            var side = sides[ i ];

            var element = document.createElement( 'img' );
            element.width = 1026; // 2 pixels extra to close the gap.
            element.src = side.url;

            var object = new THREE.CSS3DObject( element );
            object.position.fromArray( side.position );
            object.rotation.fromArray( side.rotation );
            scene.add( object );

        }


        // build iteractive popup


        // params
        var r = Math.PI / 2;
        var d = 250;
        var pos = [ [ 300, 40, -10 ], [ 300, 20, -200 ], [ 0, 0, -d ], [ 300, 150, 150 ]];
        var rot = [ [ 0, -1.2, 0 ], [ 0, -r/2, 0 ], [ 0, 0, 0 ], [ 0, -2.5, 0 ]];

        // initialize popups
        for ( var i = 0; i < 4; i ++ ) 
        {
        	var element = document.getElementById(i);
	        $(element).addClass("popup");
	        //element.addEventListener('mouseup', onPopupClick);

	        var divObject = new THREE.CSS3DObject(element);
	        divObject.position.fromArray(pos[i]);
	        divObject.rotation.fromArray(rot[i]);
	        plane.add(divObject);
        }
        
        $('.popup').click(onPopupClick);

        // --------  End init popup

        scene.add(plane);


        // test for compass
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', compassTest);
            hasGyro = true;
        } else {
            //console.log("startMouseNav");
            //startMouseNav();
        }

		// Set up renderer, scene and camera
		renderer = new THREE.CSS3DRenderer();
		renderer.setSize( containerWidth, containerHeight );
		container.appendChild( renderer.domElement );
    }


    // ----------   Pick object  --------

    function onPopupClick( e )
    {
        // rest previous selection if exists
        console.log("clicked on id: " + currentId);
        if (currentId != "") {
            //$("#" + currentId).text("Location: " + currentId);
            TweenMax.to("#" + currentId, 0.45, {opacity:'0.75', width:'100px', height:'20px', ease:Expo.easeOut});
            TweenMax.to("#" + currentId, 0.25, {top:'0', ease:Back.easeOut});
        }
        

        // update new selection
        currentId = e.target.id;
        if (currentId === "") {
        	console.log("correcting : " + e.target);
        	curentId = $(this).parent().attr("id");
        }
        console.log("picked : " + currentId);

        TweenMax.to("#" + currentId, 0.45, {opacity:'1', width:'180px', height:'100px', ease:Expo.easeOut});
        TweenMax.to("#" + currentId, 0.25, {top:'-40', ease:Back.easeOut});
       
        
    }

    // ----------   End Pick object  --------


    function compassTest(event)
    {
        window.removeEventListener('deviceorientation', compassTest);
        if (event.webkitCompassHeading != undefined || event.alpha != null) // Device does have a compass
        {
            hasCompass = true;
        }
        else
        {
            hasCompass = false;
        }
        startGyro();
        console.log("startGyro");
    }

    function startMouseNav() {
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

        window.addEventListener( 'resize', onWindowResize, false );
    }


    function onDocumentMouseDown( event ) {

        event.preventDefault();

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );

    }

    function onDocumentMouseMove( event ) {

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        lon -= movementX * 0.1;
        lat += movementY * 0.1;

    }

    function onDocumentMouseUp( event ) {

        document.removeEventListener( 'mousemove', onDocumentMouseMove );
        document.removeEventListener( 'mouseup', onDocumentMouseUp );

        document.getElementById("doTiltLR").innerHTML = lon;
        document.getElementById("doTiltFB").innerHTML = lat;
    }

    function onDocumentMouseWheel( event ) {

        camera.fov -= event.wheelDeltaY * 0.05;
        camera.updateProjectionMatrix();

    }

     function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
        containerWidth = window.innerWidth;
        containerHeight = window.innerHeight;
    }

    
    function startGyro() {
        window.addEventListener('deviceorientation', onDeviceOrientationChange); // Gyroscope
    }
    
    function onDeviceOrientationChange(event)
    {

        yaw = event.alpha;
        pitch = event.beta;
        roll = event.gamma;
       
        /*
        console.log("hlookat = " + THREE.Math.degToRad( hlookat ));
        console.log("vlookat = " + THREE.Math.degToRad( vlookat ));
        */
       
        hlookat = (-yaw -180 ) % 360;
        vlookat = Math.max(Math.min(( pitch),90),-90);
        
        // fix gimbal lock
        if( Math.abs(pitch) > 70 ) {
            altyaw = event.alpha; 
            document.getElementById("doEvent").innerHTML = "gimbal lock";

            switch(window.orientation) {
                case 0:
                if ( pitch>0 ) 
                    altyaw += 180;
                break;
                case 90: 
                altyaw += 90;
                break;
                case -90: 
                altyaw += -90;
                break;
                case 180:
                if ( pitch<0 ) 
                    altyaw += 180;
                break;
            }

            altyaw = altyaw % 360;
            if( Math.abs( altyaw - yaw ) > 180 ) 
                altyaw += ( altyaw < yaw ) ? 360 : -360;

            factor = Math.min( 1, ( Math.abs( pitch ) - 70 ) / 10 );
            yaw = yaw * ( 1-factor ) + altyaw * factor;
        } else {
            document.getElementById("doEvent").innerHTML = "DeviceOrientation";
        }

        document.getElementById("doTiltLR").innerHTML = Math.round(roll);
        document.getElementById("doTiltFB").innerHTML = Math.round(pitch);
        document.getElementById("doDirection").innerHTML = Math.round(yaw);       
    }
    
    
    function animate() {

        requestAnimationFrame( animate );
        
        //lon +=  0.1;
        lat = Math.max( - 85, Math.min( 85, lat ) );
        //phi = THREE.Math.degToRad( 90 - lat );
        //theta = THREE.Math.degToRad( lon );

        if (hasGyro) {
            phi = THREE.Math.degToRad( 180 - roll );
            theta = THREE.Math.degToRad( 90 - yaw );
        } else {
            phi = THREE.Math.degToRad( 90 - lat );
            theta = THREE.Math.degToRad( lon );
        }
        
        

        target.x = Math.sin( phi ) * Math.cos( theta );
        target.y = Math.cos( phi );
        target.z = Math.sin( phi ) * Math.sin( theta );

        
        /*
        target.x = THREE.Math.degToRad(hlookat);
        target.y = THREE.Math.degToRad(vlookat);
        */
        
        camera.lookAt( target );
        
        renderer.render( scene, camera );

        stats.update();
        
    }
}