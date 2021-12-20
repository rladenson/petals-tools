import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServersetComponent } from "./serverset/serverset.component";

const routes: Routes = [
  { path: 'serverset', component: ServersetComponent },
  { path: '', redirectTo: '/serverset', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
