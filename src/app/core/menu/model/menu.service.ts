import {DashboardMenuItem} from "../../../model/dashboard-menu-item";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    readonly menuItems: DashboardMenuItem[] = [
        {
            label: 'Start',
            route: 'home',
        },
    ];
}

