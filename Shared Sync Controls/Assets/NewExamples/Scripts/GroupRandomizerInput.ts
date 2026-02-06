import {CapsuleButton} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton"
// The GroupRandomizerInput class defines the input components
// necessary for the proper functioning of the TeamSelection class.
@component
export class GroupRandomizerInput extends BaseScriptComponent {

  // Root scene object that serves as the container for the value control UI
  @input
  readonly root: SceneObject

  // Text component used to display the current counter value
  @input
  readonly randomizedText: Text

  // Text component used to display the current counter value
  @input
  readonly valueText: Text[]

  // PinchButton component for incrementing the counter value (value up button)
  @input
  readonly selectionButton: CapsuleButton[]

  // PinchButton component for incrementing the counter value (value up button)
  @input
  readonly rollButton: CapsuleButton

  // PinchButton component for incrementing the counter value (value up button)
  @input
  readonly rollButtonText: Text
}
