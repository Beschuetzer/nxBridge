import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { appReducer } from '@nx-bridge/store';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { GamesListComponent } from './games-list/games-list.component';
import { ReplayViewerModule } from '@nx-bridge/replay-viewer';

@NgModule({
  declarations: [AppComponent, GamesListComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot(appReducer),
    StoreDevtoolsModule.instrument({ logOnly: environment.production }),
    StoreRouterConnectingModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ReplayViewerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
