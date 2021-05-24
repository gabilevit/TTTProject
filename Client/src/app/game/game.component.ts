import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private socket: Socket, private userService: UsersService) { }

  btns = document.getElementsByClassName('btn');
  myRole: string;
  message: string;
  turn: string;
  messageText: string;
  messageArr: Array<{ user: string, message: string }> = [];
  isGameWon: boolean;
  isGameTie: boolean;
  askRematch: boolean = false;
  gotRematch: boolean = false;
  currUser = this.userService.currUserModel.userName;
  otherUser: string;
  userRematch: string;

  ngOnInit(): void {
    //var currUser = this.userService.currUserModel.userName;
    // for (let i = 0; i < this.btns.length; i++) {
    //   const btn = this.btns[i];
    //   btn.addEventListener('click', () => {
    //     console.log(this.myRole);
    //     if(this.turn == this.myRole){
    //       if(this.isXTurn){
    //         this.socket.emit('emitMove', {
    //           user: currUser,
    //           btnEmit: btn.innerHTML,
    //           sighRole: this.myRole
    //         })           
    //       }  
    //     } else {
    //       alert('not ytour turn');
    //     }             
    //     //btn.innerHTML = this.turn;       
    //   });
    // }

    this.socket.emit('startGame', {
      user: this.currUser
    });

    this.socket.on('getRoles', (data) => {
      this.myRole = data.myRole;
      this.turn = data.turn;
      this.otherUser = data.otherUser;
    });

    this.socket.on('newMsg', (data) => {
      this.messageArr.push(data);
      console.log(this.messageArr);
    })

    this.socket.on('updateMove', (data) => {
      this.apllyMove(data.indexBtn, data.sighRole);
    })

    this.socket.on('gotRematch', (data) => {
      this.userRematch = data.user;
      this.gotRematch = true;
    })

    this.socket.on('restartGame', () => {
      this.askRematch = false;
      this.gotRematch = false;
      this.newGame();
    })
  }

  sendPickSquare(index) {
    if (this.turn == this.myRole) {
      this.socket.emit('emitMove', {
        user: this.currUser,
        indexBtn: index,
        sighRole: this.myRole
      })
    } else {
      alert('not your turn');
    }
  }

  apllyMove(index, sigh) {
    if (this.btns[index].innerHTML !== '-') {
      alert('Cant use a used slot!');
      return;
    }
    this.btns[index].innerHTML = sigh;

    this.isGameWon = this.checkIsGameWon();
    if (this.isGameWon) {
      this.checkWhoWon();
      this.askRematch = true;
      return;
    }
    this.isGameTie = this.checkIfGameTie();
    if (this.isGameTie) {
      alert(`GAME OVER! its a tie!`);
      this.askRematch = true;
      return;
    }
    this.changeTurn();
  }

  changeTurn() {
    switch (this.turn) {
      case 'X':
        this.turn = 'O';
        break;
      case 'O':
        this.turn = 'X';
        break;
    }
  }

  checkIsGameWon() {
    if (
      this.getIsLineMatches(0, 1, 2) || this.getIsLineMatches(3, 4, 5) || this.getIsLineMatches(6, 7, 8) ||
      this.getIsLineMatches(0, 3, 6) || this.getIsLineMatches(1, 4, 7) || this.getIsLineMatches(2, 5, 8) ||
      this.getIsLineMatches(0, 4, 8) || this.getIsLineMatches(2, 4, 6)
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIfGameTie(): boolean {
    for (let i = 0; i < this.btns.length; i++) {
      const btn = this.btns[i];
      if (btn.innerHTML === '-') {
        return false;
      }
    }
    return true;
  }

  getIsLineMatches(l1, l2, l3) {
    if (this.btns[l1].innerHTML === '-' || this.btns[l2].innerHTML === '-' || this.btns[l3].innerHTML === '-') return false;
    return this.btns[l1].innerHTML === this.btns[l2].innerHTML && this.btns[l2].innerHTML === this.btns[l3].innerHTML;
  }

  sendMsg() {
    this.socket.emit('message', {
      user: this.currUser,
      message: this.messageText
    })
  }

  rematch() {
    this.askRematch = false;
    this.socket.emit('requestRematch', {
      user: this.currUser
    })
  }

  acceptRematch() {
    this.socket.emit('emitRematch', {
      user: this.currUser
    });
  }

  newGame() {
    for (let i = 0; i < this.btns.length; i++) {
      const btn = this.btns[i];
      btn.innerHTML = '-';
    }
    this.turn = 'X';
  }

  checkWhoWon() {
    if (this.turn == this.myRole) {
      alert(`${this.currUser} Won!`)     
    } else {
      alert(`${this.otherUser} Won!`)      
    }
  }


}




