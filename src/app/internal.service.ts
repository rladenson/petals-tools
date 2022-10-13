import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { PluralKitService } from "./pluralkit.service";
import { PKGroup } from "./pk-models";

@Injectable({
  providedIn: 'root'
})
export class InternalService {

  constructor(private pluralKitService: PluralKitService) { }

  private groups = new BehaviorSubject<Array<PKGroup>>([]);
  groups$ = this.groups.asObservable();

  updateGroups(): void {
    this.pluralKitService.getGroups().then(res => {
      this.groups.next(res);
    });
  }

}
