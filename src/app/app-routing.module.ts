import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServersetComponent } from "./serverset/serverset.component";

const routes: Routes = [
  { path: 'serverset', component: ServersetComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
