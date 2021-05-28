import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
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
    private userService: UsersService,
    private socket: Socket
  ) {
    this.userService.currentUser.subscribe(x => this.currentUser = x);
  }

  logout() {
    this.userService.logout();
    this.socket.emit('logOut');
    this.socket.emit('userLogOut', this.userService.getUser().userName);
    this.router.navigate(['/login']);
    
  }

  backToMenu() {
    this.router.navigate(['/menu']).then(() => {
      window.location.reload();
    });
    this.socket.emit('userBackMenu', {
      user: this.currentUser.userName
    })
  }
}
