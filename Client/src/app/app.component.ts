import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Client';
  currentUser: UserModel;

  constructor(
    private router: Router,
    private userService: UsersService
  ) {
    this.userService.currentUser.subscribe(x => this.currentUser = x);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
