// 1、插件： $store
// 2、Store类：保存响应式状态state、方法：commit()/dispatch()

let _Vue = null;
class Store {
    constructor(options) {
        this._mutations = options.mutations;
        this._actions = options.actions;
        // 利用vue做响应式数据
        this._vm = new _Vue({
            data: {
                $$state: options.state
            }
        });

        // 绑定this, 否则this的指向会乱
        this.commit = this.commit.bind(this);
        this.dispatch = this.dispatch.bind(this);
    }

    get state() {
        return this._vm._data.$$state
    }

    set state(v) {
        console.error('请不要直接修改state')
    }

    commit(type, payload) {
        const entry = this._mutations[type];

        if (!entry) {
            console.error('不存在的mutation');
            return
        }

        entry(this.state, payload)
    }

    dispatch(type, payload) {
        const out = this._actions[type];

        if (!out) {
            console.error('不存在的action');
            return
        }
        out(this, payload)
    }
}

function install (Vue) {
    _Vue = Vue;

    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}

export default {
    Store,
    install
}