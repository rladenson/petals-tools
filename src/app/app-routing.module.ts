import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServersetComponent } from "./serverset/serverset.component";
import {IndexComponent} from "./index/index.component";
import {ToDoComponent} from "./to-do/to-do.component";
import {GroupSwitcherComponent} from "./group-switcher/group-switcher.component";
import {SoloSettingsComponent} from "./solo-settings/solo-settings.component";
import {BulkSettingsComponent} from "./bulk-settings/bulk-settings.component";
import {TemplatesComponent} from "./templates/templates.component";

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'serverset',
    component: ServersetComponent,
    children: [
      { path: 'solo', component: SoloSettingsComponent },
      { path: 'bulk', component: BulkSettingsComponent },
      { path: 'templates', component: TemplatesComponent },
      { path: '**', redirectTo: 'solo' }
    ]
  },
  { path: 'todo', component: ToDoComponent },
  { path: 'groupswitcher', component: GroupSwitcherComponent},
  //everything below here is aliases
  { path: 'server-set', redirectTo: '/serverset', pathMatch: 'full' },
  { path: 'serverset.html', redirectTo: '/serverset', pathMatch: 'full' },
  { path: 'todo.html', redirectTo: '/todo', pathMatch: 'full' },
  { path: 'to-do', redirectTo: '/todo', pathMatch: 'full' },
  { path: 'group-switcher', redirectTo: '/groupswitcher', pathMatch: 'full' },
    //wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
