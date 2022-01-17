import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServersetComponent } from "./serverset/serverset.component";
import {IndexComponent} from "./index/index.component";
import {ToDoComponent} from "./to-do/to-do.component";
import {GroupSwitcherComponent} from "./group-switcher/group-switcher.component";

const routes: Routes = [
  { path: 'serverset', component: ServersetComponent },
  { path: '', component: IndexComponent },
  { path: 'todo', component: ToDoComponent },
  { path: 'groupswitcher', component: GroupSwitcherComponent},
  { path: 'server-set', redirectTo: '/serverset', pathMatch: 'full' },
  { path: 'serverset.html', redirectTo: '/serverset', pathMatch: 'full' },
  { path: 'todo.html', redirectTo: '/todo', pathMatch: 'full' },
  { path: 'to-do', redirectTo: '/todo', pathMatch: 'full' },
  { path: 'group-switcher', redirectTo: '/groupswitcher', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
