// AvatarController.js
// Version: 1.0.1
// Event: On Awake
// Description: Spawns and updates an avatar for the local player
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {Instantiator, InstantiationOptions} from "SpectaclesSyncKit.lspkg/Components/Instantiator"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"

@component
export class AvatarControllerExample extends BaseScriptComponent {

    @input 
    instantiator : Instantiator;

    @input
    myPrefab : ObjectPrefab;

    @input 
    myTarget: SceneObject;

    private camTransform : Transform;

    private syncEntity : SyncEntity;

    private mySceneObject: SceneObject;

    private myTransform: Transform;

    onInstantiatorReady() {
        print("[GameLog] CaptureFlag| Instantiator Ready");
        var targetTransform=this.myTarget.getTransform();
        var worldPos = this.camTransform.getWorldPosition();
        var worldRot = this.camTransform.getWorldRotation();

        var options = new InstantiationOptions();
        options.onSuccess = this.onSpawned;
        options.onError= this.onError;
        options.persistence = RealtimeStoreCreateOptions.Persistence.Owner;
        options.claimOwnership = false;
        options.worldPosition = worldPos;
        options.worldRotation = worldRot;

        this.instantiator.instantiate(this.myPrefab, options);
    }

    /**
     * 
     * @param {NetworkRootInfo} networkRoot 
     */
    onSpawned(networkRoot) {
        this.mySceneObject = networkRoot.instantiatedObject;
        this.myTransform = this.mySceneObject.getTransform();
        if(this.mySceneObject.getChildrenCount()<1){
            print("[GameLog] CaptureFlag| Respawn Retry");
            this.onReady();
        }
        else{
            print("[GameLog] CaptureFlag| Object spawned: "+this.mySceneObject.name);
        }
    }


    onAwake() {
        this.camTransform= this.myTarget.getTransform();
        this.syncEntity = new SyncEntity(this,
            new StoragePropertySet([]),
            false, // This is where we choose not to claim ownership of the store
            RealtimeStoreCreateOptions.Persistence.Owner);
        this.syncEntity.notifyOnReady(this.onReady.bind(this));
        this.instantiator.notifyOnReady(this.onInstantiatorReady.bind(this));
    }

    onReady() {
        this.syncEntity.tryClaimOwnership(this.onClaimed.bind(this), this.onError.bind(this));
    }

    onClaimed() {
        if (!this.syncEntity.doIOwnStore()) {
            //throw new Error("Failed to claim ownership "+syncEntity.networkId);
            print("[GameLog] Failed to claim ownership " + this.syncEntity.networkId);
        }
        else {
            print("[GameLog] Claim ownership successful for " + this.syncEntity.networkId);        
        }
        // Do something here...
    }

    onError(error) {
        //throw new Error(syncEntity.networkId+' Error message '+error);
        print(this.syncEntity.networkId+' Error message '+error);
    }

    /**
    * Returns the first Component of `componentType` found in the object or its children.
    * @template {keyof ComponentNameMap} T
    * @param {SceneObject} object Object to search
    * @param {T} componentType Component type name to search for
    * @returns {ComponentNameMap[T]} Matching Components in `object` and its children
    */
    getComponentRecursive(object, componentType) {
        var component = object.getComponent(componentType);
        if (component) {
            return component;
        }
        var childCount = object.getChildrenCount();
        for (var i=0; i<childCount; i++) {
            var result = this.getComponentRecursive(object.getChild(i), componentType);
            if (result) {
                return result;
            }
        }
        return null;
    }
}