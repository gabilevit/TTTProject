import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { UsersService } from '../users.service';
import { UserModel } from '../models/user.model';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  num = 0;
  constructor(
    private userService: UsersService,
    private router: Router) { }

  ngOnInit(): void {
  }

  log(x) { console.log(x); }

  createUser(userName, password) {
    if(userName == "" || password == ""){
      alert('Username and password is required');
      return;
    }
    var newUser = new UserModel();
    newUser.id = this.num++;
    newUser.userName = userName;
    newUser.password = password;
    this.userService.addNewUser(newUser)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['/login']);
        },
        error => {
          console.log('error');
        }
      );
    console.log(`after id user: ${newUser.id}`);
  }

}