@component
export class LocalStorageManagerExample extends BaseScriptComponent {

    // Variables
    // ------------------------------------------------------

    @input()
    cloudStorageModule : CloudStorageModule;

    // Cloud store
    cloudeStore : CloudStore;

    // Persistent store
    persistentStore : GeneralDataStore;

    // Methods
    // ------------------------------------------------------

    async initStorage() {
        // Get the cloud store
        if(global.deviceInfoSystem.isEditor() || !global.deviceInfoSystem.isSpectacles()) {
            this.cloudeStore = await this.getCloudStore();
        }
        else {
            this.persistentStore = this.getPersistentStorage();
        }
    }

    async getNumber(key : string) {
        if(this.cloudeStore) {
            const readOptions = CloudStorageReadOptions.create();
            readOptions.scope = StorageScope.User;
            return await new Promise<number>((resolve, reject) => {
                this.cloudeStore.getValue(
                    key,
                    readOptions,
                    function onRetrieved(key: string, value: any) {
                        print("Retrieved value: " + value);
                        resolve(value);
                    },
                    function onError(code: string, message: string) {
                        print('getValue ' + key + ' Error: ' + code + ' ' + message);
                        resolve(0);
                    }
                );
            });
        }
        else if(this.persistentStore) {
            let storedValue = this.persistentStore.getInt(key);
            print("Retrieved " + key + " value: " + storedValue);
            return storedValue;
        }
    }

    async setNumber(key : string, value : number) {
        if(this.cloudeStore) {
            const writeOptions = CloudStorageWriteOptions.create();
            writeOptions.scope = StorageScope.User;
            await new Promise<void>((resolve, reject) => {
                this.cloudeStore.setValue(
                    key,
                    value,
                    writeOptions,
                    function onSuccess() {
                        print("Store key " + key + " in cloud storage: " + value);
                        resolve();
                    },
                    function onError(code : string, message : string) {
                        print('setValue: ' + key + ' Error: ' + code + ' ' + message);
                        reject(message);
                    }
                )
            });
        }
        else if(this.persistentStore) {
            print("Store key " + key + " in fallback persistent storage: " + value);
            return this.persistentStore.putInt(key, value);
        }
    }

    async remove(key : string) {
        if(this.cloudeStore) {
            const readOptions = CloudStorageReadOptions.create();
            readOptions.scope = StorageScope.User;
            await new Promise<void>((resolve, reject) => {
                this.cloudeStore.deleteValue(
                    key,
                    readOptions,
                    function onSuccess() {
                        print("Store key " + key + " in cloud storage removed");
                        resolve();
                    },
                    function onError(code : string, message : string) {
                        print('delete Value Error: ' + code + ' ' + message);
                        reject(message);
                    }
                )
            });
        }
        else if(this.persistentStore) {
            print("Remove key " + key + " from fallback persistent storage");
            return this.persistentStore.remove(key);
        }
    }

    private async getCloudStore() {
        const cloudStorageOptions = CloudStorageOptions.create();
        return await new Promise<CloudStore>(function(resolve, reject) {
            this.cloudStorageModule.getCloudStore(cloudStorageOptions, 
                function onRead(cloudStore : CloudStore) {
                    print("CloudStore ready");
                    resolve(cloudStore);
                }.bind(this), 
                function onError(code : string, message : string) {
                    print("Error getting CloudStore: " + code + " " + message);
                    reject(message);
                }.bind(this)
            );
        }.bind(this));
    }

    private getPersistentStorage() {
        return global.persistentStorageSystem.store;
    }
}