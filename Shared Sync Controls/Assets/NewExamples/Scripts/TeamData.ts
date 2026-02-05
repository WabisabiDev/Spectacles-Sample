import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"

@component
export class TeamData extends BaseScriptComponent {

    @input 
    maxPlayersPerTeam: number;

    @input 
    cameraTarget : SceneObject;

    @input
    redCount : Text;

    @input 
    redJoin : SceneObject 

    @input 
    redLeave : SceneObject

    @input
    blueCount : Text;

    @input 
    blueJoin : SceneObject 

    @input 
    blueLeave : SceneObject 

    teamRedProperty = StorageProperty.manualInt("teamRed", 0);
    teamBlueProperty = StorageProperty.manualInt("teamBlue", 0);

    private storagePropertySet = new StoragePropertySet([
        this.teamRedProperty,
        this.teamBlueProperty,
    ])

    private syncEntity = new SyncEntity(this, this.storagePropertySet, false);

    private localTeam=0;
    
    onAwake() {
        this.createEvent("TurnOffEvent").bind(this.onPlayerLeft.bind(this));
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.teamRedProperty.onAnyChange.add(this.onRedChange.bind(this));
        this.teamBlueProperty.onAnyChange.add(this.onBlueChange.bind(this));
    }

    onReady(){
        this.setRedUI(this.teamRedProperty.currentOrPendingValue);
        this.setBlueUI(this.teamBlueProperty.currentOrPendingValue);
    }

    onRedChange(newValue, oldValue){
        this.setRedUI(newValue);
    }

    setRedUI(newValue: number){
        this.redCount.text=newValue+'';
        if(newValue>0){
            this.redLeave.enabled=true;
        }
        if(newValue<this.maxPlayersPerTeam){
            this.redJoin.enabled=true;
        }
        if(newValue==this.maxPlayersPerTeam){
            this.redJoin.enabled=false;
        }
        if(newValue==0){
            this.redLeave.enabled=false;
        }
    }

    onBlueChange(newValue, oldValue){
        this.setBlueUI(newValue);
    }

    setBlueUI(newValue: number){
        this.blueCount.text=newValue+'';
        if(newValue>0){
            this.blueLeave.enabled=true;
        }
        if(newValue<this.maxPlayersPerTeam){
            this.blueJoin.enabled=true;
        }
        if(newValue==this.maxPlayersPerTeam){
            this.blueJoin.enabled=false;
        }
        if(newValue==0){
            this.blueLeave.enabled=false;
        }
    }

    onPlayerLeft(){
        if(this.localTeam==1){
            
        }
        else if(this.localTeam==2){

        }
    }

    joinRedTeam(){
        let redPlayers=this.teamRedProperty.currentOrPendingValue;
        if(redPlayers+1<=this.maxPlayersPerTeam){
            this.teamRedProperty.setPendingValue(redPlayers+1);
        }
    }

    joinBlueTeam(){
        let bluePlayers=this.teamBlueProperty.currentOrPendingValue;
        if(bluePlayers+1<=this.maxPlayersPerTeam){
            this.teamBlueProperty.setPendingValue(bluePlayers+1);
        }
    }

    leaveRedTeam(){
        let redPlayers=this.teamRedProperty.currentOrPendingValue;
        if(redPlayers+1>=0){
            this.teamRedProperty.setPendingValue(redPlayers-1);
        }
    }

    leaveBlueTeam(){
        let bluePlayers=this.teamBlueProperty.currentOrPendingValue;
        if(bluePlayers+1>=0){
            this.teamBlueProperty.setPendingValue(bluePlayers-1);
        }
    }
}
