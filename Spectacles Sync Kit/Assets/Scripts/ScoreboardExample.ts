import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"

@component
export class ScoreboardExample extends BaseScriptComponent {

    @input
    scoreText : Text;

    scoreProperty = StorageProperty.manualInt("score", 0);

    private storagePropertySet = new StoragePropertySet([
        this.scoreProperty,
    ])

    private syncEntity : SyncEntity;

    onAwake() {
        this.syncEntity=new SyncEntity(this,this.storagePropertySet,false);
        this.scoreProperty.onAnyChange.add(this.onScoreChange.bind(this));
        this.syncEntity.notifyOnReady(() => this.onReady());
    }

    private onReady(){
        this.scoreText.text="Score: "+this.scoreProperty.currentOrPendingValue;
    }

    private onScoreChange(newValue, oldValue){
        this.scoreText.text="Score: "+newValue;
    }

    addScore(){
        this.scoreProperty.setPendingValue(this.scoreProperty.currentOrPendingValue+1);
    }
}
