// Three.js
import * as THREE from 'three';

// TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// D3.js
import * as d3 from 'd3';

import { playData } from './playData';
import { GUI } from 'lil-gui';

const gui = new GUI();

let scene, camera, renderer;
let spheres = [];

const deltaScale = d3.scaleLinear()
    .domain([-2, 2])
    .range([-50, 50]);


const volumeExtent = d3.extent(playData, d => d.volume);

const volumeScale = d3.scaleLinear()
    .domain(volumeExtent)
    .range([0.2, 3]);

const timeExtent = d3.extent(playData, d => new Date(d.created_time));
const timeScale = d3.scaleTime()
    .domain(timeExtent)
    .range([-50, 30]);  // This range determines the starting and ending z-positions based on the earliest and latest timestamps.
    
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  let testGeometry = new THREE.BoxGeometry(1, 1, 1);
  let testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let testMesh = new THREE.Mesh(testGeometry, testMaterial);
  scene.add(testMesh);
  
  const cameraControls = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const cameraFolder = gui.addFolder('Camera');
  cameraFolder.add(cameraControls, 'x', -50, 50).name('X position').onChange(val => camera.position.x = val);
  cameraFolder.add(cameraControls, 'y', -50, 50).name('Y position').onChange(val => camera.position.y = val);
  cameraFolder.add(cameraControls, 'z', -50, 50).name('Z position').onChange(val => camera.position.z = val);
  cameraFolder.open();
  console.log(timeExtent);

  let xPos = -playData.length / 2;
  playData.forEach(item => {
    if(item.delta){

      let direction = deltaScale(parseFloat(item.delta));
      let thickness = volumeScale(item.volume);
      let color = new THREE.Color(colorScale(item.underlying_symbol));
      let material = new THREE.MeshBasicMaterial({ color: color });
      let geometry = new THREE.SphereGeometry(thickness, 32, 32);  // thickness determines the radius of the sphere

      let sphere = new THREE.Mesh(geometry, material);
      sphere.position.x = xPos;
      sphere.position.y = direction;
      sphere.position.z = timeScale(new Date(item.created_time));  // Positioning the sphere based on the timestamp
      xPos += 1;
    
      scene.add(sphere);
      spheres.push(sphere);
      console.log("x position: ", sphere.position.x);
      console.log("y position: ", sphere.position.y);
      console.log("Z position: ", sphere.position.z);
    }
  });
}
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
init();
animate();