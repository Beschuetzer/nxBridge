import { Component, ElementRef, OnInit } from '@angular/core';
import * as THREE from 'three';

import * as POSTPROCESSING from "postprocessing";

@Component({
  selector: 'nx-bridge-nebula',
  templateUrl: './nebula.component.html',
  styleUrls: ['./nebula.component.scss'],
})
export class NebulaComponent implements OnInit {
  //#region Paths
  private canvasElement: HTMLCanvasElement | null | undefined = null;
  private insertionElementSelector = '#nebula';
  private smokeImagePath = 'assets/replay-viewer/smoke.png';
  private starsPath = 'assets/replay-viewer/stars.jpg';
  //#endregion

  //#region Palette Colors
  private colorPrimary1 = 0x28537b;
  private colorPrimary1Fogged = 0x28537b55;
  private colorPrimary1Light = 0x999999;
  private colorPrimary2 = 0x8ac6d0;
  private colorPrimary3 = 0xf4d262;
  private colorPrimary4 = 0xfbeeac;
  private colorRed = 0x7b3428;
  private colorRedLight = 0xff9494;
  private colorGreen = 0x537b28;
  private colorGreenLight = 0x89c549;
  //#endregion

  //#region Setup
  private bestVisual = {
    powerPreference: "default",
    antialias: true,
    stencil: true,
    depth: true
  };
  private bestPerformance = {
    powerPreference: "high-performance",
    antialias: false,
    stencil: false,
    depth: false
  }
  private renderer = new THREE.WebGLRenderer(this.bestPerformance);
  private loader = new THREE.TextureLoader();
  private scene = new THREE.Scene();
  private composer = new POSTPROCESSING.EffectComposer(this.renderer);
  //#endregion

  //#region Camera
  private camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  private cameraZPositionStart = 1;
  private cameraXRotationStart = 1.16;
  private cameraYRotationStart = -0.12;
  private cameraZRotationStart = 0.27;
  //#endregion

  //#region Cloud and Fog Settings
  private cloudOpacityMin = .25;
  private cloudOpacityMax = .5;
  private cloudParticlesMin = 50;
  private cloudParticlesMax = 150;
  private cloudWidthMin = 400;
  private cloudWidthMax =  600;
  private cloudZRotationAmountMin =  .00033;
  private cloudZRotationAmountMax =  .0009;
  private fogDensityMin =  0.0005;
  private fogDensityMax =  0.001;

  private cloudXRotationStart = 1.16;
  private cloudYRotationStart = -0.12;
  private cloudZRotationStart = Math.random() * 2 * Math.PI;
  //#endregion

  //#region Post Processing
  private blendFunctionOptions = {
    skip: POSTPROCESSING.BlendFunction.SKIP,
    add: POSTPROCESSING.BlendFunction.ADD,
    alpha: POSTPROCESSING.BlendFunction.ALPHA,
    average: POSTPROCESSING.BlendFunction.AVERAGE,
    burn: POSTPROCESSING.BlendFunction.COLOR_BURN,
    dodge: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    darken: POSTPROCESSING.BlendFunction.DARKEN,
    difference: POSTPROCESSING.BlendFunction.DIFFERENCE,
    exclusion: POSTPROCESSING.BlendFunction.EXCLUSION,
    lighten: POSTPROCESSING.BlendFunction.LIGHTEN,
    multiply: POSTPROCESSING.BlendFunction.MULTIPLY,
    divide: POSTPROCESSING.BlendFunction.DIVIDE,
    negation: POSTPROCESSING.BlendFunction.NEGATION,
    normal: POSTPROCESSING.BlendFunction.NORMAL,
    overlay: POSTPROCESSING.BlendFunction.OVERLAY,
    reflect: POSTPROCESSING.BlendFunction.REFLECT, //use
    screen: POSTPROCESSING.BlendFunction.SCREEN,
    soft_light: POSTPROCESSING.BlendFunction.SOFT_LIGHT,
    subtract: POSTPROCESSING.BlendFunction.SUBTRACT,
  }
  private blendFunctionsToUse = [
    this.blendFunctionOptions.alpha,
    this.blendFunctionOptions.difference,
    this.blendFunctionOptions.overlay,
    this.blendFunctionOptions.overlay,
    this.blendFunctionOptions.overlay,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.reflect,
    this.blendFunctionOptions.screen,
    this.blendFunctionOptions.screen,
    this.blendFunctionOptions.screen,
    this.blendFunctionOptions.soft_light,
    this.blendFunctionOptions.soft_light,
    this.blendFunctionOptions.soft_light,
    this.blendFunctionOptions.soft_light,
    this.blendFunctionOptions.soft_light,
  ];
  private luminanceThreshold = 0.33;
  private luminanceSmoothing = 0.33;
  private bloomEffectBlendModeOpacityValue = .7; //.7
  private textureEffectBlendModeOpacityValue = .2; //.2
  private optionToUse = Math.floor(Math.random() * this.blendFunctionsToUse.length);
  private blendFunction = this.blendFunctionsToUse[this.optionToUse]
  
  //#endregion

  //#region Colors
  private fogColor = 0x03544e //0x03544e;
  private ambientLightColor = this.colorPrimary1; // 0x555555;
  private directionalLightColor = this.colorPrimary2 //0xff8c19;
  private orangeLightColor = this.colorRedLight//0xcc6600;
  private redLightColor = this.colorRed //0xd8547e;
  private blueLightColor = this.colorPrimary2 //0x3677ac;
  //#endregion

