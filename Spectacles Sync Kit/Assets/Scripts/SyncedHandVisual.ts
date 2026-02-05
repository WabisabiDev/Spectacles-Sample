import TrackedHand from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/TrackedHand"
import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData"
import {findSceneObjectByName} from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils"
import {NetworkIdOptions} from "SpectaclesSyncKit.lspkg/Core/NetworkIdTools"
import {networkIdFromString, NetworkIdType} from "SpectaclesSyncKit.lspkg/Core/NetworkIdType"
import {persistenceTypeFromString} from "SpectaclesSyncKit.lspkg/Core/PersistenceType"
import {PropertyType, propertyTypeFromString} from "SpectaclesSyncKit.lspkg/Core/PropertyType"
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity,EntityEventWrapper} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {StorageTypes} from "SpectaclesSyncKit.lspkg/Core/StorageTypes"
/**
 * This class provides a visual representation of the hand, with the ability to automatically wire joints to the hand
 * mesh. It also provides the ability to add a radial gradient occlusion effect and a glow effect to the hand mesh.
 */
@component
export class SyncedHandVisual extends BaseScriptComponent {
  /**
   * Specifies which hand (Left or Right) this visual representation tracks and renders.
   */
  @input
  @hint("Specifies which hand (Left or Right) this visual representation tracks and renders.")
  @widget(new ComboBoxWidget([new ComboBoxItem("Left", "left"), new ComboBoxItem("Right", "right")]))
  private handType!: string

  /** @inheritdoc */
  @input
  @hint("Reference to the parent SceneObject that contains both the hand's rig and mesh.")
  handVisual: SceneObject

  /**
   * Reference to the RenderMeshVisual of the full hand mesh.
   */
  @input
  @hint("Reference to the RenderMeshVisual of the full hand mesh.")
  handMesh: RenderMeshVisual

  /** @inheritdoc */
  @input
  @hint("Reference to the parent SceneObject that contains both the hand's rig and mesh.")
  root: SceneObject

  /**
   * When enabled, the system will automatically map tracking data to the hand model's joints. Disable only if you
   * need manual control over individual joint assignments.
   */
  @input
  @hint(
    "When enabled, the system will automatically map tracking data to the hand model's joints. Disable only if you \
need manual control over individual joint assignments."
  )
  autoJointMapping: boolean = true

  @ui.group_start("Joint Setup")
  @showIf("autoJointMapping", false)
  @input("SceneObject")
  @allowUndefined
  wrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbBaseJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyTip: SceneObject | undefined
  @ui.group_end

