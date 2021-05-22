import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { UserModel } from '../models/user.model';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private socket: Socket, private userService: UsersService, private router: Router) {
    this.userService.currentUser.subscribe(x => this.currentUser = x);
   }

  currentUser: UserModel;
  userSender: any;
  userReciver: any;
  UserList: Array<any>;
  isGotInvite: boolean = false;
  ngOnInit(): void {
    this.isGotInvite = false;

    this.socket.on('userConected', (data) =>{
      //console.log(data);
      this.UserList = data;
    });

    this.socket.on('gotInvite', (data) => {
      this.userSender = data.sender;
      this.isGotInvite = true
    })

    this.socket.on('redirectSenderToGame', (data) => {
      this.socket.emit('sendDataToGame', data);
      this.router.navigate(['/game']);
    })
  }

  inviteToPlay(userName){
    this.socket.emit('inviteToPlay', {
      sender: this.userService.currUserModel.userName,
      reciver: userName
    });
  }

  redirectToGame(userSender){
    this.socket.emit('redirectReciverToGame',{
      sender: this.userService.currUserModel.userName,
      reciver: userSender
    })
    this.router.navigate(['/game']);
  }
}
