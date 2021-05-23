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
  you: string;
  other: string;
  yourRole: string;
  otherRole: string;
  message: string;
  turn: string;
  isGameWon: boolean;
  isGameTie: boolean;
  clickedBtn: any;

  ngOnInit(): void {

    var currUser = this.userService.currUserModel.userName;
    for (let i = 0; i < this.btns.length; i++) {
      const btn = this.btns[i];
      btn.addEventListener('click', () => {
        this.clickedBtn = btn;
        if (btn.innerHTML !== '-') {
          alert('Cant use a used slot!');
          return;
        }
        console.log(this.turn);

        this.isGameWon = this.checkIsGameWon();
        if (this.isGameWon) {
          alert(`Player won!`);
        }
        this.isGameTie = this.checkIfGameTie();
        if (this.isGameTie) {
          alert(`GAME OVER! let's start again...`);
        }

        this.changeTurn();

        this.socket.emit('changeTurn', {         
          turn: this.turn,
          user: currUser
        });

        this.socket.on('updateMove', () => {
          btn.innerHTML = this.turn;
          //this.turn = data.turn;
        })
      });
    }

    this.socket.emit('startGame', {
      user: currUser
    });
    // this.socket.on('sendDataToGame', (data) => {
    //   console.log(data);
    // })

    this.socket.on('getRoles', (data) => {
      console.log('line 49');
      this.you = data.you;
      this.other = data.other;
      this.yourRole = data.yourRole;
      this.otherRole = data.otherRole;
      this.turn = data.turn;
      if(this.yourRole == 'X'){
        this.message = `${this.you} starts!`
      } else{
        this.message = `${this.other} starts!`
      }
      // if(currUser == data.sender){
      //   this.myTurn == this.yourRole;
      // } else{
      //   this.myTurn == this.otherRole;
      // }
    });
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


