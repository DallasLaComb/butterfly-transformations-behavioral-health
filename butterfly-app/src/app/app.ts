import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly bookingUrl = 'https://www.google.com';
  readonly contactUrl = 'https://www.google.com';
  readonly currentYear = new Date().getFullYear();
  mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  scrollTo(id: string): void {
    this.mobileMenuOpen.set(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }
}
