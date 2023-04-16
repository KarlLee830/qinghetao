
class Store {
    store = null;
    getStore() {
        return this.store;
    }
    setStore(store) {
       this.store = store;
    }
}

const store = new Store();

export default store;