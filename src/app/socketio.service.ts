import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;
  constructor() {
  }
  
  emmit(topic,data){
    this.socket.emit(topic,data)
  }

  listen(eventName) {
    return new Observable((Subscriber) => {
      this.socket.on(eventName, (data) => {
        Subscriber.next(data);
      });
    });
  }

  setupSocketConnection() {
    this.socket = io("https://peaceful-harbor-45990.herokuapp.com/")
    // this.socket = io("http://localhost:3000/")
    
    // this.socket.on('connect', () => {
    //   console.log(this.socket.id); // 'G5p5...'
    //   return this.socket.id;
    // });
  }
}
