// import logo from './logo.svg';
import React, { Component } from 'react';
import './App.css';
import * as THREE from "three";

import { useSpeechSynthesis } from "react-speech-kit";

import 'react-chat-widget-with-mic/lib/styles.css';

// import { Canvas } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
// const MODEL_PATH= 'models/scene.gltf';
// const MODEL_PATH = 'models/chat-bot/Main.fbx';
// const MODEL_PATH = 'models/chat-bot/Main.gltf';

var mixer;
var neck;                          // Reference to the neck bone in the skeleton
var waist;

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}

class App extends Component {

  speechText;
  idleAnim;
  offensive
  face;

  
  handleNewUserMessage = newMessage => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
  };

  componentDidMount() {
    var clock = new THREE.Clock();
    var loaderAnim = document.getElementById('js-loader');

    document.addEventListener('mousemove', function (e) {
      var mousecoords = getMousePos(e);
      if (neck && waist) {
        moveJoint(mousecoords, neck, 50);
        moveJoint(mousecoords, waist, 30);
      }
    });

    function getMousePos(e) {
      return { x: e.clientX, y: e.clientY };
    }

    function moveJoint(mouse, joint, degreeLimit) {
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      joint.rotation.y = THREE.Math.degToRad(degrees.x);
      joint.rotation.x = THREE.Math.degToRad(degrees.y);
    }
    // === THREE.JS CODE START ===
    var scene = new THREE.Scene();
    // scene.add(new THREE.AxesHelper(5))
    // const size = 5;
    // const near = 5;
    // const far = 50;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const camera = new THREE.OrthographicCamera(-size, size, size, -size, near, far);
    // camera.position.set(1, 2, 12);
    // camera.lookAt(1, 1, 1);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setClearColor(new THREE.Color('skyblue'));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    // const controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true
    // controls.target.set(0, 1, 0)

    let d = 8.25;
    var pLight= new THREE.PointLight(0xffffff, 1, 100);
    pLight.position.set(2,2,2);
    scene.add(pLight);

    var rLight= new THREE.PointLight(0xff0000, 1, 100);
    rLight.position.set(0,2,0);
    scene.add(rLight);
    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
    dirLight.position.set(2,2,2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);
    

    camera.position.set(0.8, 1.5, 4.0)
    
    let ROOM_PATH='models/room/scene.gltf';
    const MODEL_PATH = 'models/game_girl/scene.gltf';

    const fbxLoader = new GLTFLoader();

     fbxLoader.load(ROOM_PATH,(obj)=>{
      let model=obj.scene;
      console.log('room loaded',obj);
      model.rotation.y=1.5;
      scene.add(model);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '%loaded');
    }, (err) => {
      console.log('error: ', err);
    })


    fbxLoader.load(MODEL_PATH, (obj) => {
      console.log('girl loaded', obj);
      let model = obj.scene;
      model.position.z=1.5;
      model.rotation.y=0.5
      let fileAnimations = obj.animations;
      console.log('animations: ', fileAnimations);
      // model.rotation.y=0;
      model.traverse(o => {
        // if (o.isBone) {
        //   console.log(o.name);
        // }

        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          // o.material = stacy_mtl;
        }

        // Reference the neck and waist bones
        if (o.isBone && o.name === 'mixamorigNeck_05') {
          neck = o;
        }
        if (o.isBone && o.name === 'mixamorigSpine_02') {
          waist = o;
        }
      });

      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      let worriorIdel = THREE.AnimationClip.findByName(fileAnimations, "WarriorIdle");
      let OffensiveIdle = THREE.AnimationClip.findByName(fileAnimations, "OffensiveIdle");
      let facial = THREE.AnimationClip.findByName(fileAnimations, "FacialExpressions");
      // idleAnim.tracks.splice(0, 4);
      // idleAnim.tracks.splice(66, 6);
      this.idle = mixer.clipAction(worriorIdel);
      this.offensive = mixer.clipAction(OffensiveIdle);
      this.face = mixer.clipAction(facial);

    },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '%loaded');
      }, (err) => {
        console.log('error: ', err);
      })


    var animate = function () {
      if (mixer) {
        mixer.update(clock.getDelta());
      }

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      // objs.forEach(({mixer}) => {mixer.update(clock.getDelta());});

      requestAnimationFrame(animate);
      // controls.update();
      renderer.render(scene, camera);
    };
    animate();
    // === THREE.JS EXAMPLE CODE END ===
    //check for resize
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvasPixelWidth = canvas.width / window.devicePixelRatio;
      let canvasPixelHeight = canvas.height / window.devicePixelRatio;

      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

  }

  _handleKeyDown = (e) => {
    
    if (e.key === 'Enter') {
      
      this.callChatBot(e.target.value);
      e.target.value='';
    }
  }

  _inputChanged= (e)=>{
    console.log('input changed',e);
  }

  callChatBot(text){
    
    let speak=this.props.speak;
    let voice=this.props.voice;
   
    // fetch("https://ec2-3-15-240-35.us-east-2.compute.amazonaws.com:80/chatbot/"+text
    fetch("https://3.15.240.35:80/chatbot/"
    +text,{
      "method": "GET",
    })
    .then(res=> res.json())


    // $.getJSON('http://ec2-3-145-62-222.us-east-2.compute.amazonaws.com/chatbot/'+text)
    .then(results=>{
      console.log('result: ',results);
      console.log('speak voice',voice);
    speak({text: results.query, voice: voice});
    this.face.play();
    this.idle.play();
     
    })
    .catch(err=>{
      console.log('error: ',err);
    })
  }


  render() {
    
    return (
      <div ref={ref => (this.mount = ref)} >
        <div className="rcw-sender">
          <input type="text" className="rcw-new-message" name="message" onKeyDown={this._handleKeyDown} placeholder="Type a message..." autoComplete='off' />
            {/* <button type="button" className="rcw-send">
              <img src="https://img.icons8.com/ios-glyphs/30/000000/microphone.png"/>
            </button> */}
        </div>


      </div>
    )
  }
}

function withMyHook(Component) {
  return function WrappedComponent(props) {
     const { speak , voices} = useSpeechSynthesis();
     console.log('withMyHook | voices: ',voices);
    return <Component {...props} speak={speak} voice={voices[2]} />;
  }
}

export default withMyHook(App);