  @input("string", "objectId")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Object Id", "objectId"),
      new ComboBoxItem("Custom", "custom"),
    ])
  )
  @label("Network Id Type")
  private readonly networkIdTypeString: string = "objectId"
  private readonly networkIdType: NetworkIdType = networkIdFromString(
    this.networkIdTypeString
  )

  @input("string", "enter_unique_id")
  @showIf("networkIdTypeString", "custom")
  private readonly customNetworkId: string = "enter_unique_id"

  @ui.separator
  @ui.label("Sync Settings")

  @input("string", "Location")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("None", "None"),
      new ComboBoxItem("Location", "Location"),
      new ComboBoxItem("Local", "Local"),
      new ComboBoxItem("World", "World"),
    ])
  )
  @label("Scale Sync")
  private readonly scaleSyncString: string = "Location"
  private readonly scaleSync: PropertyType = propertyTypeFromString(
    this.scaleSyncString
  )

  @ui.separator
  @input("string", "Session")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Ephemeral", "Ephemeral"),
      new ComboBoxItem("Owner", "Owner"),
      new ComboBoxItem("Session", "Session"),
      new ComboBoxItem("Persist", "Persist"),
    ])
  )
  @label("Persistence")
  private readonly persistenceString: string = "Session"
  private readonly persistence: RealtimeStoreCreateOptions.Persistence =
    persistenceTypeFromString(this.persistenceString)

  @input("int", "10")
  private readonly sendsPerSecondLimit: number = 10

  @input("boolean", "false")
  private readonly useSmoothing: boolean = false

  @input("float", "-0.25")
  @showIf("useSmoothing", true)
  private readonly interpolationTarget: number = -0.25

  private handVisualTransform : Transform
  private wristTransform: Transform
  private thumbToWristTransform: Transform
  private thumbBaseJointTransform: Transform
  private thumbKnuckleTransform: Transform
  private thumbMidJointTransform: Transform
  private thumbTipTransform: Transform
  private indexToWristTransform: Transform
  private indexKnuckleTransform: Transform
  private indexMidJointTransform: Transform
  private indexUpperJointTransform: Transform
  private indexTipTransform: Transform
  private middleToWristTransform: Transform
  private middleKnuckleTransform: Transform
  private middleMidJointTransform: Transform
  private middleUpperJointTransform: Transform
  private middleTipTransform: Transform
  private ringToWristTransform: Transform
  private ringKnuckleTransform: Transform
  private ringMidJointTransform: Transform
  private ringUpperJointTransform: Transform
  private ringTipTransform: Transform
  private pinkyToWristTransform: Transform
  private pinkyKnuckleTransform: Transform
  private pinkyMidJointTransform: Transform
  private pinkyUpperJointTransform: Transform
  private pinkyTipTransform: Transform

  private handVisualTransformProp : StorageProperty<StorageTypes.packedTransform>
  private wristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private thumbToWristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private thumbBaseJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private thumbKnuckleTransformProp : StorageProperty<StorageTypes.packedTransform>
  private thumbMidJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private thumbTipTransformProp : StorageProperty<StorageTypes.packedTransform>
  private indexToWristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private indexKnuckleTransformProp : StorageProperty<StorageTypes.packedTransform>
  private indexMidJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private indexUpperJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private indexTipTransformProp : StorageProperty<StorageTypes.packedTransform>
  private middleToWristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private middleKnuckleTransformProp : StorageProperty<StorageTypes.packedTransform>
  private middleMidJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private middleUpperJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private middleTipTransformProp : StorageProperty<StorageTypes.packedTransform>
  private ringToWristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private ringKnuckleTransformProp : StorageProperty<StorageTypes.packedTransform>
  private ringMidJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private ringUpperJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private ringTipTransformProp : StorageProperty<StorageTypes.packedTransform>
  private pinkyToWristTransformProp : StorageProperty<StorageTypes.packedTransform>
  private pinkyKnuckleTransformProp : StorageProperty<StorageTypes.packedTransform>
  private pinkyMidJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private pinkyUpperJointTransformProp : StorageProperty<StorageTypes.packedTransform>
  private pinkyTipTransformProp : StorageProperty<StorageTypes.packedTransform>

  private handVisualChangeEvent : EntityEventWrapper<unknown>;

  private syncEntity : SyncEntity

  private handProvider: HandInputData = HandInputData.getInstance()

  private hand: TrackedHand

  initialized = false
   constructor() {
    super()
   }


  private getJointSceneObject(targetSceneObjectName: string, root: SceneObject) {
    const sceneObject = findSceneObjectByName(root, targetSceneObjectName)
    if (sceneObject === null) {
      throw new Error(`${targetSceneObjectName} could not be found in children of SceneObject: ${this.root?.name}`)
    }
    return sceneObject
  }

  onAwake(): void {
    this.initialize()

    if (this.handMesh && this.handMesh.mainMaterial) {
      const mainMaterial = this.handMesh.mainMaterial
      for (let i = 0; i < mainMaterial.getPassCount(); i++) {
        const pass = mainMaterial.getPass(i)
        pass.frustumCullMode = FrustumCullMode.UserDefinedAABB
        pass.frustumCullMin = new vec3(-1, -1, -1)
        pass.frustumCullMax = new vec3(1, 1, 1)
      }
    }
    this.handMesh.getSceneObject().enabled=false;
  }

  public initialize(): void {

    this.wrist = this.autoJointMapping ? this.getJointSceneObject("wrist", this.root) : this.wrist

    this.thumbToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_thumb", this.root)
      : this.thumbToWrist
    this.thumbBaseJoint = this.autoJointMapping ? this.getJointSceneObject("thumb-0", this.root) : this.thumbBaseJoint
    this.thumbKnuckle = this.autoJointMapping ? this.getJointSceneObject("thumb-1", this.root) : this.thumbKnuckle
    this.thumbMidJoint = this.autoJointMapping ? this.getJointSceneObject("thumb-2", this.root) : this.thumbMidJoint
    this.thumbTip = this.autoJointMapping ? this.getJointSceneObject("thumb-3", this.root) : this.thumbTip
    this.indexToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_index", this.root)
      : this.indexToWrist
    this.indexKnuckle = this.autoJointMapping ? this.getJointSceneObject("index-0", this.root) : this.indexKnuckle
    this.indexMidJoint = this.autoJointMapping ? this.getJointSceneObject("index-1", this.root) : this.indexMidJoint
    this.indexUpperJoint = this.autoJointMapping ? this.getJointSceneObject("index-2", this.root) : this.indexUpperJoint
    this.indexTip = this.autoJointMapping ? this.getJointSceneObject("index-3", this.root) : this.indexTip
    this.middleToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_mid", this.root)
      : this.middleToWrist
    this.middleKnuckle = this.autoJointMapping ? this.getJointSceneObject("mid-0", this.root) : this.middleKnuckle
    this.middleMidJoint = this.autoJointMapping ? this.getJointSceneObject("mid-1", this.root) : this.middleMidJoint
    this.middleUpperJoint = this.autoJointMapping ? this.getJointSceneObject("mid-2", this.root) : this.middleUpperJoint
    this.middleTip = this.autoJointMapping ? this.getJointSceneObject("mid-3", this.root) : this.middleTip
    this.ringToWrist = this.autoJointMapping ? this.getJointSceneObject("wrist_to_ring", this.root) : this.ringToWrist
    this.ringKnuckle = this.autoJointMapping ? this.getJointSceneObject("ring-0", this.root) : this.ringKnuckle
    this.ringMidJoint = this.autoJointMapping ? this.getJointSceneObject("ring-1", this.root) : this.ringMidJoint
    this.ringUpperJoint = this.autoJointMapping ? this.getJointSceneObject("ring-2", this.root) : this.ringUpperJoint
    this.ringTip = this.autoJointMapping ? this.getJointSceneObject("ring-3", this.root) : this.ringTip
    this.pinkyToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_pinky", this.root)
      : this.pinkyToWrist
    this.pinkyKnuckle = this.autoJointMapping ? this.getJointSceneObject("pinky-0", this.root) : this.pinkyKnuckle
    this.pinkyMidJoint = this.autoJointMapping ? this.getJointSceneObject("pinky-1", this.root) : this.pinkyMidJoint
    this.pinkyUpperJoint = this.autoJointMapping ? this.getJointSceneObject("pinky-2", this.root) : this.pinkyUpperJoint
    this.pinkyTip = this.autoJointMapping ? this.getJointSceneObject("pinky-3", this.root) : this.pinkyTip

    this.handVisualTransform=this.handVisual.getTransform();
    this.handVisualTransformProp = StorageProperty.forTransform(
      this.handVisualTransform,
      propertyTypeFromString("Location"),
      propertyTypeFromString("Location"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.handVisualTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.wristTransform=this.wrist.getTransform();
    this.wristTransformProp = StorageProperty.forTransform(
      this.wristTransform,
      propertyTypeFromString("Location"),
      propertyTypeFromString("Location"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.wristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.thumbToWristTransform=this.thumbToWrist.getTransform();
    this.thumbToWristTransformProp = StorageProperty.forTransform(
      this.thumbToWristTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.thumbToWristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.thumbBaseJointTransform=this.thumbBaseJoint.getTransform();
    this.thumbBaseJointTransformProp = StorageProperty.forTransform(
      this.thumbBaseJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.thumbBaseJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.thumbKnuckleTransform=this.thumbKnuckle.getTransform();
    this.thumbKnuckleTransformProp = StorageProperty.forTransform(
      this.thumbKnuckleTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.thumbKnuckleTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.thumbMidJointTransform=this.thumbMidJoint.getTransform();
    this.thumbMidJointTransformProp = StorageProperty.forTransform(
      this.thumbMidJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.thumbMidJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.thumbTipTransform=this.thumbTip.getTransform();
    this.thumbTipTransformProp = StorageProperty.forTransform(
      this.thumbTipTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.thumbTipTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.indexToWristTransform=this.indexToWrist.getTransform();
    this.indexToWristTransformProp = StorageProperty.forTransform(
      this.indexToWristTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.indexToWristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.indexKnuckleTransform=this.indexKnuckle.getTransform();
    this.indexKnuckleTransformProp = StorageProperty.forTransform(
      this.indexKnuckleTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.indexKnuckleTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.indexMidJointTransform=this.indexMidJoint.getTransform();
    this.indexMidJointTransformProp = StorageProperty.forTransform(
      this.indexMidJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.indexMidJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.indexUpperJointTransform=this.indexUpperJoint.getTransform();
    this.indexUpperJointTransformProp = StorageProperty.forTransform(
      this.indexUpperJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.indexUpperJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.indexTipTransform=this.indexTip.getTransform();
    this.indexTipTransformProp = StorageProperty.forTransform(
      this.indexTipTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.indexTipTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.middleToWristTransform=this.middleToWrist.getTransform();
    this.middleToWristTransformProp = StorageProperty.forTransform(
      this.middleToWristTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.middleToWristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    this.middleKnuckleTransform=this.middleKnuckle.getTransform();
    this.middleKnuckleTransformProp = StorageProperty.forTransform(
      this.middleKnuckleTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.middleKnuckleTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.middleMidJointTransform=this.middleMidJoint.getTransform();
    this.middleMidJointTransformProp = StorageProperty.forTransform(
      this.middleMidJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.middleMidJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.middleUpperJointTransform=this.middleUpperJoint.getTransform();
    this.middleUpperJointTransformProp = StorageProperty.forTransform(
      this.middleUpperJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.middleUpperJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.middleTipTransform=this.middleTip.getTransform();
    this.middleTipTransformProp = StorageProperty.forTransform(
      this.middleTipTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.middleTipTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.ringToWristTransform=this.ringToWrist.getTransform();
    this.ringToWristTransformProp = StorageProperty.forTransform(
      this.ringToWristTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.ringToWristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.ringKnuckleTransform=this.ringKnuckle.getTransform();
    this.ringKnuckleTransformProp = StorageProperty.forTransform(
      this.ringKnuckleTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.ringKnuckleTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.ringMidJointTransform=this.ringMidJoint.getTransform();
    this.ringMidJointTransformProp = StorageProperty.forTransform(
      this.ringMidJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.ringMidJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.ringUpperJointTransform=this.ringUpperJoint.getTransform();
    this.ringUpperJointTransformProp = StorageProperty.forTransform(
      this.ringUpperJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.ringUpperJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.ringTipTransform=this.ringTip.getTransform();
    this.ringTipTransformProp = StorageProperty.forTransform(
      this.ringTipTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.ringTipTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.pinkyToWristTransform=this.pinkyToWrist.getTransform();
    this.pinkyToWristTransformProp = StorageProperty.forTransform(
      this.pinkyToWristTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.pinkyToWristTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.pinkyKnuckleTransform=this.pinkyKnuckle.getTransform();
    this.pinkyKnuckleTransformProp = StorageProperty.forTransform(
      this.pinkyKnuckleTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.pinkyKnuckleTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.pinkyMidJointTransform=this.pinkyMidJoint.getTransform();
    this.pinkyMidJointTransformProp = StorageProperty.forTransform(
      this.pinkyMidJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.pinkyMidJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.pinkyUpperJointTransform=this.pinkyUpperJoint.getTransform();
    this.pinkyUpperJointTransformProp = StorageProperty.forTransform(
      this.pinkyUpperJointTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.pinkyUpperJointTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit
    
    this.pinkyTipTransform=this.pinkyTip.getTransform();
    this.pinkyTipTransformProp = StorageProperty.forTransform(
      this.pinkyTipTransform,
      propertyTypeFromString("None"),
      propertyTypeFromString("Local"),
      this.scaleSync,
      this.useSmoothing ? {interpolationTarget: this.interpolationTarget} : null
    )
    this.pinkyTipTransformProp.sendsPerSecondLimit = this.sendsPerSecondLimit

    const storageProps = new StoragePropertySet([
      this.handVisualTransformProp,
      this.wristTransformProp,
      this.thumbToWristTransformProp,
      this.thumbBaseJointTransformProp,
      this.thumbKnuckleTransformProp,
      this.thumbMidJointTransformProp,
      this.thumbTipTransformProp,
      this.indexToWristTransformProp,
      this.indexKnuckleTransformProp,
      this.indexMidJointTransformProp,
      this.indexUpperJointTransformProp,
      this.indexTipTransformProp,
      this.middleToWristTransformProp,
      this.middleKnuckleTransformProp,
      this.middleMidJointTransformProp,
      this.middleUpperJointTransformProp,
      this.middleTipTransformProp,
      this.ringToWristTransformProp,
      this.ringKnuckleTransformProp,
      this.ringMidJointTransformProp,
      this.ringUpperJointTransformProp,
      this.ringTipTransformProp,
      this.pinkyToWristTransformProp,
      this.pinkyKnuckleTransformProp,
      this.pinkyMidJointTransformProp,
      this.pinkyUpperJointTransformProp,
      this.pinkyTipTransformProp
    ])

    this.syncEntity = new SyncEntity(
      this,
      storageProps,
      true,
      this.persistence,
      new NetworkIdOptions(this.networkIdType, this.customNetworkId)
    )

    this.syncEntity.notifyOnReady(() => this.onReady());
  }

  onReady(){
    this.handVisualChangeEvent = this.syncEntity.getEntityEventWrapper("handVisualChange");
    this.handVisualChangeEvent.onEventReceived.add(this.handVisualChangeReceived.bind(this));
    if(this.syncEntity.doIOwnStore()){
      if(this.handType=='left'){
        this.hand = this.handProvider.getHand('left');
      }
      else{
        this.hand = this.handProvider.getHand('right');
      }
      this.hand.onHandFound.add(this.showVisual.bind(this));
      this.hand.onHandLost.add(this.hideVisual.bind(this));
    }
  }

  handVisualChangeReceived(message: any){
    print("hand event");
    if(!this.syncEntity.doIOwnStore()){
      this.handMesh.getSceneObject().enabled=message.data.state;
    }
  }

  showVisual(){
    this.handVisualChangeEvent.send({
      state: true,
    })
  }

  hideVisual(){
    this.handVisualChangeEvent.send({
      state: false,
    })
  }
 
}
