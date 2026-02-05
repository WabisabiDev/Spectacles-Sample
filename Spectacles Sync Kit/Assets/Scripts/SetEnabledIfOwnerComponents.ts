import {NetworkRootInfo} from "SpectaclesSyncKit.lspkg/Core/NetworkRootInfo"
import {findNetworkRoot} from "SpectaclesSyncKit.lspkg/Core/NetworkUtils"
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"

/**
 * Enables or disables groups of SceneObjects whenever ownership of the SyncEntity changes.
 * When the SyncEntity becomes owned by the local user, the objects in nonOwnerComponents become disabled, and
 * objects in ownerComponents become enabled.
 * When the SyncEntity becomes not owned by the local user, the objects in ownerComponents become disabled, and
 * objects in nonOwnerComponents become enabled.
 */
@component
export class SetEnabledIfOwnerComponents extends BaseScriptComponent {
  @ui.group_start("Entity Target")
  @input("string", "SyncEntity")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Sync Entity", "SyncEntity"),
      new ComboBoxItem("Network Root", "NetworkRoot"),
    ]),
  )
  @label("Target Type")
  private readonly targetTypeString: "SyncEntity" | "NetworkRoot" = "SyncEntity"

  @input()
  @showIf("targetTypeString", "SyncEntity")
  private readonly syncEntityScript: ScriptComponent

  @ui.group_end
  @input
  private readonly ownerComponents: BaseScriptComponent[]

  @input
  private readonly nonOwnerComponents: BaseScriptComponent[]

  private syncEntity: SyncEntity | null

  private networkRoot: NetworkRootInfo | null

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.init())
  }

  /**
   * Sets the enabled state of all objects in the array.
   * @param objects - The array of SceneObjects.
   * @param enabled - The enabled state to set.
   */
  setAllEnabled(objects: BaseScriptComponent[], enabled: boolean) {
    for (let i = 0; i < objects.length; i++) {
      objects[i].enabled = enabled
    }
  }

  /**
   * Updates the enabled state of the owner and non-owner objects based on the ownership of the target.
   * @param ownerInfo - Information about the owner.
   */
  updateOwner(ownerInfo: ConnectedLensModule.UserInfo) {
    const isOwner =
      SessionController.getInstance().isLocalUserConnection(ownerInfo)
    if (isOwner) {
      this.setAllEnabled(this.nonOwnerComponents, false)
      this.setAllEnabled(this.ownerComponents, true)
    } else {
      this.setAllEnabled(this.ownerComponents, false)
      this.setAllEnabled(this.nonOwnerComponents, true)
    }
  }

  /**
   * Initializes the component by setting up the appropriate event listeners and updating the ownership state.
   */
  init() {
    switch (this.targetTypeString) {
      case "SyncEntity":
        this.syncEntity = SyncEntity.getSyncEntityOnComponent(
          this.syncEntityScript,
        )
        this.syncEntity.onOwnerUpdated.add(this.updateOwner)
        this.updateOwner(this.syncEntity.ownerInfo)
        break
      case "NetworkRoot":
        this.networkRoot = findNetworkRoot(this.getSceneObject())
        if (this.networkRoot) {
          this.updateOwner(this.networkRoot.ownerInfo)
        }
        break
    }
  }
}
