import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {CapsuleButton} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton"

@component
export class ReadyPlayers extends BaseScriptComponent {

    @input 
    cameraTarget : SceneObject;

    @input
    count : Text;

    @input
    readyButton : CapsuleButton;

    @input
    readyButtonText : Text;

    @input
    stateText : Text;

    readysProperty = StorageProperty.manualInt("readys", 0);

    private storagePropertySet = new StoragePropertySet([
        this.readysProperty,
    ])

    private syncEntity = new SyncEntity(this, this.storagePropertySet, false);

    private isPlayerReady=false;
    
    onAwake() {
        this.createEvent("TurnOffEvent").bind(this.onPlayerLeft.bind(this));
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.readysProperty.onAnyChange.add(this.onReadysChange.bind(this));
        this.readyButton.onTriggerDown.add(this.setReady.bind(this));
    }

    onReady(){
        this.setReadyUI(this.readysProperty.currentOrPendingValue);
    }

    onReadysChange(newValue, oldValue){
        print("Ready change");
        this.setReadyUI(newValue);
    }

    onPlayerLeft(){
        if(this.isPlayerReady){
            print("Left");
            this.readysProperty.setPendingValue(this.readysProperty.currentOrPendingValue-1);
        }
    }

    setReady(){
        const COLOR_GREEN=new vec4(0,1,0,1);
        const COLOR_RED=new vec4(1,0,0,1);
        let state=this.readyButton.isOn;
        if(!state){
            this.isPlayerReady=true;
            this.readyButtonText.text="Not Ready";
            this.readysProperty.setPendingValue(this.readysProperty.currentOrPendingValue+1);
            this.stateText.text="Ready";
            this.stateText.textFill.color=COLOR_GREEN;
            this.stateText.outlineSettings.fill.color=COLOR_GREEN;
        }
        else{
            this.isPlayerReady=false;
            this.readyButtonText.text="Ready";
            this.readysProperty.setPendingValue(this.readysProperty.currentOrPendingValue-1);
            this.stateText.text="Not Ready";
            this.stateText.textFill.color=COLOR_RED;
            this.stateText.outlineSettings.fill.color=COLOR_RED;
        }
    }

    setReadyUI(value: number){
        this.count.text=value+"";
    }

}
