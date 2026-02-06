import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"

@component
export class PlayerExample extends BaseScriptComponent {

    @input 
    userTag: Text;

    @input 
    cameraTarget : SceneObject 

    userNameStorageProperty = StorageProperty.manualString("userName", "");

    private storagePropertySet = new StoragePropertySet([
        this.userNameStorageProperty,
    ])

    private syncEntity = new SyncEntity(this, this.storagePropertySet, true);

    private cameraTargetTransform: Transform;
    private localTransform: Transform;

    onAwake() {
        this.localTransform=this.getTransform();
        this.cameraTargetTransform = this.cameraTarget.getTransform();
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.userNameStorageProperty.onRemoteChange.add(this.onRemoteUserNameChange.bind(this));
    }

    onReady(){
        if(this.syncEntity.doIOwnStore()){
            this.createEvent("UpdateEvent").bind(this.updateAsOwner.bind(this));
            this.userNameStorageProperty.setPendingValue(SessionController.getInstance().getLocalUserInfo().displayName);
            this.userTag.getSceneObject().enabled=false;
        }
        else{
            this.userTag.text=this.userNameStorageProperty.currentOrPendingValue;
        }
    }

    onRemoteUserNameChange(newValue, oldValue){
        this.userTag.text=newValue;
    }

    updateAsOwner() {
        this.localTransform.setWorldPosition(this.cameraTargetTransform.getWorldPosition());
        this.localTransform.setWorldRotation(this.cameraTargetTransform.getWorldRotation());
    }
}
