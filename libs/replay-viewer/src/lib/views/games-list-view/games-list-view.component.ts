import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss']
})
export class GamesListViewComponent implements OnInit {
  public username = '';

  constructor() { }

  ngOnInit(): void {
     const user = JSON.parse(localStorage.getItem('user') as string);
     this.username = user.username;
  }

}
