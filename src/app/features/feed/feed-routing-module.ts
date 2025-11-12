import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialFeedComponent } from './pages/social-feed/social-feed';

const routes: Routes = [
  { path: '', component: SocialFeedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedRoutingModule { }