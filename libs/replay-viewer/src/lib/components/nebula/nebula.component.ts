import { Component, ElementRef, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'nx-bridge-nebula',
  templateUrl: './nebula.component.html',
  styleUrls: ['./nebula.component.scss']
})
export class NebulaComponent implements OnInit {
  private colorPrimary1 = 0x28537b;
  private colorPrimary1Light = 0x999999;
  private colorPrimary2 = 0x8ac6d0;
  private colorPrimary3 = 0xf4d262;
  private colorPrimary4 = 0xfbeeac;
  private colorRed = 0x7b3428;
  private colorRedLight = 0xFF9494;
  private colorGreen = 0x537b28;
  private colorGreenLight = 0x89C549;
  private canvasElement: HTMLCanvasElement | null | undefined = null;
  private ambient = new THREE.AmbientLight(0x444444);
  private renderer = new THREE.WebGLRenderer();
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  constructor(
    private elRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const element = this.elRef.nativeElement as HTMLElement;
    this.canvasElement = element.querySelector('#nebula')?.appendChild(this.renderer.domElement);

    this.scene.add(this.ambient);
    this.scene.fog = new THREE.FogExp2(this.colorPrimary4, 0.001);
    this.renderer.setClearColor(this.scene.fog.color)

    const animate = () => {
      requestAnimationFrame(animate);
  
      this.renderer.render(this.scene, this.camera);
    };

    this.camera.position.z = 1;
    this.camera.rotation.x = 1.16;
    this.camera.rotation.y = -.12;
    this.camera.rotation.z = .27;


    this.renderer.render(this.scene, this.camera);
    animate();
  }

  

}
