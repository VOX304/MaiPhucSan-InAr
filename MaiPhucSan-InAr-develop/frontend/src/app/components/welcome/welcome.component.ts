import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    imports: [CommonModule, MatCardModule]
})
export class WelcomeComponent {}
