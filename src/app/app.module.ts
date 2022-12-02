import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from './app.component';
import { ServersetComponent } from './serverset/serverset.component';
import { SoloSettingsComponent } from './solo-settings/solo-settings.component';
import { BulkSettingsComponent } from './bulk-settings/bulk-settings.component';
import { TemplatesComponent } from './templates/templates.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToDoComponent } from './to-do/to-do.component';
import { IndexComponent } from './index/index.component';
import { MatExpansionModule } from "@angular/material/expansion";
import { GroupSwitcherComponent } from './group-switcher/group-switcher.component';
import { SiteMapComponent } from './site-map/site-map.component';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SettingsComponent } from './settings/settings.component';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { PrettyGroupsComponent } from './pretty-groups/pretty-groups.component';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
  declarations: [
    AppComponent,
    ServersetComponent,
    SoloSettingsComponent,
    BulkSettingsComponent,
    TemplatesComponent,
    ToDoComponent,
    IndexComponent,
    GroupSwitcherComponent,
    SiteMapComponent,
    SettingsComponent,
    PrettyGroupsComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSnackBarModule,
        FormsModule,
        MatExpansionModule,
        MatSidenavModule,
        MatIconModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatTooltipModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        DragDropModule,
        MatButtonToggleModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
