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
      this.userSender = data.sender;//fridman
      this.isGotInvite = true
    })

    this.socket.on('redirectSenderToGame', () => {
      //console.log(data);
      //this.socket.emit('sendDataToServer', data);
      this.router.navigate(['/game']);
    })

    this.socket.on('gotDecline', (data) => {
      alert(data.message);
    })
  }

  inviteToPlay(userName){
    if(userName == this.userService.currUserModel.userName){
      alert('You cant invite yourself');
      return;
    }
    this.socket.emit('inviteToPlay', {
      sender: this.userService.currUserModel.userName,//fridman
      reciver: userName//angel
    });
  }

  redirectToGame(userSender){
    this.socket.emit('redirectReciverToGame',{
      sender: userSender,//fridamn
      reciver: this.userService.currUserModel.userName,//angell
    })
    this.router.navigate(['/game']);
  }

  cancelInvite(userSender) {
    this.isGotInvite = false;
    this.socket.emit('cancelInvite', {
      sender: userSender
    })
  }
}
