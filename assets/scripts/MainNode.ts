
import { _decorator, Component, Node, systemEvent, SystemEvent, EventMouse, EventKeyboard, KeyCode, Vec2, RigidBody2D, dragonBones, Prefab, Asset, Sprite, SpriteFrame, UITransform, BoxCollider2D, ITriggerEvent, Contact2DType, Label, Button, Camera } from 'cc';
import { AudioManager } from './Framework/AudioManager';
import { GameManager } from './Framework/GameManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MainNode
 * DateTime = Thu Dec 16 2021 09:38:14 GMT+0800 (台北標準時間)
 * Author = Lucifer_JK
 * FileBasename = MainNode.ts
 * FileBasenameNoExtension = MainNode
 * URL = db://assets/scripts/MainNode.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

@ccclass('MainNode')
export class MainNode extends Component {
    
    @property(WebSocket)
    public ws: WebSocket = null;
    
    @property(Node)
    public player1: Node = null;
    
    @property(Node)
    public player2: Node = null;

    @property(Prefab)
    public kunai: Prefab = null;

    @property(GameManager)
    public gameManager: GameManager = null;

    @property(AudioManager)
    public audioEffect: AudioManager = null;

    public player1Direction = 'right'; //玩家1當前的方向
    public player2Direction = 'left'; //玩家2當前的方向
    public player1Move = false; //玩家1移動狀態
    public player2Move = false; //玩家2移動狀態
    public player1Attack = false;  //玩家1攻擊狀態
    public player2Attack = false;  //玩家2攻擊狀態
    public player1Air = false; //玩家1處於空中狀態
    public player2Air = false; //玩家2處於空中狀態
    public player1Jump = false; //玩家1跳躍狀態
    public player2Jump = false; //玩家2跳躍狀態
    public player1DeltaCount = 0; //玩家1每幀觸發的次數
    public player2DeltaCount = 0; //玩家2每幀觸發的次數
    public playerNumber = 0; //玩家數量

    private _switch = false; //進入遊戲的開關
    private _player1InjuriedCount = 0; //玩家1受到攻擊的次數
    private _player2InjuriedCount = 0; //玩家2受到攻擊的次數
    
    // 宣告物件屬性時不要指定型別為Object，TypeScript和JavaScript定義Object的方式不同。
    // meta(狀態) id(玩家位置) direction(面相方向) playerNum(房間人數) player1/2(玩家1/2遊戲狀態)
    private obj = {'meta':'join', 'id':null, 'direction':null,
    'playerNum': null, 'player1': null, 'player2': null, 'p1Period': false, 'p2Period': false};
    // private obj = {'meta':'join', 'room': null, 'id':null, 'weapon':null, 'direction':null, 
    // 'playerNum': null, 'playerSta': null, 'player1': null, 'player2': null, 'p1Period': false, 'p2Period': false};
    
    onLoad() {
        // this.ws = new WebSocket('ws://localhost:5566');
        var HOST = location.origin.replace(/^http/, 'ws');
        this.ws = new WebSocket(HOST);
    }

    start () {
        this.ws.onopen = () => {console.log('Client is coming to website');}
        // 鏡頭切換至開始畫面
        this.node.getChildByName('Camera').getComponent(Camera).orthoHeight = 286;
        this.node.getChildByName('Camera').setPosition(0,650,1000);
        // 隱藏讀取狀態和提示訊息
        this.node.getChildByName('loading').active = false;
        this.node.getChildByName('tips').active = false;
        // systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        // systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.node.getChildByName('warning').active = false;
        this.node.getChildByName('JoinRoom').getComponent(Button).interactable = false;
        setTimeout(() => {
            this.node.getChildByName('JoinRoom').getComponent(Button).interactable = true;
        },2000)
    }
    
