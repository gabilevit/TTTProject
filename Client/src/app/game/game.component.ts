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
  senderRole: string;
  reciverRole: string;
  myTurn: any;
  turn: string;
  isGameWon: boolean;
  isGameTie: boolean;

  ngOnInit(): void {

    var sender = this.userService.currUserModel.userName;
    for (let i = 0; i < this.btns.length; i++) {
      const btn = this.btns[i];
      btn.addEventListener('click', () => {
        if (btn.innerHTML !== '-') {
          alert('Cant use a used slot!');
          return;
        }
        console.log(this.turn);
        btn.innerHTML = this.turn;

        this.isGameWon = this.checkIsGameWon();
        if (this.isGameWon) {
          alert(`Player won!`);
        }
        this.isGameTie = this.checkIfGameTie();
        if (this.isGameTie) {
          alert(`GAME OVER! let's start again...`);
        }
        this.changeTurn();
        this.socket.emit('changeTurn', this.turn);
      });
    }

    this.socket.emit('startGame', {
      user: sender
    });
    // this.socket.on('sendDataToGame', (data) => {
    //   console.log(data);
    // })

    this.socket.on('getRoles', (data) => {
      console.log('line 49');
      this.senderRole = data.senderRole,
      this.reciverRole = data.reciverRole,
      this.turn = data.turn
      if(sender == data.sender){
        this.myTurn == this.senderRole;
      } else{
        this.myTurn == this.reciverRole;
      }
    })
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
}