  //#region Light Settings
  private orangeLightIntensity = 60; // 60
  private orangeLightDistance = 450; // 450
  private orangeLightDecay = 1.7; // 1.7
  private redLightIntensity = 60; // 60
  private redLightDistance = 450; // 450
  private redLightDecay = 1.7; // 1.7
  private blueLightIntensity = 60; // 60
  private blueLightDistance = 450; // 450
  private blueLightDecay = 1.7; // 1.7

  private orangeLightXPosition = 200; //200
  private orangeLightYPosition = 300; //300
  private orangeLightZPosition = 100; //100
  private redLightXPosition = 100; //100
  private redLightYPosition = 300; //300
  private redLightZPosition = 100; //100
  private blueLightXPosition = 300; //300
  private blueLightYPosition = 300; //300
  private blueLightZPosition = 200; //200
  //#endregion

  //#region Light Creation
  private ambient = new THREE.AmbientLight(this.ambientLightColor);
  private directionalLight = new THREE.DirectionalLight(
    this.directionalLightColor
  );
  private orangeLight = new THREE.PointLight(
    this.orangeLightColor,
    this.orangeLightIntensity,
    this.orangeLightDistance,
    this.orangeLightDecay
  );
  private redLight = new THREE.PointLight(
    this.redLightColor,
    this.redLightIntensity,
    this.redLightDistance,
    this.redLightDecay
  );
  private blueLight = new THREE.PointLight(
    this.blueLightColor,
    this.blueLightIntensity,
    this.blueLightDistance,
    this.blueLightDecay
  );

  //#endregion

  //#region Cloud and Fog Value Creation
  private cloudZRotationAmount = this.cloudZRotationAmountMin + (Math.random() * (this.cloudZRotationAmountMax - this.cloudZRotationAmountMin));
  private fogDensity = this.fogDensityMin + (Math.random() * (this.fogDensityMax - this.fogDensityMin));
  private cloudOpacity = this.cloudOpacityMin + (Math.random() * (this.cloudOpacityMax - this.cloudOpacityMin));
  private cloudWidth = this.cloudWidthMin + (Math.random() * (this.cloudWidthMax - this.cloudWidthMin));
  private cloudHeight = this.cloudWidth;
  private numberOfCloudParticles =  this.cloudParticlesMin + (Math.random() * (this.cloudParticlesMax - this.cloudParticlesMin));
  private cloudParticles: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshLambertMaterial
  >[] = [];
  //#endregion


  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));
    this.addCanvasToDom();
    this.addEverythingToScene();
    this.setCamera();
    this.setLights();
    this.setRenderer();
    this.loadCloudParticles();
    this.loadStarsAndThenStart();
  }

  private addCanvasToDom() {
    const element = this.elRef.nativeElement as HTMLElement;
    this.canvasElement = element
      .querySelector(this.insertionElementSelector)
      ?.appendChild(this.renderer.domElement);
  }

  private addEverythingToScene() {
    this.scene.add(this.ambient);
    this.scene.add(this.directionalLight);
    this.scene.add(this.orangeLight);
    this.scene.add(this.redLight);
    this.scene.add(this.blueLight);
  }

  private animateClouds() {
    this.cloudParticles.forEach((cloud) => {
      cloud.rotation.z -= this.cloudZRotationAmount;
    });
  }

  private loadCloudParticles() {
    this.loader.load(this.smokeImagePath, (texture) => {
      const cloudGeo = new THREE.PlaneBufferGeometry(
        this.cloudWidth,
        this.cloudHeight
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

  private loadStarsAndThenStart() {
    this.loader.load(this.starsPath, (texture) => {

      const textureEffect = new POSTPROCESSING.TextureEffect({
        blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
        texture: texture
      });
      textureEffect.blendMode.opacity.value = this.textureEffectBlendModeOpacityValue;

      const bloomEffect = new POSTPROCESSING.BloomEffect({
            blendFunction: this.blendFunction,
            kernelSize: POSTPROCESSING.KernelSize.SMALL,
            useLuminanceFilter: true,
            luminanceThreshold: this.luminanceThreshold,
            luminanceSmoothing: this.luminanceSmoothing,
          });
      bloomEffect.blendMode.opacity.value = this.bloomEffectBlendModeOpacityValue;

      const effectPass = new POSTPROCESSING.EffectPass(
        this.camera,
        bloomEffect,
        textureEffect
      );
      effectPass.renderToScreen = true;
      
      this.composer.addPass(new POSTPROCESSING.RenderPass(this.scene, this.camera));
      this.composer.addPass(effectPass);
      
      this.startAnimation();
    });
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    return null;
  }

  private setCamera() {
    this.camera.position.z = this.cameraZPositionStart;
    this.camera.rotation.x = this.cameraXRotationStart;
    this.camera.rotation.y = this.cameraYRotationStart;
    this.camera.rotation.z = this.cameraZRotationStart;
  }

  private setLights() {
    this.directionalLight.position.set(0, 0, 1);
    this.orangeLight.position.set(
      this.orangeLightXPosition,
      this.orangeLightYPosition,
      this.orangeLightZPosition
    );
    this.redLight.position.set(
      this.redLightXPosition,
      this.redLightYPosition,
      this.redLightZPosition
    );
    this.blueLight.position.set(
      this.blueLightXPosition,
      this.blueLightYPosition,
      this.blueLightZPosition
    );
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

      this.animateClouds();
      this.composer.render(.1);
      // this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
