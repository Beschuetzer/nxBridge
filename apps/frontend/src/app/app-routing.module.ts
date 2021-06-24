import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GamesListComponent } from './games-list/games-list.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const rootRoute = 'landing';

const routes: Routes = [
  { path: '', redirectTo: `/${rootRoute}`, pathMatch: 'full' },
  { path: 'landing', component: LandingPageComponent},
  { path: 'games', component: GamesListComponent}
  // {
  //   path: rootRoute,
  //   loadChildren: () =>
  //     import('./recipes/recipes.module').then((m) => m.RecipesModule),
  // },
  
  // {path: '**', redirectTo: `/${rootRoute}`},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
