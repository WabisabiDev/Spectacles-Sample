// The TeamSelectionInput class defines the input components
// necessary for the proper functioning of the TeamSelection class.
@component
export class TeamSelectionInput extends BaseScriptComponent {

  // Root scene object that serves as the container for the value control UI
  @input
  readonly root: SceneObject

  // Text component used to display the current counter value
  @input
  readonly valueText: Text

  // PinchButton component for incrementing the counter value (value up button)
  /*@input
  readonly joinButton: PinchButton

  // PinchButton component for decrementing the counter value (value down button)
  @input
  readonly leaveButton: PinchButton
*/
}
