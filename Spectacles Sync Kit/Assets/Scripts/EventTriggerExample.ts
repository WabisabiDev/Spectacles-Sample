import {SyncEntity, EntityEventWrapper} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {ScoreboardExample} from "Scripts/ScoreboardExample"

@component
export class EventTriggerExample extends BaseScriptComponent {

    @input
    trigger : BodyComponent;

    @input
    nameOfTrigger : string;

    @input
    scoreboard : ScoreboardExample;

    private eventTriggerExample : EntityEventWrapper<unknown>;

    private syncEntity : SyncEntity;

    onAwake() {
        this.syncEntity=new SyncEntity(this,null,false);
        this.trigger.onOverlapEnter.add(this.onOverlapEnter.bind(this));
        this.syncEntity.notifyOnReady(() => this.onReady());
    }

    onReady(){
        this.eventTriggerExample = this.syncEntity.getEntityEventWrapper("onEventTrigger");
        this.eventTriggerExample.onEventReceived.add(this.onEventTriggerReceived.bind(this));
    }

    private onEventTriggerReceived(message : any){
        if(message.data.trigger){
            this.scoreboard.addScore();
        }
    }

    sendEventTrigger(triggerValue: boolean){
        if(isNull(this.eventTriggerExample)){
            if(triggerValue){
                this.scoreboard.addScore();
            }
            return;
        }
        this.eventTriggerExample.send({
            //This could be any data structure, for this example it is called anyMessage
            trigger: triggerValue,
        });
    }

    onOverlapEnter(e: OverlapEnterEventArgs){
        const overlap=e.overlap;
        if(overlap.collider.getSceneObject().name==this.nameOfTrigger){
            this.sendEventTrigger(true);
        }
    }
}
