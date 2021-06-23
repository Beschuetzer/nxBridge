import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { appReducer } from '../store/reducers/app.reducer';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AppRoutingModule } from './app.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { LandingModule } from '@nx-bridge/landing';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot(appReducer),
    StoreDevtoolsModule.instrument({ logOnly: environment.production }),
    StoreRouterConnectingModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    LandingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
