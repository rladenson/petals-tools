import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServersetComponent } from "./serverset/serverset.component";
import {IndexComponent} from "./index/index.component";
import {ToDoComponent} from "./to-do/to-do.component";

const routes: Routes = [
  { path: 'serverset', component: ServersetComponent },
  { path: '', component: IndexComponent },
  { path: 'todo', component: ToDoComponent },
  { path: 'server-set', redirectTo: '/serverset', pathMatch: 'full'},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
