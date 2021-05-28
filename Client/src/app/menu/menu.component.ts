import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { first } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private socket: Socket, private userService: UsersService, private router: Router) {}

  currentUser: UserModel;
  userBtn: boolean = false;
  cancelInv: boolean = false;
  userSender: any;
  userReciver: any;
  allUsers: Array<UserModel>;
  onlineUsers: Array<any>;
  offlineUsers: Array<any> = [];
  tmpUsers: Array<any> = [];
  isGotInvite: boolean = false;

  ngOnInit(): void {
    this.currentUser = this.userService.getUser();
    this.isGotInvite = false;

    this.socket.emit('emitCurrentUser', this.currentUser.userName);

    this.socket.on('userConected', (data) => {
      console.log(data);
      this.onlineUsers = data;
    });
    
    this.getAllUsers();

    this.socket.on('emitOfflineUsers', (offlineUsers) => {
      this.offlineUsers = offlineUsers;
    })

    this.socket.on('userWentOffline', (offlineUsers) => {
      console.log(offlineUsers);
      this.offlineUsers.push(offlineUsers);
    })

    this.socket.on('gotInvite', (data) => {
      this.userSender = data.sender;
      this.isGotInvite = true
    })

    this.socket.on('redirectSenderToGame', () => {
      this.userBtn = false;
      this.cancelInv = false;
      this.router.navigate(['/game']);
    })

    this.socket.on('gotDecline', (data) => {
      this.userBtn = false;
      this.cancelInv = false;
      alert(data.message);
    })

    this.socket.on('senderCancelInvite', () => {
      this.isGotInvite = false;
    })
  }

  getAllUsers() {
    this.userService.getAllUsers().pipe().subscribe(users => {
      this.allUsers = users;
      console.log(this.allUsers);
      this.getAllOfflineUsers();
    });
  }

  getAllOfflineUsers() {
    for (let index = 0; index < this.allUsers.length; index++) {
      this.tmpUsers.push(this.allUsers[index].userName); 
    }
    console.log(this.tmpUsers);
    this.offlineUsers = this.tmpUsers.filter(user => !this.onlineUsers.includes(user));
    this.socket.emit('updateOfflineUsers', this.offlineUsers);
  }
  inviteToPlay(userName) {
    if (userName == this.currentUser.userName) {
      alert('You cant invite yourself');
      return;
    }
    this.userBtn = true;
    this.cancelInv = true;
    this.socket.emit('inviteToPlay', {
      sender: this.currentUser.userName,
      reciver: userName
    });
  }

  cancelInvite() {
    this.cancelInv = false;
    this.userBtn = false;
    this.socket.emit('cancelInvite', {
      sender: this.currentUser.userName
    })
  }

  redirectToGame(userSender) {
    this.socket.emit('redirectReciverToGame', {
      sender: userSender,
      reciver: this.currentUser.userName,
    })
    this.router.navigate(['/game']);
  }

  declineInvite(userSender) {
    this.isGotInvite = false;
    this.socket.emit('declineInvite', {
      sender: userSender
    })
  }
}