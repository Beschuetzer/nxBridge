import { Injectable, OnInit, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReplayViewerGameService implements OnInit{

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private renderer: Renderer2) {}


  ngOnInit() {
    
  }
}