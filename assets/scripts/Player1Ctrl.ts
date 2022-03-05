
import { _decorator, Component, Node, systemEvent, SystemEvent, EventKeyboard, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;
import { MainNode } from './MainNode';
/**
 * Predefined variables
 * Name = Player1Ctrl
 * DateTime = Fri Dec 31 2021 13:30:49 GMT+0800 (台北標準時間)
 * Author = Lucifer_JK
 * FileBasename = Player1Ctrl.ts
 * FileBasenameNoExtension = Player1Ctrl
 * URL = db://assets/scripts/Player1Ctrl.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */
 
@ccclass('Player1Ctrl')
export class Player1Ctrl extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    onLoad () {
        
        // systemEvent.on(SystemEvent.EventType.KEY_UP,this.onKeyUp, this);
    }
   
    start () {
        // [3]
        // let player1 = this.node.getComponent(RigidBody2D);
        // // console.log(player1);
        
        // // console.log(player1.linearVelocity);
        // let p1 = player1.linearVelocity;
        // p1.y = 200;
        
        
        
    }

    private obj = {'meta':'join','room':'First Room','id':null};
    private mn = new MainNode();
    onKeyUp(event: EventKeyboard) {
        if(event.keyCode === 38){
            // console.log('↑');
            // 沒有透過websocket移動物件的方式
            // let player1 = this.node.getComponent(RigidBody2D);
            // let p1 = player1.linearVelocity;
            // p1.y = 10;
            // player1.linearVelocity = p1;
            // 沒有透過websocket移動物件的方式
            this.mn.ws.send(JSON.stringify(this.obj));
        }
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/en/scripting/life-cycle-callbacks.html
 */
