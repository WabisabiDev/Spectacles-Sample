@component
export class SoundManager extends BaseScriptComponent {

    @input 
    sounds : AudioComponent[];

    private _isMute:boolean;
    private actualVolume:number

    onAwake(){
        this._isMute=false;
        this.actualVolume=1;
        for(var i=0;i<this.sounds.length;i++){
            this.sounds[i].play(-1);
        }
    }

    setMute(state: boolean){
        this._isMute=state;
        if(state){
            this.setVolume(0,false);
        }
        else{
            this.setVolume(this.actualVolume,true);
        }
    }

    setVolume(volume: number, saveVolume: boolean){
        if(saveVolume){
            this.actualVolume=volume;
        }
        if(this._isMute){
            volume=0;
        }
        for(var i=0;i<this.sounds.length;i++){
            this.sounds[i].volume=volume;
            this.sounds[i].recordingVolume=volume;
        }
    }

}
