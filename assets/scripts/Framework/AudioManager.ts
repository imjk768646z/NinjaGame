
import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = AudioManager
 * DateTime = Wed Feb 23 2022 10:26:53 GMT+0800 (台北標準時間)
 * Author = Lucifer_JK
 * FileBasename = AudioManager.ts
 * FileBasenameNoExtension = AudioManager
 * URL = db://assets/scripts/Framework/AudioManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

interface IAudioMap {
    [name: string] : AudioClip;
}

// 定義接口相當於字典
// {
//     "button": 按鈕的音效AudioClip,
//     "Be_Attacked": 被擊中的音效AudioClip
// }
 
@ccclass('AudioManager')
export class AudioManager extends Component {

    @property([AudioClip])
    public audioList: AudioClip[] = [];

    private _dict: IAudioMap = {};
    private _audioSource: AudioSource = null;

    start () {
        for (let i = 0; i < this.audioList.length; i++) {
            const element = this.audioList[i];
            this._dict[element.name] = element;
        }
        this._audioSource = this.getComponent(AudioSource);
    }

    public play(name: string){
        const audioClip = this._dict[name];
        if(audioClip !== undefined){
            this._audioSource.playOneShot(audioClip);
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
