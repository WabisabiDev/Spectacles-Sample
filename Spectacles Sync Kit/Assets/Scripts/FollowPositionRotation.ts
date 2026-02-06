@component
export class FollowPosition extends BaseScriptComponent {
    @input
    target: SceneObject;

    private myTransform: Transform;

    private targetTransform: Transform;

    onAwake() {
        this.myTransform=this.getTransform();
        if(isNull(this.target)){
            print("Add a target to follow their position")
            return;
        }
        this.targetTransform=this.target.getTransform();
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate(){
        this.myTransform.setWorldPosition(this.targetTransform.getWorldPosition());
        this.myTransform.setWorldRotation(this.targetTransform.getWorldRotation());
    }
}
