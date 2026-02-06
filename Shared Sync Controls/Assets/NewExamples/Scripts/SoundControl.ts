import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {SoundManager} from "./SoundManager"
import {Slider} from "SpectaclesInteractionKit.lspkg/Components/UI/Slider/Slider"
import {CapsuleButton} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton"
import {Callback, createCallbacks} from "SpectaclesUIKit.lspkg/Scripts/Utility/SceneUtilities"

@component
export class SoundControl extends BaseScriptComponent {

    @input 
    manager : SoundManager;

    @input 
    volumeSlider: Slider;

    @input 
    muteButton: CapsuleButton;

    @input 
    muteButtonText: Text;

    volumeProperty = StorageProperty.manualFloat("volume", 1);
    muteProperty = StorageProperty.manualBool("mute", false);

    private storagePropertySet = new StoragePropertySet([
        this.volumeProperty,
        this.muteProperty,
    ]);

    private syncEntity = new SyncEntity(this, this.storagePropertySet, false);
    
    onAwake() {
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.volumeProperty.onLocalChange.add(this.onLocalVolumeChange.bind(this));
        this.volumeProperty.onRemoteChange.add(this.onRemoteVolumeChange.bind(this));
        this.muteProperty.onLocalChange.add(this.onLocalMuteChange.bind(this));
        this.muteProperty.onRemoteChange.add(this.onRemoteMuteChange.bind(this));
    }

    onReady(){
        let callback=[new Callback()];
        callback[0].scriptComponent=this;
        callback[0].functionName=this.setMute.name;
        this.muteButton.onTriggerDown.add(createCallbacks(callback));
        callback=[new Callback()];
        callback[0].scriptComponent=this;
        callback[0].functionName=this.setVolume.name;
        this.volumeSlider.onValueUpdate.add(createCallbacks(callback));
        this.setVolumeUI(this.volumeProperty.currentOrPendingValue);
        this.setMuteUI(this.muteProperty.currentOrPendingValue, true);
    }

    onLocalVolumeChange(newValue, oldValue){
        this.manager.setVolume(newValue,true);
    }

    onRemoteVolumeChange(newValue, oldValue){
        this.setVolumeUI(newValue);
        this.manager.setVolume(newValue,true);
    }

    setVolumeUI(newValue: number){
        this.volumeSlider.currentValue=newValue;
    }

    setVolume(newValue: number){
        this.volumeProperty.setPendingValue(newValue);
    }

    onLocalMuteChange(newValue, oldValue){
        this.setMuteUI(newValue, false);
        this.manager.setMute(newValue);
    }

    onRemoteMuteChange(newValue, oldValue){
        this.setMuteUI(newValue, true);
        this.manager.setMute(newValue);
    }

    setMuteUI(state: boolean, updateToggle: boolean){
        if(state){
            this.muteButtonText.text='Sound: Off';
        }
        else{
            this.muteButtonText.text='Sound: On';
        }
        if(updateToggle){
            this.muteButton.toggle(!state);
        }
    }

    setMute(){
        this.muteProperty.setPendingValue(this.muteButton.isOn)
    }
}
