import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {GroupRandomizerInput} from "./GroupRandomizerInput"
import {Callback, createCallbacks} from "SpectaclesUIKit.lspkg/Scripts/Utility/SceneUtilities"

@component
export class GroupRandomizer extends BaseScriptComponent {

    @input 
    timeToRandom: number;

    @input 
    maxTimeBetween: number;

    @input 
    spotsOnRandom: number;

    @input 
    inputUI : GroupRandomizerInput;

    @input 
    randomValues : string[];

    selectionAProperty = StorageProperty.manualInt("A", 0);
    selectionBProperty = StorageProperty.manualInt("B", 0);
    selectionCProperty = StorageProperty.manualInt("C", 0);
    isRandomizingProperty = StorageProperty.manualBool("randomizing", false);
    randomSequenceProperty = StorageProperty.manualIntArray("sequence", []);

    private storagePropertySet = new StoragePropertySet([
        this.selectionAProperty,
        this.selectionBProperty,
        this.selectionCProperty,
        this.isRandomizingProperty,
        this.randomSequenceProperty
    ]);

    private syncEntity = new SyncEntity(this, this.storagePropertySet, false);

    private selectionFunctions=[
        this.selectA.name,
        this.selectB.name,
        this.selectC.name,
    ];

    private delayedRandom: DelayedCallbackEvent;

    private actualTime: number;
    private randomTime: number;
    private randomIndex: number;
    private currentSequence: number[];
    
    onAwake() {
        this.syncEntity.notifyOnReady(() => this.onReady());
        this.selectionAProperty.onAnyChange.add(this.onSelectionAChange.bind(this));
        this.selectionBProperty.onAnyChange.add(this.onSelectionBChange.bind(this));
        this.selectionCProperty.onAnyChange.add(this.onSelectionCChange.bind(this));
        this.isRandomizingProperty.onAnyChange.add(this.isRandomizingChange.bind(this));
        this.randomSequenceProperty.onAnyChange.add(this.playRandomize.bind(this));
        this.delayedRandom = this.createEvent("DelayedCallbackEvent");
        this.delayedRandom.bind(this.randomize.bind(this));
        this.actualTime=0;
        this.randomTime=0;
    }

    onReady(){
        for(var i=0;i<3;i++){
            let callback=[new Callback()];
            callback[0].scriptComponent=this;
            callback[0].functionName=this.selectionFunctions[i];
            this.inputUI.selectionButton[i].onTriggerDown.add(createCallbacks(callback));
        }
        let rollCallback=[new Callback()];
        rollCallback[0].scriptComponent=this;
        rollCallback[0].functionName=this.rollSelection.name;
        this.inputUI.rollButton.onTriggerDown.add(createCallbacks(rollCallback));
        this.setAUI(this.selectionAProperty.currentOrPendingValue);
        this.setBUI(this.selectionBProperty.currentOrPendingValue);
        this.setCUI(this.selectionBProperty.currentOrPendingValue);
        this.setRollBtnText(this.isRandomizingProperty.currentOrPendingValue);
    }

    onSelectionAChange(newValue, oldValue){
        this.setAUI(newValue);
    }

    setAUI(newValue: number){
        this.inputUI.valueText[0].text=newValue+'';
    }

    selectA(){
        let aSelected=this.selectionAProperty.currentOrPendingValue;
        this.selectionAProperty.setPendingValue(aSelected+1);
    }

    onSelectionBChange(newValue, oldValue){
        this.setBUI(newValue);
    }

    setBUI(newValue: number){
        this.inputUI.valueText[1].text=newValue+'';
    }

    selectB(){
        let bSelected=this.selectionBProperty.currentOrPendingValue;
        this.selectionBProperty.setPendingValue(bSelected+1);
    }

    onSelectionCChange(newValue, oldValue){
        this.setCUI(newValue);
    }

    setCUI(newValue: number){
        this.inputUI.valueText[2].text=newValue+'';
    }

    selectC(){
        let cSelected=this.selectionCProperty.currentOrPendingValue;
        this.selectionCProperty.setPendingValue(cSelected+1);
    }

    rollSelection(){
        this.isRandomizingProperty.setPendingValue(true);
        this.preRandomize();
    }

    isRandomizingChange(newValue, oldValue){
        this.setRollBtnText(newValue);
    }

    setRollBtnText(state: boolean){
        if(state){
            this.inputUI.rollButtonText.text="Randomizing";
            this.inputUI.rollButton.inactive=true;
        }
        else{
            this.inputUI.rollButtonText.text="Roll Selection";
            this.inputUI.rollButton.inactive=false;
        }
    }

    preRandomize(){
        let spotsRemaining=this.spotsOnRandom;
        let actualIndex=-1;
        let spotsToSave=[];
        let votesA=this.selectionAProperty.currentOrPendingValue;
        let votesB=this.selectionBProperty.currentOrPendingValue;
        let votesC=this.selectionCProperty.currentOrPendingValue;
        let totalVotes=votesA+votesB+votesC;
        let noVotes=false;
        if(totalVotes==0){
            noVotes=true;
            totalVotes=3;
        }
        while(spotsRemaining>0){
            spotsRemaining-=1;
            var tempIndex=Math.floor(Math.random()*(totalVotes-.1));
            if(noVotes){
                if(tempIndex==actualIndex){
                    tempIndex++;
                    tempIndex=tempIndex%this.selectionFunctions.length;
                }
            }
            else{
                if(tempIndex<votesA){
                    tempIndex=0;
                }
                else if(tempIndex<votesA+votesB){
                    tempIndex=1;
                }
                else{
                    tempIndex=2;
                }
            }
            actualIndex=tempIndex;
            spotsToSave.push(actualIndex);
        }
        this.randomSequenceProperty.setPendingValue(spotsToSave);
    }

    playRandomize(newValue, oldValue){
        this.currentSequence=newValue;
        this.randomTime=0;
        this.randomIndex=0;
        this.actualTime=0;
        if(newValue.length>0){
            this.randomize();
        }
    }

    randomize(){
        if(this.actualTime<this.timeToRandom && this.randomIndex<this.currentSequence.length){
            if(this.randomIndex!=-1){
                this.actualTime+=this.randomTime;
            }
            if(this.randomTime<this.maxTimeBetween){
                this.randomTime+=0.0125;
                if(this.randomTime>this.maxTimeBetween){
                    this.randomTime=this.maxTimeBetween;
                }
            }
            this.inputUI.randomizedText.text=this.randomValues[this.currentSequence[this.randomIndex]];
            this.randomIndex+=1;
            this.delayedRandom.reset(this.randomTime);
        }
        else{
            this.inputUI.randomizedText.text=this.randomValues[this.currentSequence[this.currentSequence.length-1]];
            this.resetSelections();
        }
    }

    resetSelections(){
        this.selectionAProperty.setPendingValue(0);
        this.selectionBProperty.setPendingValue(0);
        this.selectionCProperty.setPendingValue(0);
        this.isRandomizingProperty.setPendingValue(false);
    }
}
