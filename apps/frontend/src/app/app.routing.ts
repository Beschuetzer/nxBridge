import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

export const rootRoute = 'replays'

const routes: Routes = [
  { path: '', redirectTo: `/`, pathMatch: 'full' },
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
