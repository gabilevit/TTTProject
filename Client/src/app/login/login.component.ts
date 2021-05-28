import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { UsersService } from '../users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { UserModel } from '../models/user.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  curUser: UserModel;
  constructor(
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket) { }

  ngOnInit(): void {

  }

  log(x) { console.log(x); }

  submit(userName, password) {
    this.userService.login(userName, password)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['/menu']);
          this.userService.userConected(data);
          this.emitUser(this.userService.getUser().userName);
        },
        error => {
          alert('Username or password are incorrect');
          console.log('error');
        }
      );
  }

  emitUser(userName) {
    this.socket.emit('emitCurrentUser', userName);
  }
}
