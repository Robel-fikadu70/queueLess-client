import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, RouterLink],
  standalone: true,
  selector: 'app-unauthorized',
  styleUrl: './unauthorized.component.scss',
  templateUrl: './unauthorized.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedComponent {}
