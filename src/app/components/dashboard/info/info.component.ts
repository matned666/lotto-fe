import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrl: '../dashboard.component.css',
    imports: [
        NgOptimizedImage
    ]
})
export class InfoComponent {
}
