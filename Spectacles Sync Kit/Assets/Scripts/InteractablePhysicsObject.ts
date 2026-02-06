import {validate} from "SpectaclesInteractionKit.lspkg/Utils/validate"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {StorageTypes} from "SpectaclesSyncKit.lspkg/Core/StorageTypes"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"

/**
 * This class provides an example of synced physics.
 */
@component
export class InteractablePhysicsObject extends BaseScriptComponent {
  /**
   * This is the body component that will provide the physics calculations.
   */
  @input
  @hint("This is the body component that will provide the physics calculations.")
  physicsBody: BodyComponent

  private interactable: Interactable | null = null

  private physicsActiveProperty : StorageProperty<StorageTypes.bool>;

  private storagePropertySet : StoragePropertySet;

  private syncEntity : SyncEntity;

  onAwake(): void {
    this.physicsActiveProperty = StorageProperty.manualBool("isPhysicsActive", this.physicsBody.dynamic);
    this.storagePropertySet = new StoragePropertySet([
      this.physicsActiveProperty,
    ]);
    this.syncEntity = new SyncEntity(this, this.storagePropertySet, false);
    this.syncEntity.notifyOnReady(() => this.onReady());
    this.physicsActiveProperty.onAnyChange.add(this.onPhysicsActiveAnyChange.bind(this));
    this.defineScriptEvents()
  }

  private defineScriptEvents() {
    this.createEvent("OnStartEvent").bind(() => {
      this.init()
    })
  }

  init() {
    this.interactable = this.getSceneObject().getComponent(Interactable.getTypeName())
    if (!this.interactable) {
      throw new Error(
        "No interactable was found - please ensure that a component matching the Interactable typename provided was added to this SceneObject."
      )
    }

    this.setupInteractableCallbacks()
  }

  setupInteractableCallbacks(): void {
    validate(this.interactable)

    this.interactable.onTriggerStart.add(() => {
      this.updatePhysics(false);
    })

    this.interactable.onTriggerEnd.add(() => {
      this.updatePhysics(true);
    })

    this.interactable.onTriggerEndOutside.add(() => {
      this.updatePhysics(true);
    })

    this.interactable.onTriggerCanceled.add(() => {
      this.updatePhysics(true);
    })
  }

  onReady(){
    if(!SessionController.getInstance().isHost()){
        this.physicsBody.dynamic=false;
    }
  }

  onPhysicsActiveAnyChange(newValue, oldValue){
    print("Dynamic state: "+newValue);
    if(!SessionController.getInstance().isHost()){
        return;
    }
    this.physicsBody.dynamic=newValue;
  }

  updatePhysics(newState: boolean){
    this.physicsActiveProperty.setPendingValue(newState);
  }

}
