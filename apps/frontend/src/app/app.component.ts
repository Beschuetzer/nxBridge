import { Component, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    './globalCss/forms.scss',
    './globalCss/globals.scss',
    './globalCss/base.scss',
    './globalCss/variables.scss',
    './globalCss/mixins.scss',
  ],
  // encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  hello$ = this.http.get<Message>('/api/hello');
  constructor(private http: HttpClient) {}
}
