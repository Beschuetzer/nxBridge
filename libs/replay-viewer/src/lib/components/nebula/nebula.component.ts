import { Component, ElementRef, OnInit } from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'nx-bridge-nebula',
  templateUrl: './nebula.component.html',
  styleUrls: ['./nebula.component.scss'],
})
export class NebulaComponent implements OnInit {
  private colorPrimary1 = 0x28537b;
  private colorPrimary1Light = 0x999999;
  private colorPrimary2 = 0x8ac6d0;
  private colorPrimary3 = 0xf4d262;
  private colorPrimary4 = 0xfbeeac;
  private colorRed = 0x7b3428;
  private colorRedLight = 0xff9494;
  private colorGreen = 0x537b28;
  private colorGreenLight = 0x89c549;
  
  private canvasElement: HTMLCanvasElement | null | undefined = null;
  private insertionElementSelector = '#nebula';

  private renderer = new THREE.WebGLRenderer();
  private scene = new THREE.Scene();

  private camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  private cameraZPositionStart = 1;
  private cameraXRotationStart = 1.16;
  private cameraYRotationStart = -0.12;
  private cameraZRotationStart = 0.27;

  private cloudOpacity = 0.85;
  private cloudWidth = 500;
  private numberOfCloudParticles = 50;
  private cloudParticles: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshLambertMaterial
  >[] = [];
 
  private cloudXRotationStart = 1.16;
  private cloudYRotationStart = -0.12;
  private cloudZRotationStart = Math.random() * 2 * Math.PI;
  private cloudZRotationAmount = 0.001;

  private fogColor = 0x03544e;
  private fogDensity = 0.001;
  private smokeImagePath = 'assets/replay-viewer/smoke.png';

  private ambient = new THREE.AmbientLight(this.colorPrimary2);
  // private directionalLight = new THREE.DirectionalLight(0xff8c19);

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.addCanvasToDom();
    this.addEverythingToScene();
    this.loadCloudParticles();
    this.setCamera();

    this.startAnimation();
  }

  private addCanvasToDom() {
    const element = this.elRef.nativeElement as HTMLElement;
    this.canvasElement = element
      .querySelector(this.insertionElementSelector)
      ?.appendChild(this.renderer.domElement);
  }

  private addEverythingToScene() {
    this.scene.add(this.ambient);

    this.setRenderer();
  }

  private animateClouds() {
    this.cloudParticles.forEach((cloud) => {
      cloud.rotation.z -= this.cloudZRotationAmount;
    });
  }

  private loadCloudParticles() {
    const loader = new THREE.TextureLoader();
    loader.load(this.smokeImagePath, (texture) => {
      const cloudGeo = new THREE.PlaneBufferGeometry(
        this.cloudWidth,
        this.cloudWidth
      );
      const cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        color: this.colorPrimary4,
      });

      for (let i = 0; i < this.numberOfCloudParticles; i++) {
        const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
        cloud.position.set(
          Math.random() * 800 - 400,
          500,
          Math.random() * 500 - 500
        );

        cloud.rotation.x = this.cloudXRotationStart;
        cloud.rotation.y = this.cloudYRotationStart;
        cloud.rotation.z = this.cloudZRotationStart;
        cloud.material.opacity = this.cloudOpacity;
        this.scene.add(cloud);
        this.cloudParticles.push(cloud);
      }
    });
  }

  private setCamera() {
    this.camera.position.z = this.cameraZPositionStart;
    this.camera.rotation.x = this.cameraXRotationStart;
    this.camera.rotation.y = this.cameraYRotationStart;
    this.camera.rotation.z = this.cameraZRotationStart;
  }

  private setRenderer() {
    this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(this.scene?.fog?.color);
    this.renderer.render(this.scene, this.camera);
  }

  private startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);

      this.renderer.render(this.scene, this.camera);
      this.animateClouds();
    };
    animate();
  }
}
