
import { _decorator, Component, Node, UITransform, BoxCollider2D, Contact2DType, ITriggerEvent, Canvas } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Kunai
 * DateTime = Wed Jan 26 2022 16:38:12 GMT+0800 (台北標準時間)
 * Author = Lucifer_JK
 * FileBasename = Kunai.ts
 * FileBasenameNoExtension = Kunai
 * URL = db://assets/scripts/Kunai/Kunai.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

const OUTRANGE = 350;
 
@ccclass('Kunai')
export class Kunai extends Component {

    @property
    public kunaiSpeed = 20;

    private _direction = ''; //苦無移動的方向
    private _distance = 0; //苦無移動的距離
    private _destoryKunai = false; //銷毀苦無的條件

    start () {

    }

    onEnable () {
        const kunaiCollider = this.node.getComponent(BoxCollider2D);
        kunaiCollider.on(Contact2DType.BEGIN_CONTACT, this._onKunaiContact, this);
    }   

    onDisable () {
        const kunaiCollider = this.node.getComponent(BoxCollider2D);
        kunaiCollider.off(Contact2DType.BEGIN_CONTACT, this._onKunaiContact, this);
    }

    private _onKunaiContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D){
        // 玩家1和苦無發生撞擊 
        if(selfCollider.group == 2 && otherCollider.group == 4) {
            this._destoryKunai = true;
        }
        // 玩家2和苦無發生撞擊
        if(selfCollider.group == 2 && otherCollider.group == 8) {
            this._destoryKunai = true;
        }
        // 苦無和地面發生撞擊
        if(selfCollider.group == 2 && otherCollider.group == 16) {
            this._destoryKunai = true;
        }
        // 苦無和牆面發生撞擊
        if(selfCollider.group == 2 && otherCollider.group == 32) {
            this._destoryKunai = true;
        } 
    }
    
    public moveDirection(currDir) {
        console.log('角色的方向' + currDir);
        this._direction = currDir;
    }

    update (deltaTime: number) {
        const pos = this.node.position;
        let moveLength = 0;
        if(this.node.isValid){
            if(this._direction == 'left'){
                moveLength = pos.x - this.kunaiSpeed;
                this._distance += this.kunaiSpeed;
                this.node.setPosition(moveLength, pos.y);
            }else if(this._direction == 'right'){
                moveLength = pos.x + this.kunaiSpeed;
                this._distance += this.kunaiSpeed;
                this.node.setPosition(moveLength, pos.y);
            }
        }
        // 苦無移動的距離超過一定範圍執行銷毀
        if(this._distance > OUTRANGE){
            this.node.destroy();
        }
        // 苦無發生撞擊執行銷毀
        if(this._destoryKunai){
            this.node.destroy();
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
