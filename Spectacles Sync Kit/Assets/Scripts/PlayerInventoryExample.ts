import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { LocalStorageManagerExample } from "Scripts/LocalStorageManagerExample";

@component
export class PlayerInventoryExample extends BaseScriptComponent {

    @input 
    userTag: Text;

    @input
    localStoreManager : LocalStorageManagerExample;

    @input 
    objectAUI: Text;

    @input 
    objectATag: Text;

    @input 
    objectBUI: Text;

    @input 
    objectBTag: Text;

    @input 
    cameraTarget : SceneObject 

    userNameStorageProperty = StorageProperty.manualString("userName", "");
    objectAStorageProperty = StorageProperty.manualInt("objectA", 0);
    objectBStorageProperty = StorageProperty.manualInt("objectB", 0);

    private storagePropertySet = new StoragePropertySet([
        this.userNameStorageProperty,
        this.objectAStorageProperty,
        this.objectBStorageProperty
    ])

    private syncEntity = new SyncEntity(this, this.storagePropertySet, true);

    private cameraTargetTransform: Transform;
    private localTransform: Transform;

    private inventory={
        objectA : this.objectAStorageProperty,
        objectB : this.objectBStorageProperty
    }

    onAwake() {
        this.localTransform=this.getTransform();
        this.cameraTargetTransform = this.cameraTarget.getTransform();
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.userNameStorageProperty.onRemoteChange.add(this.onRemoteUserNameChange.bind(this));
        this.inventory["objectA"].onLocalChange.add(this.onLocalObjectAChange.bind(this));
        this.inventory["objectA"].onRemoteChange.add(this.onRemoteObjectAChange.bind(this));
        this.inventory["objectB"].onLocalChange.add(this.onLocalObjectBChange.bind(this));
        this.inventory["objectB"].onRemoteChange.add(this.onRemoteObjectBChange.bind(this));
    }

    async onReady(){
        if(this.syncEntity.doIOwnStore()){
            this.createEvent("UpdateEvent").bind(this.updateAsOwner.bind(this));
            this.userNameStorageProperty.setPendingValue(SessionController.getInstance().getLocalUserInfo().displayName);
            this.userTag.getSceneObject().enabled=false;
            await this.localStoreManager.initStorage();
            this.syncInventory();
        }
        else{
            this.userTag.text=this.userNameStorageProperty.currentOrPendingValue;
            this.objectATag.text="Object A: "+this.inventory["objectA"].currentOrPendingValue;
            this.objectBTag.text="Object B: "+this.inventory["objectB"].currentOrPendingValue;
        }
    }

    initInventory(key: string){
        this.localStoreManager.setNumber(key,0);
    }

    async syncInventory(){
        const storedObjectA=await this.localStoreManager.getNumber(this.userNameStorageProperty.currentOrPendingValue+"/objectA");
        if(storedObjectA==0){
            this.initInventory(this.userNameStorageProperty.currentOrPendingValue+"/objectA");
        }
        this.inventory["objectA"].setPendingValue(storedObjectA);
        const storedObjectB=await this.localStoreManager.getNumber(this.userNameStorageProperty.currentOrPendingValue+"/objectB");
        if(storedObjectB==0){
            this.initInventory(this.userNameStorageProperty.currentOrPendingValue+"/objectB");
        }
        this.inventory["objectB"].setPendingValue(storedObjectB);
    }

    async addInventory(key: string){
        const storedObject=await this.localStoreManager.getNumber(this.userNameStorageProperty.currentOrPendingValue+"/"+key);
        this.localStoreManager.setNumber(this.userNameStorageProperty.currentOrPendingValue+"/"+key,storedObject+1);
        this.inventory[key].setPendingValue(storedObject+1);
    }

    async removeInventory(key: string){
        var storedObject=await this.localStoreManager.getNumber(this.userNameStorageProperty.currentOrPendingValue+"/"+key);
        if(storedObject<=1){
            storedObject=0;
        }
        else{
            storedObject-=1;
        }
        this.localStoreManager.setNumber(this.userNameStorageProperty.currentOrPendingValue+"/"+key,storedObject);
        this.inventory[key].setPendingValue(storedObject);
    }

    addObjectA(){
        this.addInventory("objectA");
    }

    addObjectB(){
        this.addInventory("objectB");
    }

    removeObjectA(){
        this.removeInventory("objectA");
    }

    removeObjectB(){
        this.removeInventory("objectB");
    }

    onRemoteUserNameChange(newValue, oldValue){
        this.userTag.text=newValue;
    }

    onLocalObjectAChange(newValue, oldValue){
        this.objectAUI.text="Object A: "+newValue;
    }

    onRemoteObjectAChange(newValue, oldValue){
        this.objectATag.text="Object A: "+newValue;
    }

    onLocalObjectBChange(newValue, oldValue){
        this.objectBUI.text="Object B: "+newValue;
    }

    onRemoteObjectBChange(newValue, oldValue){
        this.objectBTag.text="Object B: "+newValue;
    }
    
    updateAsOwner() {
        this.localTransform.setWorldPosition(this.cameraTargetTransform.getWorldPosition());
        this.localTransform.setWorldRotation(this.cameraTargetTransform.getWorldRotation());
    }
}