    onJoinRoomBtnClick () {
        if(this.wsDisconnect() == false) {
            this.node.getChildByName('warning').active = true;
            this.node.getChildByName('warning').getComponent(Label).string = '與伺服器斷線\n請重新整理頁面';
        }
        // 向後端傳送JSON物件
        this.ws.send(JSON.stringify(this.obj));
        // 接收後端傳回的訊息
        this.ws.onmessage = (msg) => {
            let { meta,id,direction,playerNum,player1,player2,p1Period,p2Period } = JSON.parse(msg.data);
            // 加入房間的流程開始
            // 只有一個玩家時才會觸發條件，一旦有兩個玩家後此條件不再觸發
            if(meta == 'join' && playerNum == 1){
                console.log('目前只有' + playerNum + '個玩家');
                if(player1 == null || player2 == null){
                    this.onWait(); //等待玩家定時器
                }
                this.cleanTips();  //清空提示訊息
            }
            if(meta == 'join' && playerNum == 2){
                console.log('目前有' + playerNum + '個玩家');
                this.onRestart(); //重置玩家血條
                // console.log('p1Period: ' + p1Period);
                // console.log('p2Period: ' + p2Period);
                // console.log('點擊開始配對的玩家:' + id);
                this.onWait(); //等待玩家定時器
                //向後端確認目前的玩家人數
                this.checkPlayerNumber(id); 
                // 再玩一局時會停留在check狀態，強制改為join狀態讓玩家重新跑一次流程
                this.obj.meta = 'join';
                // this.cleanTips(); //清空提示訊息
            }
            //後端傳回的房間人數有兩個玩家即可進入遊戲
            if(meta == 'check' && playerNum == 2) {
                this.onRestart(); //重置玩家血條
                // 兩個玩家同時處於非遊戲狀態
                if(player1 == false && player2 == false){
                    console.log('p1Period: ' + p1Period);
                    console.log('p2Period: ' + p2Period);
                    // 兩個玩家同時處於配對狀態
                    if(p1Period && p2Period){
                    // console.log('已確認有' + playerNum + '個玩家，可進入遊戲畫面');
                    setTimeout(() => {
                        this.node.getChildByName('tips').active = true;
                        this.node.getChildByName('tips').getComponent(Label).string = '已找到對手\n準備進入遊戲';
                    },1000);
                    this.cleanTips();
                    setTimeout(() => {
                        this.node.getChildByName('Camera').setPosition(0,0,1000);
                    },4000);
                    this._switch = true; //遊戲開始讓update監聽按鍵事件
                    // 重置玩家1、玩家2的位置
                    this.player1.setPosition(-190,-160);
                    this.player2.setPosition(190,-160);
                    // 重置玩家1、玩家2的面相方向
                    this.player1.setScale(0.06,0.06);
                    this.player2.setScale(-0.06,0.06);
                    }
                }
            }
            // 加入房間的流程結束
            if(meta == 'jump' && id == 'player1') this.player1Jump = true;
            if(meta == 'jump' && id == 'player2') this.player2Jump = true;
            if(meta == 'attack'){
                if(id == 'player1'){
                    if(this.player1Attack == false){
                        this.gameManager.createKunai(this.player1Direction, id);
                        this.playAudioEffect('swing1');
                        this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('attackAnimation');
                        setTimeout(() => {this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation')}, 300);
                        this.player1Attack = true; //發射狀態
                        setTimeout(() => this.player1Attack = false, 1000); 
                    }
                }else if(id == 'player2'){
                    if(this.player2Attack == false){
                        this.gameManager.createKunai(this.player2Direction, id);
                        this.playAudioEffect('swing1');
                        this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('attackAnimation');
                        setTimeout(() => {this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation')}, 300);
                        this.player2Attack = true; //發射狀態
                        setTimeout(() => this.player2Attack = false, 1000);
                    }
                }
            }
            if(meta == 'move' && direction == 'left'){
                if(id == 'player1'){
                    this.player1.setScale(-0.06,0.06);
                    this.player1Direction = 'left';
                    this.player1Move = true;
                }else if(id == 'player2'){
                    this.player2.setScale(-0.06,0.06);
                    this.player2Direction = 'left';
                    this.player2Move = true;
                }
            }
            if(meta == 'move' && direction == 'right'){
                if(id == 'player1'){
                    this.player1.setScale(0.06,0.06);
                    this.player1Direction = 'right';
                    this.player1Move = true;
                }else if(id == 'player2'){
                    this.player2.setScale(0.06,0.06);
                    this.player2Direction = 'right';
                    this.player2Move = true;
                }
            }
            if(meta == 'stop'){
                if(id == 'player1'){
                    this.player1Move = false;
                    this.player1DeltaCount = 0;
                    this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation');
                }else if(id == 'player2'){
                    this.player2Move = false;
                    this.player2DeltaCount = 0;
                    this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation');
                }
            }
            if(meta == 'result'){            
                this.node.getChildByName('Camera').setPosition(0,-650,1000);               
                this.node.getChildByName('result').getComponent(Label).string = 
                '左青龍被擊中次數：' + (this._player1InjuriedCount) + 
                '\n右白虎被擊中次數：' + this._player2InjuriedCount;
                this._switch = false; //遊戲結束讓update停止監聽按鍵事件
                // 再玩一局時會停留在check狀態，強制改為join狀態讓玩家重新跑一次流程
                setTimeout(() => {
                    this.obj.meta = 'join';
                },1500)
            }
            // 要查看物件訊息再開啟
            console.log(msg);
        }
    }

    wsDisconnect() { return this.ws.readyState === this.ws.OPEN }

    onWait(){
        this.node.getChildByName('JoinRoom').getComponent(Button).interactable = false;
        this.node.getChildByName('loading').active = true; // 開啟讀取動畫
        setTimeout(() => {
            this.node.getChildByName('JoinRoom').getComponent(Button).interactable = true;
            this.node.getChildByName('loading').active = false; // 關閉讀取動畫
            this.node.getChildByName('tips').active = true; 
            this.node.getChildByName('tips').getComponent(Label).string = '找不到對手\n繼續耐心配對吧！';
        },5000);
    }

    onTop() {
        this.node.getChildByName('Camera').setPosition(0,650,1000);
    }

    onRestart(){
        let p1HP = 'p1HP_';
        for(let i = 1; i <= 5; i++){
            this.node.getChildByName(p1HP + i.toString()).active = true;
        }
        this._player1InjuriedCount = 0;
        let p2HP = 'p2HP_';
        for(let i = 1; i <= 5; i++){
            this.node.getChildByName(p2HP + i.toString()).active = true;
        }
        this._player2InjuriedCount = 0;
    }

    checkPlayerNumber(id) {
        this.obj.meta = 'check';
        // this.obj.playerSta = id;
        this.ws.send(JSON.stringify(this.obj));
    }

    cleanTips(){
        setTimeout(() => {
            this.node.getChildByName('tips').active = false;
            this.node.getChildByName('tips').getComponent(Label).string = '';
        },8000);
    }

    onEnable () {
        const player1Collider = this.player1.getComponent(BoxCollider2D);
        player1Collider.on(Contact2DType.BEGIN_CONTACT, this._onPlayer1Contact, this);
        const player2Collider = this.player2.getComponent(BoxCollider2D);
        player2Collider.on(Contact2DType.BEGIN_CONTACT, this._onPlayer2Contact, this);
    }   

    onDisable () {
        const player1Collider = this.player1.getComponent(BoxCollider2D);
        player1Collider.off(Contact2DType.BEGIN_CONTACT, this._onPlayer1Contact, this);
        const player2Collider = this.player2.getComponent(BoxCollider2D);
        player2Collider.off(Contact2DType.BEGIN_CONTACT, this._onPlayer2Contact, this);
    }

    private _onPlayer1Contact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D){
        // 落地後才能再次跳躍
        if(selfCollider.group == 4 && otherCollider.group == 16){
            this.player1Air = false;
        }
        // 子彈擊中角色
        if(selfCollider.group == 4 && otherCollider.group == 2){
            console.log('玩家1扣血');
            this.playAudioEffect('be_Attacked');   
            let p1HP = 'p1HP_';
            let point = this._player1InjuriedCount + 1;
            if(this._player1InjuriedCount < 4) {
                this.node.getChildByName(p1HP + point.toString()).active = false;
                this._player1InjuriedCount ++;
                point ++;   
            }else{
                this.node.getChildByName(p1HP + point.toString()).active = false;
                this._player1InjuriedCount ++;
                this.obj.meta = 'result'; //結算分數
                this.ws.send(JSON.stringify(this.obj));
                // 遊戲結束時停止所有角色移動，延遲時間要比後端result狀態刪除屬性時還短
                setTimeout(() => {
                    this.obj.meta = 'stop';
                    this.ws.send(JSON.stringify(this.obj));
                },250)
            }    
        }    
    }

    private _onPlayer2Contact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D) {
        // 落地後才能再次跳躍
        if(selfCollider.group == 8 && otherCollider.group == 16){
            this.player2Air = false;
        }
        // 子彈擊中角色
        if(selfCollider.group == 8 && otherCollider.group == 2){
            console.log('玩家2扣血');
            this.playAudioEffect('be_Attacked');
            let p2HP = 'p2HP_';
            let point = this._player2InjuriedCount + 1;
            if(this._player2InjuriedCount < 4) {
                this.node.getChildByName(p2HP + point.toString()).active = false;
                this._player2InjuriedCount ++;
                point ++;   
            }else{
                this.node.getChildByName(p2HP + point.toString()).active = false;
                this._player2InjuriedCount ++;
                this.obj.meta = 'result' //結算分數
                this.ws.send(JSON.stringify(this.obj));
                // 遊戲結束時停止所有角色移動，延遲時間要比後端result狀態刪除屬性時還短
                setTimeout(() => {
                    this.obj.meta = 'stop';
                    this.ws.send(JSON.stringify(this.obj));
                },250)
            }
        }
    }

    player1OnJump(){
        let pp1 = this.player1.getComponent(RigidBody2D);
        let p1LiVe = pp1.linearVelocity;
        if(this.player1Air == true){
            // console.log('玩家1目前跳躍在空中');
        }else if(this.player1Air == false){
            p1LiVe.y = 10;
            pp1.linearVelocity = p1LiVe;
            this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('jumpAnimation');
            this.playAudioEffect('walking_on_snow');
            setTimeout(() => this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation'), 300);
            this.player1Air = true;
        }
        this.player1Jump = false;
    }

    player2OnJump(){
        let pp2 = this.player2.getComponent(RigidBody2D);
        let p2LiVe = pp2.linearVelocity;
        if(this.player2Air == true){
            // console.log('玩家2目前跳躍在空中');
        }else if(this.player2Air == false){
            p2LiVe.y = 10;
            pp2.linearVelocity = p2LiVe;
            this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('jumpAnimation');
            this.playAudioEffect('walking_on_snow');
            setTimeout(() => this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('stopAnimation'), 300);
            this.player2Air = true;
        }
        this.player2Jump = false;
    }

    player1MoveLeft() {
        let pp1 = this.player1.getComponent(RigidBody2D);
        let p1LiVe = pp1.linearVelocity;
        p1LiVe.x = -3;
        pp1.linearVelocity = p1LiVe;
    }

    player1MoveRight() {
        let pp1 = this.player1.getComponent(RigidBody2D);
        let p1LiVe = pp1.linearVelocity;
        p1LiVe.x = 3;
        pp1.linearVelocity = p1LiVe;
    }

    player2MoveLeft() {
        let pp2 = this.player2.getComponent(RigidBody2D);
        let p2LiVe = pp2.linearVelocity;
        p2LiVe.x = -3;
        pp2.linearVelocity = p2LiVe;
    }

    player2MoveRight() {
        let pp2 = this.player2.getComponent(RigidBody2D);
        let p2LiVe = pp2.linearVelocity;
        p2LiVe.x = 3;
        pp2.linearVelocity = p2LiVe;
    }

    playAudioEffect(name: string){
        this.audioEffect.play(name);
    }

    onKeyUp(event: EventKeyboard){
        switch (event.keyCode) {
            case 37: //left
                this.obj.meta = 'stop';
                this.ws.send(JSON.stringify(this.obj));
                break;
            case 39: //right
                this.obj.meta = 'stop';
                this.ws.send(JSON.stringify(this.obj));
                break;
            case 32: //空白鍵
                this.obj.meta = 'jump';
                this.ws.send(JSON.stringify(this.obj));
                break;
            case 88: //X
                this.obj.meta = 'attack';
                this.ws.send(JSON.stringify(this.obj));
                break;
            default:
                console.log("No such key exists!");
                break;
        }
    }
    
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case 37: //left
                this.obj.meta = 'move';
                this.obj.direction = 'left';
                this.ws.send(JSON.stringify(this.obj));
                break;
            case 39: //right
                this.obj.meta = 'move';
                this.obj.direction = 'right';
                this.ws.send(JSON.stringify(this.obj));
                break;
            default:
                console.log("No such key exists!");
                break;
        }
    }

    getPlayer1Time(){
        let deltaCount = 1;
        this.player1DeltaCount = this.player1DeltaCount + deltaCount;
        // 走路動畫持續一秒，每收集到60幀播放一次
        if(this.player1DeltaCount%60 == 0){
            this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('walkAnimation');
            this.playAudioEffect('walking_on_the_earth');
        }
        // 第一幀的時候播放動畫
        if(this.player1DeltaCount == 1){
            this.player1.getComponent(dragonBones.ArmatureDisplay).playAnimation('walkAnimation');
            this.playAudioEffect('walking_on_the_earth');
        }
    }

    getPlayer2Time(){
        let deltaCount = 1;
        this.player2DeltaCount = this.player2DeltaCount + deltaCount;
        // 走路動畫持續一秒，每收集到60幀播放一次
        if(this.player2DeltaCount%60 == 0){
            this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('walkAnimation');
            this.playAudioEffect('walking_on_the_earth');
        }
        // 第一幀的時候播放動畫
        if(this.player2DeltaCount == 1){
            this.player2.getComponent(dragonBones.ArmatureDisplay).playAnimation('walkAnimation');
            this.playAudioEffect('walking_on_the_earth');
        }
    }

    update (deltaTime: number) {
        if(this.player1Jump){
            this.player1OnJump();
        }
        if(this.player2Jump){
            this.player2OnJump();
        }
        if(this.player1Move){
            if(this.player1Direction == 'left'){
                this.player1MoveLeft();
                this.getPlayer1Time();
            }else if(this.player1Direction == 'right'){
                this.player1MoveRight();
                this.getPlayer1Time();
            }
        }
        if(this.player2Move){
            if(this.player2Direction == 'left'){
                this.player2MoveLeft();
                this.getPlayer2Time();
            }else if(this.player2Direction == 'right'){
                this.player2MoveRight();
                this.getPlayer2Time();
            }
        }
        if(this._switch){
            systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
            systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }else{
            systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
            systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }
    
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
