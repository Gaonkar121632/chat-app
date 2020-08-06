import { Component } from '@angular/core';
import { SocketioService } from './socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  Chats: Array<object>;
  model = {
    name: ''
  }
  allUsers = []
  UserName: string;
  mySession: void;
  toUser: object;
  mdlSampleIsOpen = false
  newReqId: string;
  text: string
  modalData: ModalInfo=new ModalInfo({title:"", body:"",sessionOut:false,request:true})
  // modalData = new ModalInfo("request","some user is requesting to talk")
  constructor(private socketioService: SocketioService) { }

  ngOnInit() {
    this.Chats = [
      {
        from: "Vinayak",
        message: "hi"
      },
      {
        to: "someone",
        message: "hello"
      }
    ]
    this.socketioService.setupSocketConnection()
    this.socketioService.socket.on('connect', () => {
      console.log(this.socketioService.socket.id, "--");
      this.mySession = this.socketioService.socket.id
    });

    this.socketioService.listen("startPath").subscribe((res: string) => {
      let users = JSON.parse(res)
      this.allUsers = []
      for (var prop in users) {
        let user = {}
        user["sessionId"] = prop;
        user["name"] = users[prop]
        this.allUsers.push(user)
      }
    })
    this.socketioService.listen("request").subscribe((res: string) => {
      console.log("request came", res);
      this.newReqId = res;
      let reqestedUser = this.allUsers.find(ele => ele.sessionId == res)
      this.modalData = new ModalInfo({title:"request", body:`${reqestedUser["name"]} requesting to chat`,sessionOut:false,request:true})
     
      this.mdlSampleIsOpen = true
    })

    this.socketioService.listen("reject").subscribe((res: string) => {
      console.log("rejected");
      this.toUser["reject"] = true
    })

    this.socketioService.listen("accept").subscribe((res: string) => {
      this.toUser["accepted"] = true
      this.Chats = []
    })
    this.socketioService.listen("send-txt").subscribe((res: string) => {

      this.Chats.push({
        from: this.toUser["sessionId"],
        message: res
      })
    })

    this.socketioService.listen("quit-session").subscribe((res: string) => {
      this.modalData = new ModalInfo({title:"session End", body:`${this.toUser["name"]} left the chat`,sessionOut:true,request:false})
      console.log(res);
      this.mdlSampleIsOpen = true
      this.toUser = this.allUsers.find(ele => ele.sessionId == this.toUser["sessionId"])
      this.toUser["accepted"] = false
      // this.toUser = {}
      this.Chats = []
    })



  }

  formData() {
    console.log(this.model);
    this.UserName = this.model.name
    this.socketioService.emmit("newUser", this.UserName)
  }

  startChat(toUserId) {
    this.toUser = this.allUsers.find(ele => ele.sessionId == toUserId)
    console.log(toUserId, this.toUser);

  }
  sendRequest(toUserId) {
    this.socketioService.emmit("request", toUserId)
  }

  closeModal() {
    this.mdlSampleIsOpen = false;
    this.socketioService.emmit("reject", this.newReqId)
  }

  sendText() {
    console.log(this.text);

    this.socketioService.emmit("send-txt", {
      text: this.text,
      id: this.toUser["sessionId"]
    });
    this.Chats.push({
      to: this.mySession,
      message: this.text
    })
    this.text = '';
  }

  acceptRequest() {
    this.mdlSampleIsOpen = false;
    if (this.toUser && this.toUser["sessionId"]!=this.newReqId) {

      this.socketioService.emmit("quit-session", this.toUser["sessionId"])
    }
    this.toUser = this.allUsers.find(ele => ele.sessionId == this.newReqId)
    this.toUser["accepted"] = true
    this.socketioService.emmit("accept", this.newReqId)
    this.Chats = []
  }

  sessionEnd(){
    this.mdlSampleIsOpen=false
  }
}



class ModalInfo {
  public title;
  public body;
  public request;
  public sessionOut;

  constructor({title, body,request,sessionOut}) {
    this.title = title || ''
    this.body = body || ''
    this.request=request||false,
    this.sessionOut=sessionOut||false
  }
}