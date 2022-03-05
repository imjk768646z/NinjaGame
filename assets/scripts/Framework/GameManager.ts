
import { _decorator, Component, Node, Prefab, instantiate, UITransform, Script, BoxCollider, BoxCollider2D } from 'cc';
import { Kunai } from '../Kunai/Kunai';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Wed Jan 26 2022 20:24:28 GMT+0800 (台北標準時間)
 * Author = Lucifer_JK
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/scripts/Framework/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */
 
@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    public player1: Node = null;

    @property(Node)
    public player2: Node = null;

    @property(Prefab)
    public kunai: Prefab = null;

    @property(Node)
    public kunaiRoot: Node = null;

    start () {
   
    }

    public createKunai(playerDirection, player) {
        const kunai_v = instantiate(this.kunai);
        kunai_v.setParent(this.kunaiRoot);
        console.log(player);
        if(player == 'player1'){
            const player_pos = this.player1.position;
            let player_dir = this.player1.getScale().x;
            if(player_dir > 0){ // 方向朝右
                kunai_v.setPosition(player_pos.x + 50, player_pos.y, 0);
                kunai_v.setScale(0.07, 0.07);
            }else{ // 方向朝左
                kunai_v.setPosition(player_pos.x - 50, player_pos.y, 0);
                kunai_v.setScale(-0.07, 0.07);
            }
        }else if(player == 'player2'){
            const player_pos = this.player2.position;
            let player_dir = this.player2.getScale().x;
            if(player_dir > 0){ // 方向朝右
                kunai_v.setPosition(player_pos.x + 50, player_pos.y, 0);
                kunai_v.setScale(0.07, 0.07);
            }else{ // 方向朝左
                kunai_v.setPosition(player_pos.x - 50, player_pos.y, 0);
                kunai_v.setScale(-0.07, 0.07);
            }
        }
        // 苦無移動的方向
        kunai_v.getComponent(Kunai).moveDirection(playerDirection);   
    }
     
    // }
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
